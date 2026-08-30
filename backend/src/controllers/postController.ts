import { writingPostValidator } from "../validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth from "../middleware/requireAuth.ts";

const createPost = [
  ...writingPostValidator,
  requireAuth,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation failed",
        // todo: add error page
        errors: errors.array(),
      });
      return;
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

    res.status(201).json({
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
    res.json({ posts });
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
            name: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    res.json({ post });
  },
];

const getLikeStatus = [
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

    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    if (existingLike) {
      res.json({ liked: true, likeCount });
      return;
    }

    res.json({ liked: false, likeCount });
  },
];

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

      res.json({ message: "Like cancelled.", currentLike: false, likeCount });
      return;
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

    res.json({ message: "Liked.", currentLike: true, likeCount });
  },
];

export default {
  createPost,
  getAllPosts,
  getPostById,
  getLikeStatus,
  togglePostLike,
};
