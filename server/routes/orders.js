// routes/orders.js
import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";
import Address from "../models/Address.js";
import Inventory from "../models/Inventory.js";
import { syncInventoryStatus } from "../middleware/inventorySync.js";

const router = express.Router();

// @desc    Create new order from cart
// @route   POST /api/orders/checkout
// @access  Private
// routes/orders.js - Update your checkout route
router.post("/checkout", protect, async (req, res) => {
  try {
    console.log("Checkout request received from user:", req.user._id);

    const {
      paymentMethod = "Cash On Delivery",
      notes = "",
      couponCode = "",
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "productName price imageUrl brand stock inventory",
      populate: {
        path: "inventory",
        select: "quantity name",
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Get user's default address
    const defaultAddress = await Address.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!defaultAddress) {
      return res.status(400).json({
        success: false,
        message: "No default address found. Please add an address first.",
      });
    }

    // Calculate totals and validate stock
    let subtotal = 0;
    const orderItems = [];
    const inventoryUpdates = []; // Track inventory updates

    // Validate stock and prepare order items
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "Some products in your cart are no longer available",
        });
      }

      // Check product stock availability
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.productName}. Available: ${item.product.stock}`,
        });
      }

      // Check inventory stock if product is linked to inventory
      if (item.product.inventory) {
        const inventoryItem = item.product.inventory;
        if (inventoryItem.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${item.product.productName}. Available: ${inventoryItem.quantity}`,
          });
        }
        // Store inventory update info
        inventoryUpdates.push({
          inventoryId: inventoryItem._id,
          quantityToDeduct: item.quantity,
          productName: item.product.productName,
        });
      }

      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.product._id,
        productName: item.product.productName,
        quantity: item.quantity,
        price: item.product.price,
        total: itemTotal,
        image: item.product.imageUrl,
        sku: item.product.sku || "",
      });
    }

    // Calculate tax and shipping
    const taxRate = 0.13; // 13% tax
    const tax = subtotal * taxRate;
    const shippingCost = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const discount = 0; // Implement coupon logic if needed

    const totalAmount = subtotal + tax + shippingCost - discount;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderDate: new Date(),
      totalAmount: subtotal,
      tax: tax,
      shippingCost: shippingCost,
      discount: discount,
      orderStatus: "Processing",
      paymentStatus:
        paymentMethod === "Cash On Delivery" ? "Pending" : "Pending",
      paymentMethod: paymentMethod,
      shippingAddress: {
        addressType: defaultAddress.addressType,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2 || "",
        city: defaultAddress.city,
        province: defaultAddress.province,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country || "Sri Lanka",
        phoneNumber: defaultAddress.phoneNumber || "",
        instructions: defaultAddress.instructions || "",
      },
      billingAddress: {
        addressType: defaultAddress.addressType,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2 || "",
        city: defaultAddress.city,
        province: defaultAddress.province,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country || "Sri Lanka",
        phoneNumber: defaultAddress.phoneNumber || "",
      },
      items: orderItems,
      notes: notes,
      couponCode: couponCode,
      ipAddress: req.ip,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    // Update product stock and inventory quantities
    const updatePromises = [];

    // Update product stock
    for (const item of cart.items) {
      updatePromises.push(
        Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: -item.quantity } },
          { new: true }
        )
      );
    }

    // Update inventory quantities
    for (const update of inventoryUpdates) {
      console.log(
        `Deducting ${update.quantityToDeduct} from inventory ${update.inventoryId} for ${update.productName}`
      );

      updatePromises.push(
        Inventory.findByIdAndUpdate(
          update.inventoryId,
          { $inc: { quantity: -update.quantityToDeduct } },
          { new: true }
        ).then(async (updatedInventory) => {
          if (updatedInventory) {
            console.log(
              `Updated inventory ${updatedInventory.name}: ${updatedInventory.quantity} remaining`
            );
            // Sync inventory status after update
            await syncInventoryStatus(update.inventoryId);
          }
          return updatedInventory;
        })
      );
    }

    // Execute all updates
    await Promise.all(updatePromises);

    // Clear the cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    console.log("Order created successfully:", order.orderId);
    console.log(`Updated ${inventoryUpdates.length} inventory items`);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: {
        order: {
          _id: order._id,
          orderId: order.orderId,
          totalAmount: order.totalAmount,
          tax: order.tax,
          shippingCost: order.shippingCost,
          grandTotal: order.grandTotal,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process order. Please try again.",
      error: error.message,
    });
  }
});
// @desc    Get user's orders
// @route   GET /api/orders/user
// @access  Private
router.get("/user", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sort = req.query.sort || "-createdAt";

    const skip = (page - 1) * limit;

    // Build query
    let query = { user: req.user._id };
    if (status) {
      query.orderStatus = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "items.productId",
        select: "productName imageUrl brand",
        model: "Product",
      });

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});
// In your server/routes/orders.js - Add this BEFORE any /:id routes
router.get("/all", async (req, res) => {
  try {
    const { limit = 1000 } = req.query;

    const orders = await Order.find({})
      .populate("user", "firstName lastName email city state role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        count: orders.length,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});
// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({
      path: "items.productId",
      select: "productName imageUrl brand",
      model: "Product",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get single order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (["Shipped", "Delivered", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    // Update order status
    order.orderStatus = "Cancelled";
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
});

export default router;
