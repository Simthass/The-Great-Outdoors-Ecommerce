import mongoose from "mongoose";

const productReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User is required"],
      ref: "User",
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Product is required"],
      ref: "Product",
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Order is required"],
      ref: "Order",
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    reviewerName: {
      type: String,
      required: [true, "Reviewer name is required"],
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "reported"],
      default: "active",
    },
    // Add admin response field
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin response cannot exceed 1000 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reviews from same user for same product
productReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for fetching reviews by product
productReviewSchema.index({ product: 1, status: 1, createdAt: -1 });

const ProductReview =
  mongoose.models.ProductReview ||
  mongoose.model("ProductReview", productReviewSchema);

export default ProductReview;
