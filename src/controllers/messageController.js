import mongoose from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/User.js";
import { getIO, getSocketId } from "../socket.js";

// GET /messages/conversations
export async function getConversations(req, res) {
  try {
    const me = new mongoose.Types.ObjectId(req.user._id);

    const convos = await Message.aggregate([
      { $match: { $or: [{ sender: me }, { receiver: me }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$sender", me] }, "$receiver", "$sender"] },
          lastMessage: { $first: "$$ROOT" },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", me] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    const users = await User.find({ _id: { $in: convos.map((c) => c._id) } })
      .select("userId name profilePic");
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const result = convos
      .filter((c) => userMap.has(String(c._id))) // skip deleted users
      .map((c) => ({
        user: userMap.get(String(c._id)),
        lastMessage: c.lastMessage,
        unread: c.unread,
      }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load conversations" });
  }
}

// GET /messages/thread/:userId
export async function getThread(req, res) {
  try {
    const me = req.user._id;
    const other = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me },
      ],
    }).sort({ createdAt: 1 });

    // mark their messages to me as read
    await Message.updateMany(
      { sender: other, receiver: me, read: false },
      { $set: { read: true } }
    );

    res.status(200).json(messages); // [] when empty, which is fine
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load messages" });
  }
}

// POST /messages/thread/:userId
export async function sendMessage(req, res) {
  try {
    const sender = req.user._id;
    const receiverId = req.params.userId;
    const text = req.body.text?.trim();

    if (!text) return res.status(400).json({ message: "Message is empty" });
    if (String(sender) === String(receiverId))
      return res.status(400).json({ message: "You can't message yourself" });

    const receiver = await User.findById(receiverId).select("_id");
    if (!receiver) return res.status(404).json({ message: "User not found" });

    const msg = await Message.create({ sender, receiver: receiverId, text });

    const sid = getSocketId(receiverId);
    if (sid) getIO().to(sid).emit("newMessage", msg);

    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
}