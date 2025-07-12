const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true, // Category names should ideally be unique
    },
    description: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;