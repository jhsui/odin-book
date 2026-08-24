import { Router } from "express";
import postController from "../controllers/postController.ts";

const router = Router();

router.get("/posts", postController.getAllPosts);
router.get("/posts/:postId", postController.getPostById);

router.post("/posts", postController.createPost);

export default router;
