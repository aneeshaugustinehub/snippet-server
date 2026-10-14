import mongoose from "mongoose";
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
      trim: true,
      lowercase: true,
      match: [
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        "Please fill a valid URL address",
      ],
    },
    location: { type: String, trim: true },
    dob: { type: Date, required: true },
    profilePic: { type: String, default: "" },
    bannerPic: { type: String, default: "" },
    noPosts: { type: Number, default: 0 },
    noFollowers: { type: Number, default: 0 },
    noFollowing: { type: Number, default: 0 },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
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
