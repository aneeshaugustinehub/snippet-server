import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  markRead,
  markAllRead,
  getNotifications,
  deleteNotifications,
} from "../controllers/notificationsController.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.delete("/", verifyToken, deleteNotifications);
router.patch("/read-all", verifyToken, markAllRead);
router.patch("/:id/read", verifyToken, markRead);
export default router;
