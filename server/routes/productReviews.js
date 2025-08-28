import express from "express";
import mongoose from "mongoose"; // Add this line
import ProductReview from "../models/ProductReview.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js"; // Change this line
const router = express.Router();

// Get reviews for a specific product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "newest" } = req.query;

    let sortOption = { createdAt: -1 };

    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "highest":
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortOption = { helpfulVotes: -1, createdAt: -1 };
        break;
    }

    const reviews = await ProductReview.find({
      product: productId,
      status: "active",
    })
      .populate("user", "firstName lastName") // Changed from 'user' to 'customerId'
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await ProductReview.countDocuments({
      product: productId,
      status: "active",
    });

    // Calculate average rating
    const ratingStats = await ProductReview.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "active",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingBreakdown: {
            $push: "$rating",
          },
        },
      },
    ]);

    // Format reviews for frontend
    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      reviewerName:
        review.reviewerName ||
        (review.user
          ? `${review.user.firstName} ${review.user.lastName}`
          : "Anonymous"),
      isVerifiedPurchase: review.isVerifiedPurchase,
      helpfulVotes: review.helpfulVotes,
      createdAt: review.createdAt,
      canEdit: false,
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasMore: page * limit < totalReviews,
        },
        stats: ratingStats[0] || {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: [],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
});
// Check if user can review a product
router.get("/can-review/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Check if user has already reviewed this product
    const existingReview = await ProductReview.findOne({
      user: userId, // Changed from 'user' to 'customerId'
      product: productId,
    });

    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
        reason: "already_reviewed",
        existingReview: {
          _id: existingReview._id,
          rating: existingReview.rating,
          title: existingReview.title,
          comment: existingReview.comment,
          createdAt: existingReview.createdAt,
        },
      });
    }

    // Check if user has purchased and received this product
    const deliveredOrder = await Order.findOne({
      user: userId,
      orderStatus: "Delivered",
      "items.productId": productId,
    });

    if (!deliveredOrder) {
      return res.json({
        success: true,
        canReview: false,
        reason: "not_purchased_or_delivered",
      });
    }

    res.json({
      success: true,
      canReview: true,
      orderId: deliveredOrder._id,
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check review eligibility",
    });
  }
});

// Create a new review
router.post("/", protect, async (req, res) => {
  try {
    const { productId, rating, title, comment, reviewerName } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!productId || !rating || !comment || !reviewerName) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await ProductReview.findOne({
      user: userId, // Changed from 'user' to 'customerId'
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Verify user has purchased and received this product
    const deliveredOrder = await Order.findOne({
      user: userId,
      orderStatus: "Delivered",
      "items.productId": productId,
    });

    if (!deliveredOrder) {
      return res.status(400).json({
        success: false,
        message: "You can only review products you have purchased and received",
      });
    }

    // Create the review with customerId instead of user
    const review = new ProductReview({
      user: userId, // Changed from 'user' to 'customerId'
      product: productId,
      order: deliveredOrder._id,
      rating: parseInt(rating),
      title: title || "",
      comment: comment.trim(),
      reviewerName: reviewerName.trim(),
      isVerifiedPurchase: true,
    });

    await review.save();

    // Update product with new review reference
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        _id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        reviewerName: review.reviewerName,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        canEdit: true,
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
});
// Update user's own review
router.put("/:reviewId", protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, reviewerName } = req.body;
    const userId = req.user._id;

    const review = await ProductReview.findOne({
      _id: reviewId,
      user: userId, // Changed from 'user' to 'customerId'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to edit it",
      });
    }

    // Update the review
    review.rating = rating || review.rating;
    review.title = title !== undefined ? title : review.title;
    review.comment = comment || review.comment;
    review.reviewerName = reviewerName || review.reviewerName;

    await review.save();

    res.json({
      success: true,
      message: "Review updated successfully",
      data: {
        _id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        reviewerName: review.reviewerName,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        canEdit: true,
      },
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
});

// Delete user's own review
router.delete("/:reviewId", protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await ProductReview.findOne({
      _id: reviewId,
      user: userId, // Changed from 'user' to 'customerId'
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete it",
      });
    }

    // Remove review reference from product
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: reviewId },
    });

    await ProductReview.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
});

export default router;
