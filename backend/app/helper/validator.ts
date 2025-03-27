import { body } from "express-validator";

export const userValidationRules = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString(),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isString(),
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const loginValidationRules = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

