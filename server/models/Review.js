const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
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
    order: { // orderID (Foreign Key) - References Order (Optional, if review is not tied to a specific order)
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Made optional as a user might review a product they didn't buy through the system
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: false,
    },
    comment: {
      type: String,
      required: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      required: true,
      default: false,
    },
    isApproved: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;