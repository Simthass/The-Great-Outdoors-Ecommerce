// routes/productReports.js
import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET comprehensive product analytics - Fixed route path
router.get("/sales-analytics", protect, admin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 12 months if no date range provided
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // 1. Total Products Analytics
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments();

    // 2. Product Distribution by Category
    const categoryDistribution = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: "$price" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          _id: 1,
          categoryName: "$categoryInfo.categoryName",
          productCount: "$count",
          totalValue: 1,
          averagePrice: { $divide: ["$totalValue", "$count"] },
        },
      },
      { $sort: { productCount: -1 } },
    ]);

    // 3. Price Range Analysis
    const priceRanges = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$price", 1000] }, then: "Under Rs. 1,000" },
                { case: { $lt: ["$price", 5000] }, then: "Rs. 1,000 - 5,000" },
                {
                  case: { $lt: ["$price", 10000] },
                  then: "Rs. 5,000 - 10,000",
                },
                {
                  case: { $lt: ["$price", 25000] },
                  then: "Rs. 10,000 - 25,000",
                },
                {
                  case: { $lt: ["$price", 50000] },
                  then: "Rs. 25,000 - 50,000",
                },
              ],
              default: "Above Rs. 50,000",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Featured and Hot Products Analytics
    const specialProducts = await Product.aggregate([
      {
        $group: {
          _id: null,
          featuredCount: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          hotThisWeekCount: { $sum: { $cond: ["$isHotThisWeek", 1, 0] } },
          regularCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isFeatured", false] },
                    { $eq: ["$isHotThisWeek", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // 5. Brand Analysis
    const brandAnalysis = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$brand",
          productCount: { $sum: 1 },
          totalValue: { $sum: "$price" },
          averagePrice: { $avg: "$price" },
        },
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 },
    ]);

    // 6. Sales Analytics (if orders exist) - Fixed field names
    let salesAnalytics = null;
    let topSellingProducts = [];
    let categorySales = [];
    let monthlySales = [];

    try {
      // Check if Order model exists and has data
      const orderCount = await Order.countDocuments();

      if (orderCount > 0) {
        // Top selling products - Fixed field names to match Order schema
        topSellingProducts = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              orderStatus: { $in: ["Delivered", "Processing"] }, // Fixed status names
            },
          },
          { $unwind: "$items" }, // Fixed: items instead of orderItems
          {
            $group: {
              _id: "$items.productId", // Fixed: productId instead of product
              totalQuantitySold: { $sum: "$items.quantity" },
              totalRevenue: {
                $sum: {
                  $multiply: ["$items.quantity", "$items.price"],
                },
              },
              orderCount: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productInfo",
            },
          },
          { $unwind: "$productInfo" },
          {
            $project: {
              productName: "$productInfo.productName",
              brand: "$productInfo.brand",
              totalQuantitySold: 1,
              totalRevenue: 1,
              orderCount: 1,
              averageOrderValue: { $divide: ["$totalRevenue", "$orderCount"] },
            },
          },
          { $sort: { totalQuantitySold: -1 } },
          { $limit: 10 },
        ]);

        // Category sales performance - Fixed field names
        categorySales = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              orderStatus: { $in: ["Delivered", "Processing"] },
            },
          },
          { $unwind: "$items" },
          {
            $lookup: {
              from: "products",
              localField: "items.productId", // Fixed field name
              foreignField: "_id",
              as: "productInfo",
            },
          },
          { $unwind: "$productInfo" },
          {
            $lookup: {
              from: "categories",
              localField: "productInfo.category",
              foreignField: "_id",
              as: "categoryInfo",
            },
          },
          { $unwind: "$categoryInfo" },
          {
            $group: {
              _id: "$categoryInfo._id",
              categoryName: { $first: "$categoryInfo.categoryName" },
              totalQuantitySold: { $sum: "$items.quantity" },
              totalRevenue: {
                $sum: {
                  $multiply: ["$items.quantity", "$items.price"],
                },
              },
              uniqueProducts: { $addToSet: "$productInfo._id" },
            },
          },
          {
            $project: {
              categoryName: 1,
              totalQuantitySold: 1,
              totalRevenue: 1,
              uniqueProductCount: { $size: "$uniqueProducts" },
              averageRevenuePerProduct: {
                $divide: ["$totalRevenue", { $size: "$uniqueProducts" }],
              },
            },
          },
          { $sort: { totalRevenue: -1 } },
        ]);

        // Monthly sales trend
        monthlySales = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              orderStatus: { $in: ["Delivered", "Processing"] },
            },
          },
          { $unwind: "$items" },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              totalQuantity: { $sum: "$items.quantity" },
              totalRevenue: {
                $sum: {
                  $multiply: ["$items.quantity", "$items.price"],
                },
              },
              orderCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 1,
              month: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                },
              },
              totalQuantity: 1,
              totalRevenue: 1,
              orderCount: 1,
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        salesAnalytics = {
          totalOrdersInPeriod: await Order.countDocuments({
            createdAt: { $gte: start, $lte: end },
          }),
          completedOrdersInPeriod: await Order.countDocuments({
            createdAt: { $gte: start, $lte: end },
            orderStatus: { $in: ["Delivered", "Processing"] },
          }),
        };
      }
    } catch (error) {
      console.log(
        "Orders collection not available or error in sales analytics:",
        error.message
      );
    }

    // 7. Recent Product Additions
    const recentProducts = await Product.find({ isActive: true })
      .populate("category", "categoryName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("productName brand price createdAt category");

    // 8. Inventory Value Analysis
    const inventoryValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: "$price" },
          averageProductPrice: { $avg: "$price" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
    ]);

    const analytics = {
      reportMetadata: {
        generatedAt: new Date(),
        dateRange: {
          start,
          end,
        },
        totalProducts,
        totalCategories,
      },
      categoryDistribution,
      priceRanges,
      specialProducts: specialProducts[0] || {
        featuredCount: 0,
        hotThisWeekCount: 0,
        regularCount: totalProducts,
      },
      brandAnalysis,
      salesAnalytics,
      topSellingProducts,
      categorySales,
      monthlySales,
      recentProducts,
      inventoryValue: inventoryValue[0] || {
        totalInventoryValue: 0,
        averageProductPrice: 0,
        maxPrice: 0,
        minPrice: 0,
      },
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error generating product analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate product analytics",
      error: error.message,
    });
  }
});

// GET basic product metrics for quick overview
router.get("/metrics", protect, admin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments();
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    const hotProducts = await Product.countDocuments({ isHotThisWeek: true });

    const metrics = {
      totalProducts,
      totalCategories,
      featuredProducts,
      hotProducts,
      generatedAt: new Date(),
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching product metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product metrics",
      error: error.message,
    });
  }
});

export default router;
