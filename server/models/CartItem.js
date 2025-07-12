const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema(
  {
    cart: { // cartID (Foreign Key) - References Cart
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Cart',
    },
    product: { // productID (Foreign Key) - References Product
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    addedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;  