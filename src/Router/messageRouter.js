import express from "express";
import verifyToken from "../middlewares/verifyToken.js"; // match your actual import style
import { getConversations, getThread, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/conversations", getConversations);
router.get("/thread/:userId", getThread);
router.post("/thread/:userId", sendMessage);

export default router;