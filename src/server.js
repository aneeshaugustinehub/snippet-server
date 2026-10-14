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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Middleware
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
// Routes
app.use(express.json());
app.use("/users", userRouter);
app.use("/posts", PostsRouter);
app.use(
  "/profilesImage",
  express.static(path.join(process.cwd(), "/assets/profilesImage")),
);
app.use(
  "/postsImage",
  express.static(path.join(process.cwd(), "/assets/postsImage")),
);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // needed if you're sending cookies (e.g. JWT in httpOnly cookie) with requests
}))
app.use(express.json());
app.use(cookieParser()); // import cookieParser from "cookie-parser"

// Database connection and server startup
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
});
