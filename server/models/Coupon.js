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
      // ✅ Remove the problematic validator - we'll handle this in the route
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

// ✅ Add pre-save middleware to validate dates
couponSchema.pre(["save", "findOneAndUpdate"], function () {
  // For save operations
  if (this.endDate && this.startDate) {
    if (this.endDate <= this.startDate) {
      throw new Error("End date must be after start date");
    }
  }

  // For update operations
  if (this.getUpdate && this.getUpdate()) {
    const update = this.getUpdate();
    const startDate = update.startDate || update.$set?.startDate;
    const endDate = update.endDate || update.$set?.endDate;

    if (startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        throw new Error("End date must be after start date");
      }
    }
  }
});

// Method to increment usage
couponSchema.methods.incrementUsage = async function (userId) {
  this.usedCount += 1;

  if (userId) {
    this.usedBy.push({ user: userId });
  }

  await this.save();
};

// Place this code after the schema definition and pre-save hook
couponSchema.statics.validateCoupon = async function (
  code,
  orderAmount,
  userId
) {
  const coupon = await this.findOne({
    code,
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) {
    return { valid: false, message: "Coupon is invalid or expired" };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "Coupon has reached its usage limit" };
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of Rs. ${coupon.minOrderAmount.toFixed(
        2
      )} not met`,
    };
  }

  if (coupon.allowedUsers.length > 0 && !coupon.allowedUsers.includes(userId)) {
    return {
      valid: false,
      message: "This coupon is not valid for your account",
    };
  }

  if (
    coupon.singleUsePerUser &&
    coupon.usedBy.some((use) => use.user.equals(userId))
  ) {
    return {
      valid: false,
      message: "This coupon has already been used by this user",
    };
  }

  // Calculate the discount amount
  let discountAmount;
  if (coupon.discountType === "percentage") {
    let calculatedDiscount = orderAmount * (coupon.discountValue / 100);
    discountAmount =
      coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount
        ? coupon.maxDiscountAmount
        : calculatedDiscount;
  } else {
    discountAmount = coupon.discountValue;
  }

  // Return a valid result with the calculated discount amount
  return {
    valid: true,
    message: "Coupon applied successfully!",
    coupon: {
      ...coupon.toObject(),
      discountAmount,
    },
  };
};
const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
