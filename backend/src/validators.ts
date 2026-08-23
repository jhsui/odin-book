import { body } from "express-validator";

export const writingPostValidator = [
  body("title").trim().notEmpty().withMessage("Title can not be empty."),
  body("content").trim().notEmpty().withMessage("Content can not be empty."),
];
