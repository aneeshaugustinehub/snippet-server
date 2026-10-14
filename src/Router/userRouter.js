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
  getUser,
  getUsers,
  loginUser,
} from "../controllers/userController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();
router.get("/getMe", verifyToken, getMe);
router.post("/register", createUser);
router.post("/login", validateLogin, loginUser);
router.get("/:id", getUser);
router.get("/", getUsers);
router.get("/id/:id", getUserById);
router.put("/bookmark/:id", verifyToken, bookmarkPosts);
router.delete("/:id", verifyToken, deleteUser);
router.put(
  "/:id",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "bannerPic", maxCount: 1 },
  ]),
  updateUser,
);

export default router;
