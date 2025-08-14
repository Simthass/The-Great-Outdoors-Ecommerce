import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } else {
      cart = await Cart.findOne({ sessionId }).populate('items.product');
    }

    if (!cart) {
      return res.json({ items: [], total: 0, itemCount: 0 });
    }

    // Calculate cart totals
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    res.json({
      items: cart.items,
      total: parseFloat(total.toFixed(2)),
      itemCount
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    // Validate product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}` 
      });
    }

    // Find or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }
    } else {
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = new Cart({ sessionId, items: [] });
      }
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: `Cannot add ${quantity} items. Maximum available: ${product.stock}` 
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price; // Update price in case it changed
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    
    // Populate product details for response
    await cart.populate('items.product');

    // Calculate cart totals
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    res.json({
      message: 'Item added to cart successfully',
      cart: {
        items: cart.items,
        total: parseFloat(total.toFixed(2)),
        itemCount
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate stock availability
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (quantity > product.stock) {
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${product.stock}` 
        });
      }

      // Update quantity and price
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
    }

    await cart.save();
    await cart.populate('items.product');

    // Calculate cart totals
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    res.json({
      message: 'Cart updated successfully',
      cart: {
        items: cart.items,
        total: parseFloat(total.toFixed(2)),
        itemCount
      }
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item from cart
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();
    await cart.populate('items.product');

    // Calculate cart totals
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    res.json({
      message: 'Item removed from cart successfully',
      cart: {
        items: cart.items,
        total: parseFloat(total.toFixed(2)),
        itemCount
      }
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.json({ message: 'Cart is already empty' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        total: 0,
        itemCount: 0
      }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

// Merge guest cart with user cart on login
export const mergeGuestCart = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Find guest cart and user cart
    const [guestCart, userCart] = await Promise.all([
      Cart.findOne({ sessionId }),
      Cart.findOne({ user: userId })
    ]);

    if (!guestCart || guestCart.items.length === 0) {
      return res.json({ message: 'No guest cart to merge' });
    }

    let targetCart;
    if (!userCart) {
      // Convert guest cart to user cart
      guestCart.user = userId;
      guestCart.sessionId = undefined;
      targetCart = guestCart;
    } else {
      // Merge guest cart items into user cart
      for (const guestItem of guestCart.items) {
        const existingItemIndex = userCart.items.findIndex(
          item => item.product.toString() === guestItem.product.toString()
        );

        if (existingItemIndex >= 0) {
          // Update quantity (you might want to ask user's preference)
          userCart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
          // Add new item
          userCart.items.push(guestItem);
        }
      }

      // Delete guest cart
      await Cart.findByIdAndDelete(guestCart._id);
      targetCart = userCart;
    }

    await targetCart.save();
    await targetCart.populate('items.product');

    // Calculate cart totals
    const total = targetCart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = targetCart.items.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    res.json({
      message: 'Cart merged successfully',
      cart: {
        items: targetCart.items,
        total: parseFloat(total.toFixed(2)),
        itemCount
      }
    });

  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Error merging cart', error: error.message });
  }
};

// Apply coupon to cart
export const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } else {
      cart = await Cart.findOne({ sessionId }).populate('items.product');
    }

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Simple coupon logic (you can enhance this with a Coupon model)
    let discount = 0;
    let discountType = '';
    
    switch (couponCode.toUpperCase()) {
      case 'SAVE10':
        discount = subtotal * 0.1;
        discountType = '10% off';
        break;
      case 'SAVE20':
        discount = subtotal * 0.2;
        discountType = '20% off';
        break;
      case 'FREESHIP':
        discount = subtotal > 100 ? 0 : 15; // Free shipping value
        discountType = 'Free shipping';
        break;
      case 'WELCOME25':
        discount = Math.min(subtotal * 0.25, 50); // Max $50 discount
        discountType = '25% off (max $50)';
        break;
      default:
        return res.status(400).json({ message: 'Invalid coupon code' });
    }

    const tax = subtotal * 0.13; // 13% HST
    const shippingCost = subtotal > 100 ? 0 : 15;
    const finalShipping = couponCode.toUpperCase() === 'FREESHIP' ? 0 : shippingCost;
    const total = subtotal + tax + finalShipping - discount;

    res.json({
      message: 'Coupon applied successfully',
      coupon: {
        code: couponCode,
        discount: parseFloat(discount.toFixed(2)),
        discountType
      },
      cart: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(finalShipping.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount: cart.items.reduce((count, item) => count + item.quantity, 0)
      }
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
};

// Get cart summary for checkout
export const getCartSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID;
    const { couponCode } = req.query;

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } else {
      cart = await Cart.findOne({ sessionId }).populate('items.product');
    }

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      switch (couponCode.toUpperCase()) {
        case 'SAVE10':
          discount = subtotal * 0.1;
          break;
        case 'SAVE20':
          discount = subtotal * 0.2;
          break;
        case 'FREESHIP':
          discount = subtotal > 100 ? 0 : 15;
          break;
        case 'WELCOME25':
          discount = Math.min(subtotal * 0.25, 50);
          break;
      }
    }

    const tax = subtotal * 0.13;
    const baseShipping = subtotal > 100 ? 0 : 15;
    const shippingCost = couponCode === 'FREESHIP' ? 0 : baseShipping;
    const total = subtotal + tax + shippingCost - discount;
    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

    res.json({
      items: cart.items,
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shippingCost.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount
      },
      coupon: couponCode ? {
        code: couponCode,
        discount: parseFloat(discount.toFixed(2))
      } : null
    });

  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ message: 'Error fetching cart summary', error: error.message });
  }
};
