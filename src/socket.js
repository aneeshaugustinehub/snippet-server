import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;
const online = new Map(); // userId -> socketId

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.use((socket, next) => {
    try {
      const payload = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      socket.userId = String(payload._id); // check the key your login signs
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    online.set(socket.userId, socket.id);
    socket.on("disconnect", () => online.delete(socket.userId));
  });

  return io;
}

export const getIO = () => io;
export const getSocketId = (userId) => online.get(String(userId));