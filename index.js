import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validation.js";
import checkAuth from "./utils/checkAuth.js";
import * as UserController from "./controllers/UserController.js";
import * as PostController from "./controllers/PostController.js";

const app = express();
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
dotenv.config(); // Для исп-я переменных из файла .env

const PORT = process.env.PORT || 5000;

const start = () => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("DB OK"))
    .catch((e) => console.log(e));
};

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.post("/auth/register", registerValidation, UserController.register);
app.post("/auth/login", loginValidation, UserController.login);
app.get("/auth/me", checkAuth, UserController.getMe);

app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.post("/posts", checkAuth, postCreateValidation, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, PostController.update);

start();
