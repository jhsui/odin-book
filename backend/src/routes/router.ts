import { Router } from "express";
import postController from "../controllers/postController.ts";
import commentController from "../controllers/commentController.ts";

const router = Router();

router.get("/posts", postController.getAllPosts);
router.get("/posts/:postId", postController.getPostById);
router.post("/posts", postController.createPost);

router.get("/posts/:postId/comments", commentController.getComments);
router.post("/posts/:postId/comments", commentController.postComment);

router.get("/posts/:postId/likes/me", postController.getLikeStatus);
router.post("/posts/:postId/likes/me", postController.togglePostLike);

export default router;
