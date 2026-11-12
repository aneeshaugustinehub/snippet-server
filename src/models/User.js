import mongoose from "mongoose";
import validator from "validator";
const { Schema } = mongoose;

// 1. Define the Schema
const userSchema = new Schema(
  {
    createdAt: { type: Date, default: Date.now },
    // username
    userId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    bio: { type: String, maxlength: 160 },
    website: {
      type: String,
      validate: {
        validator: (value) =>
          validator.isEmpty(value) ||
          validator.isURL(value, { require_protocol: false }),
        message: "Please fill a valid URL address",
      },
    },
    location: { type: String, trim: true },
    dob: { type: Date, required: true },
    profilePic: { type: String, default: "" },
    bannerPic: { type: String, default: "" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post", default: [] }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Posts" }],
    roles: { type: [String], default: ["user"] },
    password: { type: String, required: true },
    token: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
