//validateLogin.js

import { log } from "console";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const validateLogin = async (req, res, next) => {
  const { userId, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(userId);
  try {
    let user; 

    if (isEmail) {
      console.log("Logging in with email:", userId);
      user = await User.findOne({ email: userId });
    } else {
      console.log("Logging in with userId:", userId);
      user = await User.findOne({ userId: userId });
    }
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default validateLogin;
