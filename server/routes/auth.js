import express from "express";
import User from "../models/User.js";
<<<<<<< HEAD
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
=======
import { protect, generateToken } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../config/email.js";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
>>>>>>> 2ea1a0e48f5027ef2d66d3b71f6b60a587c60672

const router = express.Router();
const unlinkAsync = promisify(fs.unlink);

// Helper function to handle file uploads safely
const handleFileUpload = (file) => {
  try {
    if (!file || !file.tempFilePath) {
      console.error("No file or temp file path provided");
      return null;
    }

    // Ensure the upload directory exists
    const uploadDir = path.join(__dirname, "../public/uploads/profiles");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Created directory: ${uploadDir}`);
    }

    // Get file extension
    const ext = path.extname(file.name) || ".jpg";
    const filename = `profile-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    console.log(`Moving file from ${file.tempFilePath} to ${filePath}`);

    // Move the file
    fs.renameSync(file.tempFilePath, filePath);

    // Verify the file exists
    if (!fs.existsSync(filePath)) {
      console.error("File was not moved successfully");
      return null;
    }

    console.log(`File successfully saved to ${filePath}`);
    return `/uploads/profiles/${filename}`;
  } catch (error) {
    console.error("File upload error:", error);
    return null;
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    console.log("Register request received:", req.body);

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      city,
      state,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phoneNumber,
      address,
      city,
      state,
    });

    // Generate token
    const token = generateToken(user._id);

    console.log("User registered successfully:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          state: user.state,
          profileImage: user.profileImage,
          bio: user.bio,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body.email });

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log("Login successful for user:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          state: user.state,
          profileImage: user.profileImage,
          bio: user.bio,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        state: user.state,
        profileImage: user.profileImage || "/default-profile.jpg",
        bio: user.bio,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address, city, state, bio } =
      req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update allowed fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.city = city || user.city;
    user.state = state || user.state;
    user.bio = bio || user.bio;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        token: generateToken(updatedUser._id),
        user: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          address: updatedUser.address,
          city: updatedUser.city,
          state: updatedUser.state,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          createdAt: updatedUser.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
});

// @desc    Update profile image
// @route   PUT /api/auth/profile/image
// @access  Private
router.put("/profile/image", protect, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old image if it exists and isn't default
    if (user.profileImage && !user.profileImage.includes("default-profile")) {
      try {
        const oldImagePath = path.join(
          __dirname,
          "../public",
          user.profileImage
        );
        if (fs.existsSync(oldImagePath)) {
          await unlinkAsync(oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old profile image:", err);
      }
    }

    // Process new image
    const imagePath = handleFileUpload(req.files.image);
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Failed to process uploaded image",
      });
    }

    // Update user with new image path
    user.profileImage = imagePath;
    await user.save();

    res.json({
      success: true,
      data: {
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Profile image update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile image",
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/profile/password
// @access  Private
router.put("/profile/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all password fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Password updated successfully",
      data: {
        token: token,
      },
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email address",
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      res.json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      console.error("Email send error:", error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put("/reset-password/:resettoken", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide password and confirm password",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
