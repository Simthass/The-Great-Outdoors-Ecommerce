// routes/adminDashboard.js
import express from "express";
import { protect, admin } from "../middleware/auth.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ProductReview from "../models/ProductReview.js";

const router = express.Router();

// Get recent reviews - ADD THIS ENDPOINT to adminDashboard.js
router.get("/reviews", protect, admin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort || "-createdAt";

    console.log("Fetching recent reviews with limit:", limit, "sort:", sort);

    const reviews = await ProductReview.find({ status: "active" })
      .sort(sort)
      .limit(limit)
      .populate("user", "firstName lastName")
      .populate("product", "productName");

    console.log("Found reviews:", reviews.length);

    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      reviewerName:
        review.reviewerName ||
        `${review.user?.firstName || ""} ${
          review.user?.lastName || ""
        }`.trim() ||
        "Customer",
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      productName: review.product?.productName,
    }));

    res.json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Recent reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent reviews",
    });
  }
});

// Get dashboard statistics
router.get("/dashboard/stats", protect, admin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: thirtyDaysAgo },
          paymentStatus: "Paid",
          orderStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const previousRevenueData = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
            $lt: thirtyDaysAgo,
          },
          paymentStatus: "Paid",
          orderStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const currentRevenue = revenueData[0]?.totalRevenue || 0;
    const previousRevenue = previousRevenueData[0]?.totalRevenue || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? Math.round(
            ((currentRevenue - previousRevenue) / previousRevenue) * 100
          )
        : 0;

    const totalCustomers = await User.countDocuments({ role: "Customer" });
    const newCustomers = await User.countDocuments({
      role: "Customer",
      createdAt: { $gte: thirtyDaysAgo },
    });

    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      stockStatus: "low_stock",
    });

    const totalOrders = await Order.countDocuments({
      orderStatus: { $ne: "Cancelled" },
    });
    const pendingOrders = await Order.countDocuments({
      orderStatus: "Pending",
    });

    res.json({
      success: true,
      data: {
        totalRevenue: currentRevenue,
        revenueGrowth,
        totalCustomers,
        newCustomers,
        totalProducts,
        lowStockProducts,
        totalOrders,
        pendingOrders,
        pageViews: 0,
        conversionRate: "2.5%",
        avgRating: "4.2",
        pendingTasks: pendingOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
    });
  }
});

// Get recent activities
router.get("/activities", protect, admin, async (req, res) => {
  try {
    const recentOrders = await Order.find({ orderStatus: { $ne: "Cancelled" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "firstName lastName");

    const activities = recentOrders.map((order) => ({
      description: `New order placed #${order.orderId}`,
      timestamp: order.createdAt,
    }));

    const newUsers = await User.find({ role: "Customer" })
      .sort({ createdAt: -1 })
      .limit(3);

    newUsers.forEach((user) => {
      activities.push({
        description: `New customer registered: ${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt,
      });
    });

    const recentReviews = await ProductReview.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("user", "firstName lastName");

    recentReviews.forEach((review) => {
      activities.push({
        description: `New review submitted by ${
          review.user?.firstName || "Customer"
        }`,
        timestamp: review.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      activities: activities.slice(0, 5),
    });
  } catch (error) {
    console.error("Activities error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activities",
    });
  }
});

// Get top selling products
router.get("/products/top-selling", protect, admin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topProducts = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "Cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    // Get complete product details including images
    const productIds = topProducts.map((p) => p._id);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "images imageUrl price productName"
    );

    // Merge the data
    const productsWithDetails = topProducts.map((product) => {
      const productDetail = products.find(
        (p) => p._id.toString() === product._id.toString()
      );
      return {
        _id: product._id,
        productName: product.productName || productDetail?.productName,
        totalSold: product.totalSold,
        revenue: product.revenue,
        images: productDetail?.images || [],
        imageUrl: productDetail?.imageUrl,
        price: productDetail?.price || 0,
      };
    });

    res.json({
      success: true,
      products: productsWithDetails,
    });
  } catch (error) {
    console.error("Top products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top products",
    });
  }
});

// Get recent reviews - FIXED ENDPOINT
router.get("/reviews/recent", protect, admin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const reviews = await ProductReview.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "firstName lastName")
      .populate("product", "productName");

    console.log("Found reviews:", reviews.length);

    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      reviewerName:
        review.reviewerName ||
        `${review.user?.firstName || ""} ${
          review.user?.lastName || ""
        }`.trim() ||
        "Customer",
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      productName: review.product?.productName,
    }));

    res.json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Recent reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent reviews",
    });
  }
});

export default router;
