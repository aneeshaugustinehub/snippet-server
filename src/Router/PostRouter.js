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

router.post("/",verifyToken, upload.single("PostImage"), createPost);
router.put("/uploadPostImage",verifyToken, upload.single("PostImage"), updatePost);
router.post("/replay/:id",verifyToken, upload.single("PostImage"), createPostReplay);
router.get("/", getAllPosts);
router.get("/:id", getPost);
router.get("/replay/:id", getPostReplay);
router.get("/user/:id", getPostByUser);
router.delete("/:id",verifyToken, deletePost);

export default router;
