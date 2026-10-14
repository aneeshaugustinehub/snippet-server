import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  createPostReplay,
  getPostReplay,
  updatePost,
  getPostByUser,
} from "../controllers/PostController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPost);
router.get("/replay/:id", getPostReplay);
router.get("/user/:id", getPostByUser);
router.put("/uploadPostImage",verifyToken, upload.single("PostImage"), updatePost);
router.post("/:id", upload.single("PostImage"),verifyToken, createPost);
router.post("/replay/:id", upload.single("PostImage"),verifyToken, createPostReplay);
router.delete("/:id",verifyToken, deletePost);

export default router;
