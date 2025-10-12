import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      immutable: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
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
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Security fields
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    securityLog: [
      {
        action: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
        userAgent: String,
      },
    ],
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

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incrementLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 60 * 60 * 1000 }; // 1 hour lock
  }

  return this.updateOne(updates);
};

// Add security log entry
userSchema.methods.addSecurityLog = function (action, ipAddress, userAgent) {
  this.securityLog.push({
    action,
    ipAddress,
    userAgent,
  });

  if (this.securityLog.length > 100) {
    this.securityLog = this.securityLog.slice(-100);
  }

  return this.save();
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.isLocked) {
    throw new Error(
      "Account is temporarily locked due to too many failed login attempts"
    );
  }

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

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
