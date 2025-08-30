import express from "express";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import { authenticateUser, admin } from "../middleware/authMiddleware.js";
import PDFDocument from "pdfkit";
import {
  inventoryUpdateMiddleware,
  syncInventoryStatus,
} from "../middleware/inventorySync.js"; // Add syncInventoryStatus here
const router = express.Router();

// Apply authentication middleware to all inventory routes
router.use(authenticateUser);

// Helper function to calculate inventory stats
const calculateStats = async (filter = {}) => {
  try {
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

    // New aggregation to get value per category for the chart
    const categoryValue = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          totalValue: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    return {
      totalProducts: totalProducts || 0,
      lowStockItems: lowStockItems || 0,
      outOfStockItems: outOfStockItems || 0,
      totalValue: inventoryValue[0]?.totalValue || 0,
      categoryValue: categoryValue || [],
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return {
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalValue: 0,
      categoryValue: [],
    };
  }
};

// Simplified table drawing function
const drawSimpleTable = (doc, headers, rows, startY, title) => {
  const startX = 50;
  let currentY = startY;
  const cellHeight = 20;
  const cellWidth = (doc.page.width - 100) / headers.length;

  // Draw title
  doc.fontSize(14).font("Helvetica-Bold").text(title, startX, currentY);
  currentY += 25;

  // Draw headers
  doc.fontSize(10).font("Helvetica-Bold");
  headers.forEach((header, i) => {
    doc
      .rect(startX + i * cellWidth, currentY, cellWidth, cellHeight)
      .fill("#f0f0f0")
      .stroke();
    doc
      .fillColor("black")
      .text(header, startX + i * cellWidth + 5, currentY + 5, {
        width: cellWidth - 10,
        height: cellHeight - 10,
        align: "left",
      });
  });
  currentY += cellHeight;

  // Draw rows
  doc.font("Helvetica");
  rows.forEach((row, rowIndex) => {
    // Check for page break
    if (currentY + cellHeight > doc.page.height - 50) {
      doc.addPage();
      currentY = 50;

      // Redraw headers on new page
      doc.fontSize(10).font("Helvetica-Bold");
      headers.forEach((header, i) => {
        doc
          .rect(startX + i * cellWidth, currentY, cellWidth, cellHeight)
          .fill("#f0f0f0")
          .stroke();
        doc
          .fillColor("black")
          .text(header, startX + i * cellWidth + 5, currentY + 5, {
            width: cellWidth - 10,
            height: cellHeight - 10,
            align: "left",
          });
      });
      currentY += cellHeight;
    }

    // Draw row background
    const fillColor = rowIndex % 2 === 0 ? "#f9f9f9" : "white";
    row.forEach((cell, i) => {
      doc
        .rect(startX + i * cellWidth, currentY, cellWidth, cellHeight)
        .fill(fillColor)
        .stroke();
      doc
        .fillColor("black")
        .text(String(cell), startX + i * cellWidth + 5, currentY + 5, {
          width: cellWidth - 10,
          height: cellHeight - 10,
          align: "left",
        });
    });
    currentY += cellHeight;
  });

  return currentY + 20;
};

// New helper function to draw a bar chart
const drawBarChart = (doc, data, startY, title) => {
  const startX = 50;
  const chartWidth = doc.page.width - 100;
  const chartHeight = 200;
  let currentY = startY;

  // Chart title
  doc.fontSize(14).font("Helvetica-Bold").text(title, startX, currentY);
  currentY += 25;

  // If no data, display a message and return
  if (data.length === 0) {
    doc
      .fontSize(12)
      .font("Helvetica-Italic")
      .text("No data available for this chart.", startX, currentY + 10);
    return currentY + chartHeight + 40;
  }

  // Find max value for scaling the bars
  const maxValue = Math.max(...data.map((d) => d.totalValue));
  const barWidth = 20;
  const spacing = (chartWidth - data.length * barWidth) / (data.length + 1);
  const chartTopY = currentY + 20;
  const chartBottomY = chartTopY + chartHeight;

  // Draw chart border
  doc.rect(startX, chartTopY, chartWidth, chartHeight).stroke();

  // Draw Y-axis labels
  doc.fontSize(8).font("Helvetica-Bold");
  const yAxisLabelCount = 5;
  for (let i = 0; i <= yAxisLabelCount; i++) {
    const value = (maxValue / yAxisLabelCount) * i;
    const yPos = chartBottomY - (value / maxValue) * chartHeight;
    doc.text(`$${Math.round(value)}`, startX - 45, yPos - 3, {
      width: 40,
      align: "right",
    });
    doc
      .moveTo(startX, yPos)
      .lineTo(startX + chartWidth, yPos)
      .strokeOpacity(0.1)
      .stroke();
  }

  // Draw bars and X-axis labels
  doc.font("Helvetica");
  let currentX = startX + spacing;
  data.forEach((d, i) => {
    const barHeight = (d.totalValue / maxValue) * chartHeight;
    doc
      .fillColor("#4CAF50")
      .rect(currentX, chartBottomY - barHeight, barWidth, barHeight)
      .fill();

    // Label for the bar
    doc
      .fillColor("black")
      .fontSize(8)
      .text(d._id, currentX - 10, chartBottomY + 5, {
        width: barWidth + 20,
        align: "center",
      });

    doc.text(
      `$${d.totalValue.toFixed(2)}`,
      currentX - 10,
      chartBottomY - barHeight - 15,
      { width: barWidth + 20, align: "center" }
    );

    currentX += barWidth + spacing;
  });

  return chartBottomY + 40;
};

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
router.get("/", admin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { supplier: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const inventory = await Inventory.find(query).sort({ updatedAt: -1 });
    const stats = await calculateStats(query);

    const sanitizedInventory = inventory.map((item) => ({
      _id: item._id?.toString() || "",
      name: item.name || "N/A",
      quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
      price: Number.isFinite(item.price) ? item.price : 0,
      lowStockThreshold: Number.isFinite(item.lowStockThreshold)
        ? item.lowStockThreshold
        : 5,
      reorderPoint: Number.isFinite(item.reorderPoint) ? item.reorderPoint : 10,
      maxStockLevel: Number.isFinite(item.maxStockLevel)
        ? item.maxStockLevel
        : null,
      location: item.location || "Warehouse A",
      supplier: item.supplier || "N/A",
      category: item.category || "N/A",
      lastRestocked: item.lastRestocked
        ? item.lastRestocked.toISOString()
        : null,
      status: item.status || "normal",
    }));

    res.json({
      success: true,
      count: inventory.length,
      data: sanitizedInventory,
      stats: stats,
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

// Add this debug route to check product-inventory links
router.get("/:id/linked-products", admin, async (req, res) => {
  try {
    const inventoryId = req.params.id;

    // Find the inventory item
    const inventory = await Inventory.findById(inventoryId);

    // Find products linked to this inventory
    const linkedProducts = await Product.find({ inventory: inventoryId });

    res.json({
      success: true,
      inventory: {
        _id: inventory._id,
        name: inventory.name,
        quantity: inventory.quantity,
        status: inventory.status,
      },
      linkedProducts: linkedProducts.map((p) => ({
        _id: p._id,
        productName: p.productName,
        stockStatus: p.stockStatus,
        inventory: p.inventory,
      })),
      count: linkedProducts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create new inventory item
// @route   POST /api/inventory
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

    const originalQuantity = inventory.quantity;

    if (name !== undefined) inventory.name = name.trim();
    if (quantity !== undefined) inventory.quantity = parseInt(quantity);
    if (price !== undefined) inventory.price = parseFloat(price);
    if (lowStockThreshold !== undefined)
      inventory.lowStockThreshold = parseInt(lowStockThreshold) || 5;
    if (reorderPoint !== undefined)
      inventory.reorderPoint = parseInt(reorderPoint) || 10;
    if (maxStockLevel !== undefined)
      inventory.maxStockLevel = maxStockLevel ? parseInt(maxStockLevel) : null;
    if (location !== undefined) inventory.location = location || "Warehouse A";
    if (supplier !== undefined) inventory.supplier = supplier || null;
    if (category !== undefined) inventory.category = category || null;

    if (quantity !== undefined && parseInt(quantity) > originalQuantity) {
      inventory.lastRestocked = new Date();
    }

    await inventory.save();

    // Manually trigger sync after saving
    await syncInventoryStatus(req.params.id);

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

router.post("/:id/link-product", admin, async (req, res) => {
  try {
    const { productId } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    const product = await Product.findById(productId);

    if (!inventory || !product) {
      return res.status(404).json({
        success: false,
        message: "Inventory or product not found",
      });
    }

    // Link the product to inventory
    product.inventory = inventory._id;
    await product.save();

    // Sync the status
    await syncInventoryStatus(inventory._id);

    res.json({
      success: true,
      message: "Product linked to inventory successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error linking product to inventory:", error);
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

    if (!name || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, quantity, and price are required",
      });
    }

    const inventory = new Inventory({
      name: name.trim(),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5,
      reorderPoint: reorderPoint ? parseInt(reorderPoint) : 10,
      maxStockLevel: maxStockLevel ? parseInt(maxStockLevel) : null,
      location: location || "Warehouse A",
      supplier: supplier || null,
      category: category || null,
      lastRestocked: new Date(),
      status: "normal",
    });

    await inventory.save();

    // Sync status
    await syncInventoryStatus(inventory._id);

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

// In routes/inventory.js
router.post("/:id/sync-products", admin, async (req, res) => {
  try {
    const inventoryId = req.params.id;

    // Find all products that should be linked to this inventory by name matching
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Option 1: Link products by name similarity (you might need to adjust this logic)
    const products = await Product.find({
      productName: { $regex: inventory.name, $options: "i" },
    });

    // Option 2: Or manually link specific product IDs (if provided in request body)
    const { productIds } = req.body;
    if (productIds && Array.isArray(productIds)) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { inventory: inventoryId }
      );
    }

    // Sync the status
    const stockStatus = await syncInventoryStatus(inventoryId);

    res.json({
      success: true,
      message: `Products linked and synced. Status: ${stockStatus}`,
      linkedProducts: products.length,
      inventory: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// @desc    Update inventory stock level
// @route   PATCH /api/inventory/:id/stock
// @access  Private/Admin
router.patch("/:id/stock", admin, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!Number.isFinite(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-negative number",
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const originalQuantity = inventory.quantity;
    inventory.quantity = parseInt(quantity);

    if (parseInt(quantity) > originalQuantity) {
      inventory.lastRestocked = new Date();
    }

    await inventory.save();

    // Manually trigger sync after saving
    await syncInventoryStatus(req.params.id);

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

// @desc    Generate inventory report as PDF
// @route   GET /api/inventory/report
// @access  Private/Admin
router.get("/report", admin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    // Apply filters
    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { supplier: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }

    console.log("Report query:", JSON.stringify(query, null, 2));

    const inventory = await Inventory.find(query).sort({ name: 1 });
    const stats = await calculateStats(query);

    console.log(`Found ${inventory.length} items for report`);

    // Set response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Inventory_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf"`
    );

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      bufferPages: true,
    });

    // Pipe directly to response
    doc.pipe(res);

    // Title and Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Inventory Management Report", 50, 50);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString()}`, 50, 80);
    doc.text(
      `Filter: ${status === "all" ? "All Items" : status || "All Items"}`,
      50,
      95
    );
    if (search) {
      doc.text(`Search: "${search}"`, 50, 110);
    }

    let currentY = search ? 140 : 125;

    // Summary Statistics
    currentY = drawSimpleTable(
      doc,
      ["Metric", "Value"],
      [
        ["Total Products", stats.totalProducts.toString()],
        ["Low Stock Items", stats.lowStockItems.toString()],
        ["Out of Stock Items", stats.outOfStockItems.toString()],
        ["Total Value (LKR)", stats.totalValue.toFixed(2)],
      ],
      currentY,
      "Summary Statistics"
    );

    // New: Graph of Inventory Value by Category
    currentY = drawBarChart(
      doc,
      stats.categoryValue,
      currentY,
      "Inventory Value by Category (LKR)"
    );

    // Main Inventory Table
    if (inventory.length > 0) {
      const inventoryRows = inventory.map((item) => [
        item.name || "N/A",
        (item.quantity || 0).toString(),
        (item.price || 0).toFixed(2),
        ((item.quantity || 0) * (item.price || 0)).toFixed(2),
        item.status || "normal",
        item.location || "N/A",
        item.supplier || "N/A",
      ]);

      currentY = drawSimpleTable(
        doc,
        [
          "Product Name",
          "Qty",
          "Price",
          "Value",
          "Status",
          "Location",
          "Supplier",
        ],
        inventoryRows,
        currentY,
        "Inventory Details"
      );
    }

    // Low Stock Alert Section
    const lowStockItems = inventory.filter((item) => item.status === "low");
    if (lowStockItems.length > 0) {
      const lowStockRows = lowStockItems.map((item) => [
        item.name || "N/A",
        (item.quantity || 0).toString(),
        (item.lowStockThreshold || 5).toString(),
        item.supplier || "N/A",
      ]);

      currentY = drawSimpleTable(
        doc,
        ["Product Name", "Current Qty", "Threshold", "Supplier"],
        lowStockRows,
        currentY,
        "Low Stock Alert"
      );
    }

    // Out of Stock Section
    const outOfStockItems = inventory.filter((item) => item.status === "out");
    if (outOfStockItems.length > 0) {
      const outOfStockRows = outOfStockItems.map((item) => [
        item.name || "N/A",
        item.supplier || "N/A",
        item.location || "N/A",
      ]);

      currentY = drawSimpleTable(
        doc,
        ["Product Name", "Supplier", "Location"],
        outOfStockRows,
        currentY,
        "Out of Stock Items"
      );
    }

    // Footer
    doc.fontSize(10).font("Helvetica").fillColor("gray");
    doc.text(
      "Generated by Inventory Management System",
      50,
      doc.page.height - 50
    );

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating report:", error);

    // Make sure we haven't started streaming the PDF yet
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error generating report",
        error: error.message,
      });
    }
  }
});

export default router;
