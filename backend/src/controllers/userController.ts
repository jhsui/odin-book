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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        isAnonymous: true,
        followers: session
          ? {
              where: { followerId: session.user.id },
              // Select the user of the current session:
              select: { followerId: true },
            }
          : false,
      },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    // Map users that current session user is following
    const result = await Promise.all(
      users.map(async ({ followers, ...user }) => ({
        ...user,
        image: await getAvatarUrl(user.image),
        isFollowing: (followers?.length ?? 0) > 0,
      })),
    );

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

export async function getAvatarUrl(
  path: string | null,
): Promise<string | null> {
  if (!path || /^https?:\/\//i.test(path)) return path || null;

  const { data, error } = await supabase.storage
    .from("user-avatars")
    .createSignedUrl(path, 3600);

  if (error) {
    console.error("Failed to sign avatar URL:", error.message);
    return null;
  }

  return data.signedUrl;
}

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
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Get avatar for every user shown in the connections dialog.
    const connectionUsers = [
      ...user.followers.map(({ follower }) => follower),
      ...user.following.map(({ following }) => following),
    ];

    const avatarUrls = new Map<string | null, Promise<string | null>>();

    await Promise.all(
      connectionUsers.map(async (user) => {
        const path = user.image;

        if (!avatarUrls.has(path)) {
          avatarUrls.set(path, getAvatarUrl(path));
        }

        user.image = await avatarUrls.get(path)!;
      }),
    );

    return res.json({
      user: {
        ...user,
        image: await getAvatarUrl(user.image),
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MiB
  },
});

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
  requireNotAnonymous,

  ...userNewNameValidator,

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
