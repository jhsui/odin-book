import { type NextFunction, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth, { requireNotAnonymous } from "../middleware/requireAuth.ts";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import multer from "multer";
import path from "node:path";
import supabase from "../lib/supabase.ts";
import { randomUUID } from "node:crypto";
import {
  userIntroValidator,
  userNewNameValidator,
} from "../middleware/validators.ts";
import { matchedData, validationResult } from "express-validator";

const followUser = [
  requireNotAnonymous,

  async (req: Request, res: Response) => {
    const { followingId } = req.params;
    const followerId = res.locals.session.user.id;

    if (typeof followingId !== "string" || followingId.length === 0) {
      return res.status(400).json({
        message: "followingId must be a non-empty string",
      });
    }

    if (followerId === followingId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const follow = await prisma.userFollow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      create: {
        followerId,
        followingId,
      },
      update: {},
    });

    return res.status(200).json({
      message: "User followed",
      follow,
    });
  },
];

const unfollowUser = [
  requireNotAnonymous,

  async (req: Request, res: Response) => {
    const { followingId } = req.params;
    const followerId = res.locals.session.user.id;

    if (typeof followingId !== "string" || followingId.length === 0) {
      return res.status(400).json({
        message: "followingId must be a non-empty string",
      });
    }

    await prisma.userFollow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    return res.status(204).send({
      message: "User unfollowed",
    });
  },
];

const getAllUsers = [
  async (req: Request, res: Response) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          isAnonymous: true,
        },
        orderBy: [{ name: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      });

      return res.json({
        users: users.map((user) => ({
          ...user,
          isFollowing: false,
        })),
      });
    }

    const currentUserId = session.user.id;
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        followers: {
          where: {
            followerId: currentUserId,
          },
          select: {
            followerId: true,
          },
        },
        isAnonymous: true,
      },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    const result = users.map(({ followers, ...user }) => ({
      ...user,
      isFollowing: followers.length > 0,
    }));

    return res.json({ users: result });
  },
];

const getFollowStatus = [
  requireAuth,

  async (req: Request, res: Response) => {
    const { followingId } = req.params;
    const followerId = res.locals.session.user.id;

    if (typeof followingId !== "string" || followingId.length === 0) {
      return res.status(400).json({
        message: "followingId must be a non-empty string",
      });
    }

    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    const isFollowing = follow !== null;

    return res.json({ isFollowing });
  },
];

const getUserProfile = [
  async (req: Request, res: Response) => {
    // Prevent caching the response containing the temporary avatar URL
    res.set("Cache-Control", "no-store");

    let userId = "";

    if (res.locals.isOwnProfile) {
      userId = res.locals.session.user.id;
    } else {
      const paramId = req.params.userId;

      if (typeof paramId !== "string") {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      userId = paramId;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        intro: true,
        posts: {
          orderBy: { createdAt: "desc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.image || /^https?:\/\//i.test(user.image)) {
      return res.json({
        user: {
          ...user,
          image: user.image || null,
        },
      });
    }

    const { data, error } = await supabase.storage
      .from("user-avatars")
      .createSignedUrl(user.image, 3600);

    if (error) {
      console.error("Failed to sign avatar URL:", error.message);
      return res.status(500).json({ message: "Failed to load avatar." });
    }

    return res.json({
      user: {
        ...user,
        image: data.signedUrl,
      },
    });
  },
];

const getUserOwnProfile = [
  requireNotAnonymous,

  async (_req: Request, res: Response, next: NextFunction) => {
    res.locals.isOwnProfile = true;
    next();
  },

  ...getUserProfile,
];

// const getAvatar = [
//   requireNotAnonymous,

//   async (_req: Request, res: Response) => {
//     // Prevent caching the response containing the temporary avatar URL
//     res.set("Cache-Control", "no-store");

//     const user = await prisma.user.findUnique({
//       where: { id: res.locals.session.user.id },
//       select: { image: true },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     if (!user.image || /^https?:\/\//i.test(user.image)) {
//       return res.json({ image: user.image || null });
//     }

//     const { data, error } = await supabase.storage
//       .from("user-avatars")
//       .createSignedUrl(user.image, 3600);

//     if (error) {
//       console.error("Failed to sign avatar URL:", error.message);
//       return res.status(500).json({ message: "Failed to load avatar." });
//     }

//     return res.json({ image: data.signedUrl });
//   },
// ];

const upload = multer({ storage: multer.memoryStorage() });
const uploadNewAvatar = [
  requireNotAnonymous,

  upload.single("avatar"),

  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file received." });
    }

    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;

    const { data, error } = await supabase.storage
      .from("user-avatars")
      .upload(uniqueName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Upload failed." });
    }

    const userId = res.locals.session.user.id;
    if (typeof userId !== "string" || userId.length === 0) {
      return res.status(400).json({
        message: "Bad user id",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        image: uniqueName,
      },
    });

    res.status(200).json({
      message: "Avatar uploaded.",
      path: data.path,
    });
  },
];

const changeName = [
  ...userNewNameValidator,
  requireNotAnonymous,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "New username validation failed",
        // todo: add error page
        errors: errors.array(),
      });
    }

    const { newName } = matchedData(req);
    const userId = res.locals.session.user.id;

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: newName,
      },
    });

    return res.json({ message: "Username updated successfully" });
  },
];

const changeIntro = [
  requireNotAnonymous,

  ...userIntroValidator,

  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Intro validation failed",
        errors: errors.array(),
      });
    }

    const { intro } = matchedData(req);

    const user = await prisma.user.update({
      where: { id: res.locals.session.user.id },
      data: { intro: intro || null },
      select: { intro: true },
    });

    return res.json({
      message: "Intro updated successfully",
      intro: user.intro,
    });
  },
];

// const getIntro = [
//   requireNotAnonymous,
//   async (_req: Request, res: Response) => {
//     res.set("Cache-Control", "no-store");

//     const user = await prisma.user.findUnique({
//       where: { id: res.locals.session.user.id },
//       select: { intro: true },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     return res.json(user);
//   },
// ];

export default {
  followUser,
  unfollowUser,
  getAllUsers,
  getFollowStatus,
  uploadNewAvatar,
  changeName,
  changeIntro,
  getUserOwnProfile,
  getUserProfile,
};
