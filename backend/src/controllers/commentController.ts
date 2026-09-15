import { commentValidator } from "../middleware/validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth, { requireNotAnonymous } from "../middleware/requireAuth.ts";
import { getAvatarUrl } from "./userController.ts";

const postComment = [
  ...commentValidator,

  requireAuth,

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { comment } = matchedData(req);

    const userId = res.locals.session.user.id;

    const { postId } = req.params;
    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    await prisma.comment.create({
      data: {
        content: comment,
        author: {
          connect: { id: userId },
        },
        post: {
          connect: { id: postId },
        },
      },
    });

    return res.status(201).json({
      message: "Comment submitted successfully",
    });
  },
];

const getComments = [
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    if (typeof postId !== "string" || postId.length === 0) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            isAnonymous: true,
          },
        },
      },
    });

    await Promise.all(
      comments.map(async (comment) => {
        comment.author.image = await getAvatarUrl(comment.author.image);
      }),
    );

    return res.json({ comments });
  },
];

const deleteComment = [
  requireAuth,

  async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = res.locals.session.user.id;

    if (typeof commentId !== "string") throw Error("Invalid comment id");

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== userId) {
      throw Error("User does have the authority to delete this comment");
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return res.status(204).send();
  },
];

export default { postComment, getComments, deleteComment };
