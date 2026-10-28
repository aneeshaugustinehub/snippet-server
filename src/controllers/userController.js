import User from "../models/User.js";
import hashPassword from "../middlewares/hashPassword.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path";
import fs from "node:fs/promises";

export const PUBLIC_FIELDS =
  "userId name bio website location dob profilePic bannerPic noPosts noFollowers followers noFollowing following createdAt";
export const getMe = (req, res) => {
  const u = req.user; // set by verifyToken

  res.status(200).json({
    user: {
      id: u._id,
      userId: u.userId,
      name: u.name,
      profilePic: u.profilePic,
      bannerPic: u.bannerPic,
      bio: u.bio,
      location: u.location,
      website: u.website,
      dob: u.dob,
      email: u.email,
      noPosts: u.noPosts,
      noFollowers: u.noFollowers,
      noFollowing: u.noFollowing,
      followers: u.followers,
      following: u.following,
      bookmarks: u.bookmarks,
      likedPosts: u.likedPosts,
      roles: u.roles,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    },
  });
};

export async function getUser(req, res) {
  try {
    const id = req.params.id;

    const user = await User.findOne({ userId: id }).select(PUBLIC_FIELDS); // how add in mongo db schema
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '' not found.`,
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("error in getUser", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function getUserById(req, res) {
  // console.log("getUserById", req.params.id);
  const Id = req.params.id;
  if (!mongoose.isValidObjectId(Id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid user ID '${Id}'.`,
    });
  }
  try {
    const user = await User.findById(Id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID '' not found.`,
      });
    }
    // console.log("user", { user });
    res.status(200).json(user);
  } catch (error) {
    console.error("error in getUserById", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function getAllUsers(_, res) {
  try {
    const user = await User.find();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: `User not found.` });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("error in getUsers", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function createUser(req, res) {
  try {
    const { userId, name, email, dob, password } = req.body;

    if (!password || !email || !userId || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUserId = userId.trim();

    const check = await User.findOne({
      $or: [{ email: cleanEmail }, { userId: cleanUserId }],
    });
    if (check) {
      return res.status(400).json({ message: "user already exists" });
    }
    const newUser = new User({
      userId: cleanUserId,
      name: name.trim(),
      email: cleanEmail,
      dob,
      password: await hashPassword(password),
    });
    await newUser.save();
    // const _id = newUser._id;
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 3600000, // 1 hour
    // });
    res.status(200).json({
      message: "user signup successful",
      signup: true,
      token,
      user: { id: newUser._id, username: newUser.userId },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    console.error("error in createUser", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export const loginUser = async (req, res) => {
  const user = req.user;
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: req.user._id, username: req.user.userId },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export async function updateUser(req, res) {
  const uploadsDir = path.join(process.cwd(), "assets/profilesImage");

  // const isOwner = (req) => req.params.id === req.user._id.toString();
  try {
    // if (!isOwner(req)) {
    //   return res
    //     .status(403)
    //     .json({ message: "You can only edit your own profile" });
    // }
    const { userId, name, email, bio, location, website, age } = req.body;
    const profileImageUrl = req.files?.profilePic?.[0]?.filename;
    const bannerImageUrl = req.files?.bannerPic?.[0]?.filename;

    // if (!req.files) {
    //   return res.status(400).json({ message: "No file uploaded" });
    // }

    const updateFields = {
      userId,
      name,
      bio,
      location,
      website,
      age,
      ...(profileImageUrl && { profilePic: profileImageUrl }),
      ...(bannerImageUrl && { bannerPic: bannerImageUrl }),
    };
    console.log(updateFields.bannerPic, updateFields.profilePic);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (updateFields.bannerPic) {
      const filename = path.basename(user.bannerPic);
      const filePath = path.join(uploadsDir, filename);

      try {
        await fs.unlink(filePath);
        console.log("bannerPic deleted successfully");
      } catch (unlinkErr) {
        console.error("Could not delete image file:", unlinkErr.message);
      }
    }
    if (updateFields.profilePic) {
      const filename = path.basename(user.profilePic);
      const filePath = path.join(uploadsDir, filename);

      try {
        await fs.unlink(filePath);
        console.log("profilePic deleted successfully");
      } catch (unlinkErr) {
        console.error("Could not delete image file:", unlinkErr.message);
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { returnDocument: "after", runValidators: true },
    ).select("-password");

    if (!updateUser) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }
    console.error("error in updateUser", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function deleteUser(req, res) {
  try {
    if (!isOwner(req)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own account" });
    }
    const DeleteUser = await User.findByIdAndDelete(req.params.id);
    if (!DeleteUser) return res.status(404).json({ message: "user not found" });

    if (DeleteUser.imagePath) {
      const filename = path.basename(DeleteUser.imagePath);
      const filePath = path.join(uploadsDir, filename);

      try {
        await fs.unlink(filePath);
        console.log("File deleted successfully");
      } catch (unlinkErr) {
        console.error("Could not delete image file:", unlinkErr.message);
      }
    }

    res.status(200).json({ message: "user deleted" });
  } catch (error) {
    console.error("error in deleteUser", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function bookmarkPosts(req, res) {
  try {
    const userId = req.user.id;
    const { postId } = req.body;
    const update = { bookmarks: postId };
    const user = await User.findById(userId);
    const isBookmarked = user.bookmarks.some((id) => id.toString() === postId);
    const addBookmark = await User.findByIdAndUpdate(
      userId,
      isBookmarked ? { $pull: update } : { $addToSet: update },
      { returnDocument: "after" },
    ).select("bookmarks");
    res.status(200).json(addBookmark);
  } catch (error) {
    console.error("error in bookmark Post", error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function followUnFollowUser(req, res) {
  try {
    const myId = req.user.id;
    const { Id } = req.body;
    console.log(Id);
    const update = { following: Id };
    const Me = await User.findById(myId);
    const isFollowing = Me.following.some((id) => id.toString() === Id);
    const Follow = await User.findByIdAndUpdate(
      myId,
      isFollowing ? { $pull: update } : { $addToSet: update },
      { returnDocument: "after" },
    ).select("following");

    const update2 = { followers: myId };
    const user = await User.findById(Id);
    const isFollowers = user.followers.some((id) => id.toString() === myId);
    console.log("followers", isFollowers, isFollowing);
    const followers = await User.findByIdAndUpdate(
      Id,
      isFollowers ? { $pull: update2 } : { $addToSet: update2 },
      { returnDocument: "after" },
    ).select("followers");
    res
      .status(200)
      .json({ followers: followers.followers, following: Follow.following });
  } catch (error) {
    console.error("error in following uer", error);
    res.status(500).json({ message: "internal server error" });
  }
}
