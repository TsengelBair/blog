import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import { validationResult } from "express-validator";

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const { email, password, avatarUrl, fullName } = req.body;

    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      return res
        .status(400)
        .json({ message: `Пользователь с email ${email} уже есть` });
    }
    const hash = await bcrypt.hash(password, 5);
    const user = new UserModel({
      fullName,
      email,
      avatarUrl,
      passwordHash: hash,
    });

    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });
    const { passwordHash, ...userData } = user._doc;
    return res.json({
      ...userData,
      token,
    });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Ошибка на сервере при регистрации" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Пользователь с таким email не найден" });
    }

    const isValidPass = bcrypt.compareSync(password, user.passwordHash);
    if (!isValidPass) {
      return res.status(400).json({ message: "Неверный пароль или логин" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    const { passwordHash, ...userData } = user._doc;
    return res.json({
      ...userData,
      token,
    });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Ошибка на сервере при авторизации" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const { passwordHash, ...userData } = user._doc;
    return res.json(userData);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Ошибка на сервере" });
  }
};
