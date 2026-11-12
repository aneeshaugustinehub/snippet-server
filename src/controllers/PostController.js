import { log } from "console";
import Posts from "../models/Posts.js";
import Users from "../models/User.js";
import Notification from "../models/notification.model.js";
import fs from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "node:console";

export async function getAllPosts(_, res) {
  try {
    const posts = await Posts.find().sort({ createdAt: -1 });
    if (!posts) {
      res.status(404).json({ message: "Posts not available" });
    }
    res.status(200).json({ posts });
  } catch (error) {
    console.error("error in getAllPosts", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function getPost(req, res) {
  try {
    const id = req.params.id;
    const posts = await Posts.findById(id);
    console.log(res);
    if (!posts) {
      return res.status(404).json({ message: "Posts not available" });
    }
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("error in getPost", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function getPostByUser(req, res) {
  try {
    const id = req.params.id;
    const posts = await Posts.find({ postedBy: id }).sort({ createdAt: -1 });
    if (posts.length === 0) {
      return res.status(200).json({ message: "Posts not available" });
    }
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("error in getPost", error);
    return res.status(500).json({ message: "internal server error" });
  }
}
export async function getPostReplay(req, res) {
  // console.log("getPostReplay", req.params.id);

  try {
    const id = req.params.id;
    const posts = await Posts.find({ replayId: id }).sort({ createdAt: -1 });
    if (!posts) {
      return res.status(404).json({ message: "Posts not available" });
    }
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("error in getPost", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function createPost(req, res) {
  // console.log("createPost");
  try {
    const postedBy = req.user._id;
    const { Description, PostImage } = req.body;
    // console.log(Description, PostImage, req.formData);
    // console.log(req.body, req.file, "res");
    let imageUrl = "";
    if (!Description && !req.file) {
      return res
        .status(400)
        .json({ message: "Post description or image is required." });
    }
    if (req.file) {
      // console.log(req.file,"file");
      imageUrl = `${req.file.filename}`;
    }
    // console.log("Post created", postedBy, Description, imageUrl);
    const newPost = new Posts({
      postedBy: postedBy,
      description: Description,
      imagePath: imageUrl,
    });
    await newPost.save();
    return res.status(200).json(newPost);
  } catch (error) {
    console.error("error in createPost", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function createPostReplay(req, res) {
  const postedBy = req.user._id;
  const postUser = post.postedBy;
  const { replayText, replayImage } = req.body;
  // console.log("createPostReplay");
  try {
    const post = await Posts.findById(req.params.id);
    // console.log(postedBy, replayText, replayImage);
    let imageUrl = "";
    if (!postedBy) {
      return res.status(400).json({ message: "userid is required" });
    }
    if (!replayText && !req.file) {
      return res
        .status(400)
        .json({ message: "Post description or image is required." });
    }
    if (req.file) {
      imageUrl = `${req.file.filename}`;
    }
    const newPost = new Posts({
      replayId: req.params.id,
      postedBy: postedBy,
      description: replayText,
      imagePath: imageUrl,
    });
    // console.log(newPost);
    await newPost.save();
    if (req.params.id.toString() !== req.user._id.toString()) {
      await Notification.create({
        from: req.user._id,
        to: postUser,
        type: "comment",
        post: req.params.id,
      });
    }
    return res.status(200).json(newPost);
  } catch (error) {
    console.error("error in createPost", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function likeUnlikePost(req, res) {
  console.log("like");
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Posts.findById(postId);
    console.log("post", post);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const isLiked = post.likedBy.includes(userId);
    console.log("isLiked", isLiked);
    if (isLiked) {
      await Promise.all([
        Posts.updateOne({ _id: postId }, { $pull: { likedBy: userId } }),
        Users.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }),
      ]);
    } else {
      await Promise.all([
        Posts.updateOne({ _id: postId }, { $addToSet: { likedBy: userId } }),
        Users.updateOne({ _id: userId }, { $addToSet: { likedPosts: postId } }),
      ]);
    }

    const updated = await Posts.findById(postId).select("likedBy");
    if (post.postedBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        from: req.user._id,
        to: post.postedBy,
        type: "like",
        post: postId,
      });
    }
    res.status(200).json(updated.likedBy); // return the new likes array
  } catch (error) {
    console.error("error in likeUnlikePost", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function updatePost(req, res) {
  console.log("updatePost");
  try {
    const postId = req.params.id;
    const postedBy = req.user._id;
    if (postedBy.toString() !== postId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own post" });
    }
    const { Description, imagePath } = req.body;
    if (!Description && !imagePath) {
      return res
        .status(400)
        .json({ message: "Post description or image is required." });
    }
    const updatePost = await Posts.findByIdAndUpdate(
      postId,
      { postedBy, Description, imagePath },
      { new: true },
    );
    if (!updatePost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(updatePost);
  } catch (error) {
    console.error("error in updatePost", error);
    res.status(500).json({ message: "internal server error" });
  }
}

const uploadsDir = path.join(process.cwd(), "assets/postsImage");

export async function deletePost(req, res) {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    console.log("deletePost");
    const isOwner = post.postedBy.equals(req.user._id);
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "You can only delete your own post" });
    }
    const DeletePost = await Posts.findByIdAndDelete(req.params.id);

    if (!DeletePost) return res.status(404).json({ message: "Post not found" });

    if (DeletePost.imagePath) {
      const filename = path.basename(DeletePost.imagePath);
      const filePath = path.join(uploadsDir, filename);

      try {
        await fs.unlink(filePath);
        console.log("File deleted successfully");
      } catch (unlinkErr) {
        console.error("Could not delete image file:", unlinkErr.message);
      }
    }
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("error in deletePost", error);
    res.status(500).json({ message: "internal server error" });
  }
}
