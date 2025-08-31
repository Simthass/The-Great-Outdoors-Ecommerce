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

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
