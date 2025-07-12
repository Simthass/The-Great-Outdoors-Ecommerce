const mongoose = require('mongoose');

const cartSchema = mongoose.Schema(
  {
    user: { // userID (Foreign Key) - References User
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true, // One cart per user (1:1 relationship)
    },
    // Cart items will be in a separate collection (CartItem) and linked by cartID
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;