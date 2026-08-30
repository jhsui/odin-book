import { type Request, type Response, type NextFunction } from "express";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        message: "User is not signed in.",
      });
      return;
    }

    res.locals.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
