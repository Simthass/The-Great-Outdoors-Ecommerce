import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const router = express.Router();

// Search products
router.get("/products", async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
        results: [],
      });
    }

    // Build search query
    let searchQuery = {
      isActive: true,
      $or: [
        { productName: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { brand: { $regex: q.trim(), $options: "i" } },
        { color: { $regex: q.trim(), $options: "i" } },
      ],
    };

    // Add category filter
    if (category) {
      searchQuery.category = category;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Build sort query
    let sortQuery = {};
    switch (sort) {
      case "price-low":
        sortQuery.price = 1;
        break;
      case "price-high":
        sortQuery.price = -1;
        break;
      case "newest":
        sortQuery.createdAt = -1;
        break;
      case "name-az":
        sortQuery.productName = 1;
        break;
      case "name-za":
        sortQuery.productName = -1;
        break;
      default:
        sortQuery.createdAt = -1;
    }

    const products = await Product.find(searchQuery)
      .populate("category", "categoryName")
      .sort(sortQuery)
      .limit(parseInt(limit));

    // Add full image URLs
    const productsWithUrls = products.map((product) => {
      const productObj = product.toObject();
      if (productObj.imageUrl && !productObj.imageUrl.startsWith("http")) {
        productObj.imageUrl = productObj.imageUrl.startsWith("/")
          ? productObj.imageUrl
          : "/" + productObj.imageUrl;
      }
      return productObj;
    });

    res.json({
      success: true,
      results: productsWithUrls,
      total: productsWithUrls.length,
      query: q.trim(),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
});

// Get search suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    // Get product name suggestions
    const productSuggestions = await Product.find(
      {
        isActive: true,
        productName: { $regex: q.trim(), $options: "i" },
      },
      { productName: 1, _id: 1, imageUrl: 1, price: 1 }
    )
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get brand suggestions
    const brandSuggestions = await Product.distinct("brand", {
      isActive: true,
      brand: { $regex: q.trim(), $options: "i" },
    });

    res.json({
      success: true,
      suggestions: {
        products: productSuggestions,
        brands: brandSuggestions.slice(0, 3),
      },
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get suggestions",
    });
  }
});

export default router;
