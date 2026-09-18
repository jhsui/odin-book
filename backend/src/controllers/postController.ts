import { writingPostValidator } from "../middleware/validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth, { requireNotAnonymous } from "../middleware/requireAuth.ts";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import { getAvatarUrl } from "./userController.ts";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import supabase from "../lib/supabase.ts";

const uploadPostImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 4, // Maximum 4 images.
    fileSize: 5 * 1024 * 1024, // 5 MiB per image.
  },
});

const createPost = [
  requireNotAnonymous,

  uploadPostImages.array("images", 4),

  ...writingPostValidator,

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Post content validation failed",
        errors: errors.array(),
      });
    }

    const { title, content } = matchedData(req);
    const userId = res.locals.session.user.id;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: { id: userId },
        },
      },
    });

    const images = req.files;

    if (Array.isArray(images) && images.length > 0) {
      for (const [position, img] of images.entries()) {
        const ext = path.extname(img.originalname);
        const uniqueName = `${randomUUID()}${ext}`;

        const { error } = await supabase.storage
          .from("post-images")
          .upload(uniqueName, img.buffer, {
            contentType: img.mimetype,
          });

        if (error) {
          console.error(error);
          continue;
          // todo: allow other imgs to upload
          // return res.status(500).json({ message: "Failed to upload image." });
        }

        await prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            images: {
              create: {
                path: uniqueName,
                position,
              },
            },
          },
        });
      }
    }

    return res.status(201).json({
      message: "Post submitted successfully",
    });
  },
];

const getAllPosts = [
  async (req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
      // todo: allow to switch sort
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.json({ posts });
  },
];

const getPostById = [
  async (req: Request, res: Response) => {
    const { postId } = req.params;

    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    post.author.image = await getAvatarUrl(post.author.image);

    return res.json({ post });
  },
];

// Anon guest can like posts.
const getLikeStatus = [
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({
        message: "Bad postId",
      });
    }

    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      const userId = session.user.id;

      const existingLike = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      if (existingLike) {
        return res.json({ liked: true, likeCount });
      }
    }

    return res.json({ liked: false, likeCount });
  },
];

// todo: separate
const togglePostLike = [
  requireAuth,

  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = res.locals.session.user.id;

    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({
        message: "postId must be a non-empty string",
      });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      const likeCount = await prisma.postLike.count({
        where: {
          postId,
        },
      });

      return res.json({
        message: "Like cancelled",
        currentLike: false,
        likeCount,
      });
    }

    await prisma.postLike.create({
      data: {
        userId,
        postId,
      },
    });

    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    return res.json({ message: "Liked", currentLike: true, likeCount });
  },
];

const getPostIndex = [
  async (req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { title: "asc" }, { id: "asc" }],
    });

    return res.json({ posts });
  },
];

const deletePost = [
  requireNotAnonymous,

  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = res.locals.session.user.id;

    if (typeof postId !== "string") throw Error("Invalid post id.");

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        message: "You do not have permission to delete this post.",
      });
    }

    await prisma.post.delete({ where: { id: postId } });

    return res.status(204).send();
  },
];

export default {
  createPost,
  getAllPosts,
  getPostById,
  getLikeStatus,
  togglePostLike,
  getPostIndex,
  deletePost,
};
