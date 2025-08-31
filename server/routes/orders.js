import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { protect } from "../middleware/authMiddleware.js";
import Address from "../models/Address.js";
import Inventory from "../models/Inventory.js";
import { syncInventoryStatus } from "../middleware/inventorySync.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Input validation for checkout
const validateCheckoutInput = [
  body("paymentMethod")
    .optional()
    .isIn(["Cash On Delivery", "Credit Card", "Debit Card", "PayPal"])
    .withMessage("Invalid payment method"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters")
    .trim()
    .escape(),
  body("couponCode")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Coupon code cannot exceed 50 characters")
    .matches(/^[A-Z0-9-]*$/)
    .withMessage("Coupon code can only contain letters, numbers, and hyphens")
    .customSanitizer((value) => value.toUpperCase().trim()),
];

// @desc    Create new order from cart with coupon support
// @route   POST /api/orders/checkout
// @access  Private
router.post("/checkout", protect, validateCheckoutInput, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    console.log("Checkout request received from user:", req.user._id);

    const {
      paymentMethod = "Cash On Delivery",
      notes = "",
      couponCode = "",
    } = req.body;

    // Get user's cart with proper population and security
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "productName price imageUrl brand stock inventory isActive",
      match: { isActive: true }, // Only include active products
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

    // Filter out any products that didn't populate (inactive or deleted products)
    cart.items = cart.items.filter((item) => item.product !== null);

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart contains only inactive products",
      });
    }

    // Calculate subtotal
    let subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Validate and apply coupon if provided
    let discount = 0;
    let couponDetails = null;
    let couponId = null;

    if (couponCode) {
      const couponValidation = await Coupon.validateCoupon(
        couponCode,
        subtotal,
        req.user._id
      );

      if (!couponValidation.valid) {
        return res.status(400).json({
          success: false,
          message: couponValidation.message,
        });
      }

      discount = couponValidation.coupon.discountAmount;
      couponDetails = {
        code: couponValidation.coupon.code,
        discountType: couponValidation.coupon.discountType,
        discountValue: couponValidation.coupon.discountValue,
        discountAmount: discount,
        minOrderAmount: couponValidation.coupon.minOrderAmount,
        maxDiscountAmount: couponValidation.coupon.maxDiscountAmount,
      };
      couponId = couponValidation.coupon._id;
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

    // Calculate shipping
    const shippingCost = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const totalAmount = subtotal - discount + shippingCost;

    // Validate total amount to prevent negative values
    if (totalAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total after discounts",
      });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    const inventoryUpdates = []; // Track inventory updates
    const stockValidationErrors = [];

    for (const item of cart.items) {
      if (!item.product) {
        stockValidationErrors.push(
          "Some products in your cart are no longer available"
        );
        break;
      }

      // Check product stock availability
      if (item.product.stock < item.quantity) {
        stockValidationErrors.push(
          `Insufficient stock for ${item.product.productName}. Available: ${item.product.stock}`
        );
        continue;
      }

      // Check inventory stock if product is linked to inventory
      if (item.product.inventory) {
        const inventoryItem = item.product.inventory;
        if (inventoryItem.quantity < item.quantity) {
          stockValidationErrors.push(
            `Insufficient inventory for ${item.product.productName}. Available: ${inventoryItem.quantity}`
          );
          continue;
        }
        // Store inventory update info
        inventoryUpdates.push({
          inventoryId: inventoryItem._id,
          quantityToDeduct: item.quantity,
          productName: item.product.productName,
        });
      }

      const itemTotal = item.product.price * item.quantity;

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

    // If there are stock validation errors, return them
    if (stockValidationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: stockValidationErrors[0],
        errors: stockValidationErrors,
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderDate: new Date(),
      totalAmount: subtotal,
      shippingCost: shippingCost,
      discount: discount,
      grandTotal: totalAmount,
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
      notes: notes.substring(0, 500), // Limit notes length
      couponCode: couponCode || null,
      couponDetails: couponDetails,
      ipAddress: req.ip || req.connection.remoteAddress,
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

    // Update coupon usage if applicable
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (coupon) {
        updatePromises.push(coupon.incrementUsage(req.user._id));
      }
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
    if (couponId) {
      console.log(`Applied coupon: ${couponCode}`);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: {
        order: {
          _id: order._id,
          orderId: order.orderId,
          totalAmount: order.totalAmount,
          shippingCost: order.shippingCost,
          discount: order.discount,
          grandTotal: order.grandTotal,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
          couponCode: order.couponCode,
        },
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);

    // Don't expose internal error details to client
    let errorMessage = "Failed to process order. Please try again.";
    let statusCode = 500;

    if (error.name === "ValidationError") {
      errorMessage = "Invalid order data";
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = "Order already exists with these details";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
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
