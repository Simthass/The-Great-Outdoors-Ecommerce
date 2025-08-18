import express from "express";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get all inventory items with product details
// @route   GET /api/inventory
// @access  Private/Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const inventory = await Inventory.find({})
      .populate("product", "name description price imageUrl category sku")
      .sort({ updatedAt: -1 });

    // Get stats
    const totalProducts = inventory.length;
    const lowStock = inventory.filter(
      (item) => item.stockLevel <= item.lowStockThreshold
    ).length;
    const outOfStock = inventory.filter((item) => item.stockLevel === 0).length;

    res.json({
      success: true,
      data: inventory,
      stats: {
        totalProducts,
        lowStock,
        outOfStock,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory",
      error: error.message,
    });
  }
});

// @desc    Get inventory by product ID
// @route   GET /api/inventory/product/:productId
// @access  Private/Admin
router.get("/product/:productId", protect, adminOnly, async (req, res) => {
  try {
    const inventory = await Inventory.findOne({
      product: req.params.productId,
    }).populate("product", "name description price imageUrl category sku");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found for this product",
      });
    }

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Error fetching inventory for product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory for product",
      error: error.message,
    });
  }
});

// @desc    Create inventory record for a product
// @route   POST /api/inventory
// @access  Private/Admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      productId,
      stockLevel,
      lowStockThreshold = 10,
      reorderPoint = 20,
      maxStockLevel,
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if inventory already exists for this product
    const existingInventory = await Inventory.findOne({ product: productId });
    if (existingInventory) {
      return res.status(400).json({
        success: false,
        message: "Inventory record already exists for this product",
      });
    }

    const inventory = new Inventory({
      product: productId,
      stockLevel: stockLevel || 0,
      lowStockThreshold,
      reorderPoint,
      maxStockLevel,
      lastRestocked: new Date(),
    });

    await inventory.save();
    const populatedInventory = await Inventory.findById(inventory._id).populate(
      "product",
      "name description price imageUrl category sku"
    );

    res.status(201).json({
      success: true,
      data: populatedInventory,
      message: "Inventory record created successfully",
    });
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Error creating inventory record",
      error: error.message,
    });
  }
});

// @desc    Update inventory stock level
// @route   PUT /api/inventory/:id
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { stockLevel, lowStockThreshold, reorderPoint, maxStockLevel } =
      req.body;

    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    // Update fields if provided
    if (stockLevel !== undefined) {
      inventory.stockLevel = stockLevel;
      inventory.lastRestocked = new Date();
    }
    if (lowStockThreshold !== undefined)
      inventory.lowStockThreshold = lowStockThreshold;
    if (reorderPoint !== undefined) inventory.reorderPoint = reorderPoint;
    if (maxStockLevel !== undefined) inventory.maxStockLevel = maxStockLevel;

    await inventory.save();
    const updatedInventory = await Inventory.findById(inventory._id).populate(
      "product",
      "name description price imageUrl category sku"
    );

    res.json({
      success: true,
      data: updatedInventory,
      message: "Inventory updated successfully",
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Error updating inventory",
      error: error.message,
    });
  }
});

// @desc    Delete inventory record
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Inventory record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting inventory record",
      error: error.message,
    });
  }
});

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts/low-stock
// @access  Private/Admin
router.get("/alerts/low-stock", protect, adminOnly, async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$stockLevel", "$lowStockThreshold"] },
    })
      .populate("product", "name description price imageUrl category sku")
      .sort({ stockLevel: 1 });

    res.json({
      success: true,
      data: lowStockItems,
      count: lowStockItems.length,
    });
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching low stock alerts",
      error: error.message,
    });
  }
});

// @desc    Get out of stock items
// @route   GET /api/inventory/alerts/out-of-stock
// @access  Private/Admin
router.get("/alerts/out-of-stock", protect, adminOnly, async (req, res) => {
  try {
    const outOfStockItems = await Inventory.find({ stockLevel: 0 })
      .populate("product", "name description price imageUrl category sku")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: outOfStockItems,
      count: outOfStockItems.length,
    });
  } catch (error) {
    console.error("Error fetching out of stock items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching out of stock items",
      error: error.message,
    });
  }
});

// @desc    Bulk update inventory
// @route   PUT /api/inventory/bulk-update
// @access  Private/Admin
router.put("/bulk-update", protect, adminOnly, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, stockLevel, lowStockThreshold, etc. }

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const inventory = await Inventory.findById(update.id);
        if (!inventory) {
          errors.push({ id: update.id, error: "Inventory record not found" });
          continue;
        }

        // Update fields
        if (update.stockLevel !== undefined) {
          inventory.stockLevel = update.stockLevel;
          inventory.lastRestocked = new Date();
        }
        if (update.lowStockThreshold !== undefined)
          inventory.lowStockThreshold = update.lowStockThreshold;
        if (update.reorderPoint !== undefined)
          inventory.reorderPoint = update.reorderPoint;
        if (update.maxStockLevel !== undefined)
          inventory.maxStockLevel = update.maxStockLevel;

        await inventory.save();
        results.push({ id: update.id, success: true });
      } catch (error) {
        errors.push({ id: update.id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    res.status(500).json({
      success: false,
      message: "Error in bulk update",
      error: error.message,
    });
  }
});

export default router;
