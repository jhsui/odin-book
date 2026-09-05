import { type Request, type Response, type NextFunction } from "express";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
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
};

// stricter
const requireNotAnonymous = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session || session.user.isAnonymous) {
    return res
      .status(403)
      .json({ message: "A registered account is required" });
  }

  res.locals.session = session;
  next();
};

export { requireNotAnonymous };
export default requireAuth;
