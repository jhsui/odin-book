import { Router } from "express";
import postController from "../controllers/postController.ts";
import commentController from "../controllers/commentController.ts";
import userController from "../controllers/userController.ts";

const router = Router();

router.get("/posts", postController.getAllPosts);
router.post("/posts", postController.createPost);
router.get("/posts/index", postController.getPostIndex);
router.get("/posts/:postId", postController.getPostById);

router.get("/posts/:postId/comments", commentController.getComments);
router.post("/posts/:postId/comments", commentController.postComment);

router.get("/posts/:postId/likes/me", postController.getLikeStatus);
router.post("/posts/:postId/likes/me", postController.togglePostLike);

router.put("/users/me/following/:followingId", userController.followUser);
router.delete("/users/me/following/:followingId", userController.unfollowUser);
router.get(
  "/users/me/following/:followingId/status",
  userController.getFollowStatus,
);

router.get("/users/index", userController.getAllUsers);

router.get("/users/me/avatar", userController.getAvatar);
router.put("/users/me/avatar", userController.uploadNewAvatar);

export default router;
