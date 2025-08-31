// models/Coupon.js
import mongoose from "mongoose";

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Only allow alphanumeric characters and hyphens
          return /^[A-Z0-9-]+$/.test(v);
        },
        message: "Coupon code can only contain letters, numbers, and hyphens",
      },
    },
    description: {
      type: String,
      required: true,
      maxLength: 500,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          if (this.discountType === "percentage") {
            return v >= 1 && v <= 100;
          }
          return v > 0;
        },
        message: "Percentage must be 1-100, fixed must be greater than 0",
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    singleUsePerUser: {
      type: Boolean,
      default: false,
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ createdBy: 1 });

// Static method to validate coupon with enhanced security
// models/Coupon.js

couponSchema.statics.validateCoupon = async function (
  code,
  orderAmount,
  userId
) {
  try {
    const sanitizedCode = code.toUpperCase().trim();

    const coupon = await this.findOne({
      code: sanitizedCode,
      isActive: true,
      startDate: { $lte: new Date() }, // This allows today's date
      endDate: { $gte: new Date() },
    });

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        message: "This coupon has reached its usage limit",
      };
    }

    // Check min order
    if (orderAmount < (coupon.minOrderAmount || 0)) {
      return {
        valid: false,
        message: `Minimum order amount must be ${coupon.minOrderAmount}`,
      };
    }

    // Allowed users check
    if (coupon.allowedUsers?.length > 0 && userId) {
      const isUserAllowed = coupon.allowedUsers.some(
        (allowedUser) => allowedUser.toString() === userId.toString()
      );
      if (!isUserAllowed) {
        return {
          valid: false,
          message: "This coupon is not available for your account",
        };
      }
    }

    // Single-use per user
    if (coupon.singleUsePerUser && userId) {
      const hasUserUsed = coupon.usedBy?.some(
        (usage) => usage.user.toString() === userId.toString()
      );
      if (hasUserUsed) {
        return { valid: false, message: "You have already used this coupon" };
      }
    }

    // ✅ Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return { valid: true, coupon: { ...coupon.toObject(), discountAmount } };
  } catch (err) {
    console.error("Coupon.validateCoupon error:", err);
    throw err;
  }
};

// Method to increment usage
couponSchema.methods.incrementUsage = async function (userId) {
  this.usedCount += 1;

  if (userId) {
    this.usedBy.push({ user: userId });
  }

  await this.save();
};

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
