import express from "express";
import validateLogin from "../middlewares/validateLogin.js";
import verifyToken from "../middlewares/verifyToken.js";
import {
  getMe,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  bookmarkPosts,
  followUnFollowUser,
  getUser,
  getAllUsers,
  loginUser,
} from "../controllers/userController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();
router.get("/search", getUser);
router.get("/getMe", verifyToken, getMe);
router.post("/register", createUser);
router.post("/login", validateLogin, loginUser);
router.get("/:id", getUser);
router.get("/", getAllUsers);
router.get("/id/:id", getUserById);
router.put("/bookmark/", verifyToken, bookmarkPosts);
router.put("/follow/", verifyToken, followUnFollowUser);
router.put("/",verifyToken,upload.fields([{ name: "profilePic", maxCount: 1 },{ name: "bannerPic", maxCount: 1 },]),updateUser,);
router.delete("/:id", verifyToken, deleteUser);

export default router;
