import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.ts";
import requireAuth from "../middleware/requireAuth.ts";
import { auth } from "../lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";

const followUser = [
  requireAuth,
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
  requireAuth,
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

export default { followUser, unfollowUser, getAllUsers, getFollowStatus };
