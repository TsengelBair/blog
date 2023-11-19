import { body } from "express-validator";

export const registerValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body(
    "password",
    "Длина пароля должна быть минимум 5, максимум 15 символов"
  ).isLength({ min: 5, max: 15 }),
  body("fullName", "Минимальная длина имени 3 символа").isLength({ min: 3 }),
  body("avatarUrl", "Неверная ссылка").optional().isURL(),
];

export const loginValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body(
    "password",
    "Длина пароля должна быть минимум 5, максимум 15 символов"
  ).isLength({ min: 5, max: 15 }),
];

export const postCreateValidation = [
  body("title", "Введите заголовок статьи").isLength({ min: 3 }).isString(),
  body("text", "Введите текст статьи").isLength({ min: 3 }).isString(),
  body("tags", "Неверный формат тэгов (укажите массив)").optional().isString(),
  body("imageUrl", "Неверная ссылка на изображение").optional().isString(),
];
