import { Router } from "express";
import userController from "../controllers/userController.ts";

const router = Router();

router.post("/user/sign-up", userController.signUpController);

export default router;
