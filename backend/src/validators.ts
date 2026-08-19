import { body } from "express-validator";

export const signUpValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty.")
    .bail()
    .isEmail()
    .withMessage("Email must be a valid email format."),

  body("password")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must be between 8 and 64 characters long.")
    .bail()
    .custom((value) => value.length >= 8 && value.trim().length > 0)
    .withMessage(
      "Password must be at least 8 characters long and not only spaces",
    ),

  body("confirmPassword")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Two passwords are not the same"),
];
