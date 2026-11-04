import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectDB } from "./config/db.js";
dotenv.config();
import userRouter from "./Router/userRouter.js";
import PostsRouter from "./Router/PostRouter.js";
import notificationsRouter from "./Router/notificationsRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware (must come before routes) ──────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true, // required for httpOnly refresh-token cookie
}));
app.use(express.json());
app.use(cookieParser());

// ── Static assets ─────────────────────────────────────────────────────────────
app.use(
  "/profilesImage",
  express.static(path.join(process.cwd(), "/assets/profilesImage")),
);
app.use(
  "/postsImage",
  express.static(path.join(process.cwd(), "/assets/postsImage")),
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/users", userRouter);
app.use("/posts", PostsRouter);
app.use("/notifications", notificationsRouter);

// ── Database connection and server startup ────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});
