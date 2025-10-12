// cartRoutes.js - Updated
import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to transform cart data
const transformCart = (cart) => {
  if (!cart) return { items: [] };

  const cartObj = cart.toObject();

  return {
    ...cartObj,
    items: cartObj.items.map((item) => {
      return {
        _id: item._id,
        quantity: item.quantity,
        price: item.price,
        product: item.product
          ? {
              _id: item.product._id,
              productName: item.product.productName || "Unknown Product",
              price: item.product.price || 0,
              imageUrl: item.product.imageUrl || "/products/placeholder.jpg",
              brand: item.product.brand || "Unknown Brand",
            }
          : null,
      };
    }),
  };
};

// Get user's cart - PROTECTED
router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "productName price imageUrl brand",
    });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    const transformedCart = transformCart(cart);
    res.json(transformedCart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add to cart - PROTECTED
router.post("/add", protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product && item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity: parseInt(quantity),
        price: product.price,
      });
    }

    const updatedCart = await cart.save();
    await updatedCart.populate({
      path: "items.product",
      select: "productName price imageUrl brand",
    });

    const transformedCart = transformCart(updatedCart);
    res.json(transformedCart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update item quantity - PROTECTED
router.put("/update/:itemId", protect, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = parseInt(quantity);
    const updatedCart = await cart.save();

    await updatedCart.populate({
      path: "items.product",
      select: "productName price imageUrl brand",
    });

    res.json(transformCart(updatedCart));
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Remove item - PROTECTED
router.delete("/remove/:itemId", protect, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    const updatedCart = await cart.save();
    await updatedCart.populate({
      path: "items.product",
      select: "productName price imageUrl brand",
    });

    res.json(transformCart(updatedCart));
  } catch (error) {
    console.error("Remove item error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Clear cart - PROTECTED
router.delete("/clear", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    const updatedCart = await cart.save();
    res.json(transformCart(updatedCart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
