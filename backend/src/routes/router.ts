import { Router } from "express";
import postController from "../controllers/postController.ts";

const router = Router();

router.post("/post/writing", postController.writingPostController);
router.get("/posts/all", postController.getAllPosts);

export default router;
