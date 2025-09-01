import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      immutable: true, // Makes email field unmodifiable
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password by default in queries
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "/default-profile.jpg",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    role: {
      type: String,
      required: true,
      enum: ["Customer", "Admin", "Employee"],
      default: "Customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Fixed: Moved googleId and isEmailVerified out of appearance object
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: false },
      smsNotifications: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    appearance: {
      theme: {
        type: String,
        default: "light",
        enum: ["light", "dark", "system"],
      },
      language: {
        type: String,
        default: "english",
        enum: ["english", "spanish", "french", "german"],
      },
      fontSize: {
        type: String,
        default: "medium",
        enum: ["small", "medium", "large"],
      },
    },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

// Check if model already exists before compiling
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
