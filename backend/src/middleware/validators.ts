import { body } from "express-validator";

export const writingPostValidator = [
  body("title").trim().notEmpty().withMessage("Title can not be empty."),
  body("content").trim().notEmpty().withMessage("Content can not be empty."),
];

export const commentValidator = [
  body("comment").trim().notEmpty().withMessage("Comment can not be empty."),
];

export const userNewNameValidator = [
  body("newName")
    .trim()
    .notEmpty()
    .withMessage("New username can not be empty."),
];
