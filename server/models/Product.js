const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    category: { // categoryID (Foreign Key) - References Category
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    weight: {
      type: Number,
      required: false,
    },
    dimensions: { // Storing as a string or a nested object if more complex
      type: String, // e.g., "10x5x2 cm"
      required: false,
    },
    brand: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
    },
    size: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    // Assuming product images will be stored as URLs
    imageUrl: {
      type: String,
      required: false, // Can be true if every product must have an image
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;