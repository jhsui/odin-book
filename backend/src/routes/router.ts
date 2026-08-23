import { Router } from "express";
import postController from "../controllers/postController.ts";

const router = Router();

router.post("/post/writing", postController.writingPostController);

export default router;
