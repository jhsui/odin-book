import { writingPostValidator } from "../validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth from "../middleware/requireAuth.ts";

const writingPostController = [
  ...writingPostValidator,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
        message: "Your post submitted successfully.",
      });

      return;
    } catch (error) {
      next(error);
    }
  },
];

const getAllPosts = [
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await prisma.post.findMany({
        // todo: allow to switch sort
        orderBy: {
          createdAt: "desc",
        },
      });
      res.json({ posts });
    } catch (error) {
      next(error);
    }
  },
];

export default { writingPostController, getAllPosts };
