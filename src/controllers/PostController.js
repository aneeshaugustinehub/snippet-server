import { log } from "console";
import Posts from "../models/Posts.js";
import fs from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "node:console";

export async function getAllPosts(_, res) {
  try {
    const posts = await Posts.find().sort({ createdAt: -1 });
    res.status(200).json({ posts });
    if (!posts) {
      res.status(404).json({ message: "Posts not available" });
    }
  } catch (error) {
    console.error("error in getAllPosts", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function getPost(req, res) {
  try {
    const id = req.params.id;
    const posts = await Posts.findById(id);
    return res.status(200).json({ posts });
    console.log(res);

    if (!posts) {
      return res.status(404).json({ message: "Posts not available" });
    }
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
  console.log("createPost");
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

  const { replayText, replayImage } = req.body;
  // console.log("createPostReplay");
  try {
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
    return res.status(200).json(newPost);
  } catch (error) {
    console.error("error in createPost", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function updatePost(req, res) {
  console.log("updatePost");
  try {
    const postedBy = req.params.id;
    const { Description, imagePath } = req.body;
    if (!description && !imagePath) {
      return res
        .status(400)
        .json({ message: "Post description or image is required." });
    }
    const updatePost = await Posts.findByIdAndUpdate(
      req.params.id,
      { postedBy, description, imagePath },
      { new: true },
    );
    res.status(200).json(updatePost);
    if (!updatePost) {
      return res.status(404).json({ message: "Post not found" });
    }
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
