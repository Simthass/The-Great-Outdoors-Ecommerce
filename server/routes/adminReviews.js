import { Router } from "express";
import ProductReview from "../models/ProductReview.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import Product from "../models/Product.js"; // Add this import

const router = Router();

/**
 * GET /api/admin/reviews
 * Admin route to get all reviews with search and sort functionality
 * Optional query: q (search), sort ("asc"|"desc"), status, page, limit
 */
/**
 * GET /api/admin/reviews
 * Admin route to get all reviews with search and sort functionality
 */
router.get("/", protect, admin, async (req, res, next) => {
  try {
    const {
      q = "",
      sort = "desc",
      status = "all",
      page = 1,
      limit = 20,
    } = req.query;

    // Build search filter
    let searchFilter = {};

    if (q) {
      searchFilter.$or = [
        { reviewerName: new RegExp(q, "i") },
        { title: new RegExp(q, "i") },
        { comment: new RegExp(q, "i") },
      ];
    }

    // Add status filter if specified
    if (status !== "all") {
      searchFilter.status = status;
    }

    // Build sort option
    const sortOption = { createdAt: sort === "asc" ? 1 : -1 };

    // Get reviews with pagination
    const reviews = await ProductReview.find(searchFilter)
      .populate("user", "firstName lastName email")
      .populate("product", "productName images")
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const totalReviews = await ProductReview.countDocuments(searchFilter);

    // Format reviews to match frontend expectations
    // Format reviews to match frontend expectations
    const formattedReviews = reviews.map((review) => ({
      reviewId: review._id.toString(),
      rating: review.rating,
      description: review.comment,
      customerId: review.user
        ? `${review.user.firstName} ${review.user.lastName}`
        : "Unknown Customer",
      productId: review.product?.productName || "Unknown Product", // Show product name instead of ID
      dateAdded: review.createdAt?.toISOString()?.split("T")[0] || "",
      status: review.status === "active" ? "Y" : "N",
      response: review.adminResponse || "",
      // Additional fields
      reviewerName: review.reviewerName,
      customerName: review.user
        ? `${review.user.firstName} ${review.user.lastName}`
        : "Unknown",
      customerEmail: review.user?.email || "N/A",
      productName: review.product?.productName || "Product Not Found", // Use productName
      orderNumber: review.order?.orderNumber || "N/A",
      isVerifiedPurchase: review.isVerifiedPurchase,
      helpfulVotes: review.helpfulVotes,
      title: review.title,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
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
      },
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    next(error);
  }
});

/**
 * GET /api/admin/reviews/stats
 * Get review statistics for admin dashboard
 */
router.get("/stats", protect, admin, async (req, res, next) => {
  try {
    const stats = await ProductReview.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          activeReviews: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          hiddenReviews: {
            $sum: { $cond: [{ $eq: ["$status", "hidden"] }, 1, 0] },
          },
          reportedReviews: {
            $sum: { $cond: [{ $eq: ["$status", "reported"] }, 1, 0] },
          },
          verifiedPurchases: {
            $sum: { $cond: ["$isVerifiedPurchase", 1, 0] },
          },
        },
      },
    ]);

    // Get rating distribution
    const ratingDistribution = await ProductReview.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const result = stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      activeReviews: 0,
      hiddenReviews: 0,
      reportedReviews: 0,
      verifiedPurchases: 0,
    };

    res.json({
      success: true,
      data: {
        ...result,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    next(error);
  }
});

/**
 * GET /api/admin/reviews/:id
 * Get single review by ID for admin
 */
