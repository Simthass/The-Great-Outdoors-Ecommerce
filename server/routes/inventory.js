import express from "express";
import Inventory from "../models/Inventory.js";
import { authenticateUser, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all inventory routes
router.use(authenticateUser);

// Helper function to calculate inventory stats
const calculateStats = async (filter = {}) => {
  const totalProducts = await Inventory.countDocuments(filter);
  const lowStockItems = await Inventory.countDocuments({
    ...filter,
    $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    quantity: { $gt: 0 },
  });
  const outOfStockItems = await Inventory.countDocuments({
    ...filter,
    quantity: 0,
  });
  
  const inventoryValue = await Inventory.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
      },
    },
  ]);

  return {
    totalProducts,
    lowStockItems,
    outOfStockItems,
    totalValue: inventoryValue[0]?.totalValue || 0,
  };
};

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
router.get("/", admin, async (req, res) => {
  try {
    const { status, search } = req.query;

    // Build query
    const query = {};
    
    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { supplier: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const inventory = await Inventory.find(query).sort({ updatedAt: -1 });
    const stats = await calculateStats(query);

    res.json({
      success: true,
      count: inventory.length,
      data: inventory,
      stats,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private/Admin
router.post("/", admin, async (req, res) => {
  try {
    const {
      name,
      quantity,
      price,
      lowStockThreshold,
      reorderPoint,
      maxStockLevel,
      location,
      supplier,
      category,
    } = req.body;

    const inventory = new Inventory({
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
      reorderPoint: parseInt(reorderPoint) || 10,
      maxStockLevel: maxStockLevel ? parseInt(maxStockLevel) : undefined,
      location: location || "Warehouse A",
      supplier,
      category,
    });

    await inventory.save();

    res.status(201).json({
      success: true,
      data: inventory,
      message: "Inventory item created successfully",
    });
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
router.put("/:id", admin, async (req, res) => {
  try {
    const {
      name,
      quantity,
      price,
      lowStockThreshold,
      reorderPoint,
      maxStockLevel,
      location,
      supplier,
      category,
    } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Update fields
    if (name !== undefined) inventory.name = name;
    if (quantity !== undefined) inventory.quantity = parseInt(quantity);
    if (price !== undefined) inventory.price = parseFloat(price);
    if (lowStockThreshold !== undefined) inventory.lowStockThreshold = parseInt(lowStockThreshold);
    if (reorderPoint !== undefined) inventory.reorderPoint = parseInt(reorderPoint);
    if (maxStockLevel !== undefined) inventory.maxStockLevel = maxStockLevel ? parseInt(maxStockLevel) : null;
    if (location !== undefined) inventory.location = location;
    if (supplier !== undefined) inventory.supplier = supplier;
    if (category !== undefined) inventory.category = category;

    // Update lastRestocked if quantity is increased
    const originalQuantity = inventory.quantity;
    if (parseInt(quantity) > originalQuantity) {
      inventory.lastRestocked = new Date();
    }

    await inventory.save();

    res.json({
      success: true,
      data: inventory,
      message: "Inventory item updated successfully",
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Update inventory stock level
// @route   PATCH /api/inventory/:id/stock
// @access  Private/Admin
router.patch("/:id/stock", admin, async (req, res) => {
  try {
    const { quantity } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Store original quantity for comparison
    const originalQuantity = inventory.quantity;

    // Update quantity
    inventory.quantity = parseInt(quantity);

    // Update lastRestocked if quantity is increased
    if (parseInt(quantity) > originalQuantity) {
      inventory.lastRestocked = new Date();
    }

    await inventory.save();

    res.json({
      success: true,
      data: inventory,
      message: "Stock level updated successfully",
    });
  } catch (error) {
    console.error("Error updating stock level:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
router.delete("/:id", admin, async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;