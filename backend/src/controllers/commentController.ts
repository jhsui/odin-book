import { commentValidator } from "../validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth from "../middleware/requireAuth.ts";

const postComment = [
  ...commentValidator,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
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

      res.status(201).json({
        message: "Your comment submitted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
];

const getComments = [
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      res.json({ comments });
    } catch (error) {
      next(error);
    }
  },
];

export default { postComment, getComments };