router.get("/:id", protect, admin, async (req, res, next) => {
  try {
    const review = await ProductReview.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("product", "productName images price") // Changed to productName
      .populate("order", "orderNumber orderDate")
      .lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Format to match frontend expectations
    const formattedReview = {
      reviewId: review._id.toString(),
      rating: review.rating,
      description: review.comment,
      customerId: review.user
        ? `${review.user.firstName} ${review.user.lastName}`
        : "Unknown Customer", // Show customer name instead of ID
      productId: review.product?.productName || "Unknown Product", // Show product name instead of ID
      dateAdded: review.createdAt?.toISOString()?.split("T")[0] || "",
      status: review.status === "active" ? "Y" : "N",
      response: review.adminResponse || "",
      // Additional fields
      title: review.title,
      reviewerName: review.reviewerName,
      customer: review.user
        ? {
            _id: review.user._id,
            name: `${review.user.firstName} ${review.user.lastName}`,
            email: review.user.email,
          }
        : null,
      product: review.product
        ? {
            _id: review.product._id,
            name: review.product.productName, // Use productName
            images: review.product.images,
            price: review.product.price,
          }
        : null,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    res.json({
      success: true,
      data: formattedReview,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    next(error);
  }
});

/**
 * PUT /api/admin/reviews/:id
 * Update review fields (admin only)
 */
router.put("/:id", protect, admin, async (req, res, next) => {
  try {
    const { response, rating, status, ...otherFields } = req.body;

    // Build update object
    let updateFields = {};

    if (response !== undefined) {
      updateFields.adminResponse = response;
    }

    if (rating !== undefined) {
      updateFields.rating = rating;
    }

    if (status !== undefined) {
      // Convert Y/N to active/hidden
      updateFields.status = status === "Y" ? "active" : "hidden";
    }

    // Add other fields if needed
    Object.assign(updateFields, otherFields);

    const review = await ProductReview.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate("user", "firstName lastName email")
      .populate("product", "productName images price");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Format response to match what frontend expects
    const formattedReview = {
      reviewId: review._id.toString(),
      rating: review.rating,
      description: review.comment,
      customerId: review.user
        ? `${review.user.firstName} ${review.user.lastName}`
        : "Unknown Customer",
      productId: review.product?.productName || "Unknown Product",
      dateAdded: review.createdAt?.toISOString()?.split("T")[0] || "",
      status: review.status === "active" ? "Y" : "N",
      response: review.adminResponse || "",
    };

    res.json({
      success: true,
      message: "Review updated successfully",
      data: formattedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    next(error);
  }
});
/**
 * PUT /api/admin/reviews/:id/status
 * Update review status (admin only)
 */
router.put("/:id/status", protect, admin, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["active", "hidden", "reported"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active', 'hidden', or 'reported'",
      });
    }

    const review = await ProductReview.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Review status updated successfully",
      data: {
        _id: review._id,
        status: review.status,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating review status:", error);
    next(error);
  }
});

/**
 * DELETE /api/admin/reviews/:id
 * Delete review (admin only)
 */
router.delete("/:id", protect, admin, async (req, res, next) => {
  try {
    const review = await ProductReview.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Remove review reference from product if it exists
    if (review.product) {
      await Product.findByIdAndUpdate(review.product, {
        $pull: { reviews: review._id },
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    next(error);
  }
});

/**
 * POST /api/admin/reviews/bulk-action
 * Bulk actions on reviews (status update, delete)
 */
router.post("/bulk-action", protect, admin, async (req, res, next) => {
  try {
    const { reviewIds, action, status } = req.body;

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Review IDs array is required",
      });
    }

    if (!["update-status", "delete"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'update-status' or 'delete'",
      });
    }

    let result;

    if (action === "update-status") {
      if (!["active", "hidden", "reported"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status for update",
        });
      }

      result = await ProductReview.updateMany(
        { _id: { $in: reviewIds } },
        { status }
      );
    } else if (action === "delete") {
      // Remove review references from products first
      const reviews = await ProductReview.find({ _id: { $in: reviewIds } });
      for (const review of reviews) {
        if (review.product) {
          await Product.findByIdAndUpdate(review.product, {
            $pull: { reviews: review._id },
          });
        }
      }

      result = await ProductReview.deleteMany({ _id: { $in: reviewIds } });
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount,
        action,
        ...(status && { status }),
      },
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    next(error);
  }
});

export default router;
