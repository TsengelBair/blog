import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();

    return res.json(posts);
  } catch (e) {
    console.log(e);
    return res.json({ message: "Не удалось получить статьи" });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId; // userId мы вшили в middleware checkAuth

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    // Если id владельца статьи не совпадает с id пользователя, отправляющего запрос
    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Нет доступа к удалению статьи" });
    }

    const deletedPost = await PostModel.findByIdAndDelete({ _id: postId });

    return res.json({ message: "Статья успешно удалена" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Ошибка при удалении статьи" });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    if (post.user.toString() !== userId) {
      return res.status(400).json({ message: "Нет доступа" });
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: userId,
        tags: req.body.tags,
      }
    );
    return res.json({ message: "Статья успешно обновлена" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Произошла ошибка при обновлении статьи" });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    let doc = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } }
    );

    if (!doc) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    return res.json(doc);
  } catch (e) {
    console.log(e);
    return res.json({ message: "Ошибка при получении статьи" });
  }
};

export const create = async (req, res) => {
  try {
    const { title, text, tags, imageUrl } = req.body;

    const post = new PostModel({
      title,
      text,
      tags,
      imageUrl,
      user: req.userId,
    });
    await post.save();
    res.json(post);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Не удалось создать статью" });
  }
};
