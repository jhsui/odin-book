import { signUpValidator } from "../validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response, type NextFunction } from "express";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.ts";

const signUpController = [
  ...signUpValidator,

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    try {
      const { email, password } = matchedData(req);
      const hashedPassword = await argon2.hash(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      res.status(201).json({
        message: "Sign up successfully.",
        user,
      });
      return;
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({
          message: "Server error",
          err: err.message,
        });
        return;
      }

      console.log(err);
      res.status(500).json({
        message: "Unknown error",
      });
    }
  },
];

export default { signUpController };
