const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema(
  {
    user: { // userID (Foreign Key) - References User
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: { // productID (Foreign Key) - References Product
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
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

// Optional: Add a unique compound index to ensure a user can only add a product once to their wishlist
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;