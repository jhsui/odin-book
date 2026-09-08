import { commentValidator } from "../middleware/validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth, { requireNotAnonymous } from "../middleware/requireAuth.ts";

const postComment = [
  ...commentValidator,
  requireNotAnonymous,
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
            name: true,
          },
        },
      },
    });

    return res.json({ comments });
  },
];

export default { postComment, getComments };
