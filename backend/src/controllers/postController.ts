import { writingPostValidator } from "../middleware/validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth, { requireNotAnonymous } from "../middleware/requireAuth.ts";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import supabase from "../lib/supabase.ts";
import { batchGetImageUrls, getImageUrl } from "./utils.ts";

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
    // Validate title and content.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Post content validation failed.",
        errors: errors.array(),
      });
    }

    const { title, content } = matchedData(req);
    const userId = res.locals.session.user.id;

    let postSaved = false;
    const post = await prisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: { id: userId },
        },
      },
    });
    postSaved = true;

    const images = Array.isArray(req.files) ? req.files : [];

    const imageSaved: string[] = [];

    for (const [position, img] of images.entries()) {
      const ext = path.extname(img.originalname);
      // Image name to be stored in Supabase.
      const uniqueName = `${randomUUID()}${ext}`;

      try {
        const { error } = await supabase.storage
          .from("post-images")
          .upload(uniqueName, img.buffer, {
            contentType: img.mimetype,
          });

        if (error) {
          throw error; // If the error is truthy, jump straight to catch.
        }

        imageSaved.push(uniqueName);

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
      } catch (error) {
        console.error("Failed to save post image:", error);
        // Remove the image saved in Supabase.
        // Use for...of to await the finish of the remove.
        for (const uniqueName of imageSaved) {
          try {
            const { error: cleanupError } = await supabase.storage
              .from("post-images")
              .remove([uniqueName]);

            if (cleanupError) throw cleanupError;
          } catch (cleanupImageError) {
            console.error(
              "Failed to clean up uploaded image:",
              uniqueName,
              cleanupImageError,
            );
          }
        }

        // Clear up post in the database.
        if (postSaved) {
          try {
            await prisma.post.delete({
              where: { id: post.id },
            });
          } catch (cleanupPostError) {
            console.error(
              "Failed to clean up uploaded post:",
              post.title,
              cleanupPostError,
            );
          }
        }

        return res.status(500).json({
          message: "Failed to submit the post. Please try again later.",
        });
      }
    }

    return res.status(201).json({
      postId: post.id,
      message: "Post submitted successfully.",
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
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
        },
        comments: {},
      },
    });

    for (const post of posts) {
      post.author.image = await getImageUrl(post.author.image, "user-avatars");
      for (const image of post.images) {
        const url = await getImageUrl(image.path, "post-images");

        if (url) {
          image.path = url;
        }
      }
    }

    return res.json({ posts });
  },
];

// For tanstack query.
// pageParam from 1.
const getPostsForDashboard = [
  async (req: Request, res: Response) => {
    const { pageParam } = req.query;
    const currentPage = Number(pageParam);

    const LIMIT = 10;
    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / LIMIT);

    const posts = await prisma.post.findMany({
      skip: LIMIT * currentPage,
      take: LIMIT,
      // todo: allow to switch sort
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Gather paths from the entire page.
    const avatarPaths = posts.map((post) => post.author.image);

    // Flat arrays into one array.
    const imagePaths = posts.flatMap((post) =>
      post.images.map((image) => image.path),
    );

    // Start the two batch requests together.
    const [avatarUrls, imageUrls] = await Promise.all([
      batchGetImageUrls(avatarPaths, "user-avatars"),
      batchGetImageUrls(imagePaths, "post-images"),
    ]);

    for (const post of posts) {
      if (post.author.image) {
        post.author.image = avatarUrls.get(post.author.image) ?? null;
      }

      for (const image of post.images) {
        image.path = imageUrls.get(image.path) ?? image.path;
      }
    }

    return res.json({
      data: posts,
      currentPage: currentPage,
      nextPage: currentPage + 1 < totalPages ? currentPage + 1 : null,
    });
  },
];

const getPostById = [
  async (req: Request, res: Response) => {
    const { postId } = req.params;

    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({ error: "Invalid post ID." });
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
        images: {
          select: {
            id: true,
            path: true,
            position: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found.",
      });
    }

    post.author.image = await getImageUrl(post.author.image, "user-avatars");

    if (post.images && post.images.length > 0) {
      for (const imgObj of post.images) {
        // todo: is it the way to get it?
        const tempPath = await getImageUrl(imgObj.path, "post-images");
        if (tempPath) {
          imgObj.path = tempPath;
        }
      }
    }

    return res.json({ post });
  },
];

// Anonymous guest can like posts.
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

const putPostLike = [
  requireAuth,

  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = res.locals.session.user.id;

    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({
        message: "postId must be a non-empty string.",
      });
    }

    await prisma.postLike.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      update: {},
      create: {
        userId,
        postId,
      },
    });

    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    return res.json({
      message: "Liked.",
      currentLike: true,
      likeCount,
    });
  },
];

const deletePostLike = [
  requireAuth,

  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = res.locals.session.user.id;

    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({
        message: "postId must be a non-empty string.",
      });
    }

    await prisma.postLike.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    return res.json({
      message: "Like cancelled.",
      currentLike: false,
      likeCount,
    });
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
      include: {
        images: {
          select: {
            id: true,
            path: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        message: "You do not have permission to delete this post.",
      });
    }

    const images = Array.isArray(post.images) ? post.images : [];

    for (const { path } of images) {
      try {
        const { error: cleanupError } = await supabase.storage
          .from("post-images")
          .remove([path]);

        if (cleanupError) throw cleanupError;
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded image:", path, cleanupError);
      }
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
  putPostLike,
  deletePostLike,
  getPostIndex,
  deletePost,
  getPostsForDashboard,
};
