import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper to transform cart data
const transformCart = (cart) => {
  if (!cart) return { items: [] };

  const cartObj = cart.toObject();

  return {
    ...cartObj,
    items: cartObj.items.map((item) => {
      console.log("Transforming item:", item); // Debug log
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

// Get or create cart middleware
const getCart = async (req, res, next) => {
  try {
    let cart;

    if (!req.session.cartId) {
      cart = new Cart({ items: [] });
      await cart.save();
      req.session.cartId = cart._id.toString();
      console.log("Created new cart with ID:", cart._id);
    } else {
      console.log("Looking for cart with ID:", req.session.cartId);

      cart = await Cart.findById(req.session.cartId).populate({
        path: "items.product",
        select: "productName price imageUrl brand",
      });

      if (!cart) {
        console.log("Cart not found, creating new one");
        cart = new Cart({ items: [] });
        await cart.save();
        req.session.cartId = cart._id.toString();
      }
    }

    req.cart = cart;
    next();
  } catch (error) {
    console.error("Cart middleware error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get cart
router.get("/", getCart, async (req, res) => {
  try {
    console.log("Getting cart:", req.cart);
    console.log("Cart items:", req.cart.items);

    // Re-populate to ensure we have the latest product data
    await req.cart.populate({
      path: "items.product",
      select: "productName price imageUrl brand",
    });

    const transformedCart = transformCart(req.cart);
    console.log("Transformed cart:", transformedCart);

    res.json(transformedCart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add to cart
router.post("/add", getCart, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    console.log(
      "Adding to cart - Product ID:",
      productId,
      "Quantity:",
      quantity
    );

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Found product:", product.productName);

    const existingItem = req.cart.items.find(
      (item) => item.product && item.product._id.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
      console.log("Updated existing item quantity:", existingItem.quantity);
    } else {
      req.cart.items.push({
        product: productId,
        quantity: parseInt(quantity),
        price: product.price,
      });
      console.log("Added new item to cart");
    }

    const updatedCart = await req.cart.save();

    // Re-populate the cart with product details
    await updatedCart.populate({
      path: "items.product",
      select: "productName price imageUrl brand",
    });

    console.log("Cart after populate:", updatedCart.items);

    const transformedCart = transformCart(updatedCart);
    console.log("Sending response:", transformedCart);

    res.json(transformedCart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update item quantity
router.put("/update/:itemId", getCart, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    console.log("Updating item:", itemId, "New quantity:", quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const item = req.cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = parseInt(quantity);
    const updatedCart = await req.cart.save();

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

// Remove item
router.delete("/remove/:itemId", getCart, async (req, res) => {
  try {
    const { itemId } = req.params;

    console.log("Removing item:", itemId);

    req.cart.items = req.cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    const updatedCart = await req.cart.save();

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

// Clear cart
router.delete("/clear", getCart, async (req, res) => {
  try {
    req.cart.items = [];
    const updatedCart = await req.cart.save();
    res.json(transformCart(updatedCart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
