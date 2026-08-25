import { Router } from "express";
import postController from "../controllers/postController.ts";

const router = Router();

router.get("/posts", postController.getAllPosts);
router.get("/posts/:postId", postController.getPostById);
router.get("/posts/like-status/:postId", postController.getLikeStatus);

router.post("/posts", postController.createPost);
router.post("/posts/like/:postId", postController.togglePostLike);
export default router;
