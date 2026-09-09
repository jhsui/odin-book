import { body } from "express-validator";

export const writingPostValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Title can not be empty."),

  body("content")
    .isString()
    .withMessage("Comment must be a string.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Content can not be empty."),
];

export const commentValidator = [
  body("comment")
    .isString()
    .withMessage("Comment must be a string.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Comment can not be empty."),
];

export const userNewNameValidator = [
  body("newName")
    .isString()
    .withMessage("Username must be a string.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("New username can not be empty."),
];

export const userIntroValidator = [
  body("intro")
    .isString()
    .withMessage("Intro must be a string.")
    .bail()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Intro cannot exceed 1000 characters."),
];
