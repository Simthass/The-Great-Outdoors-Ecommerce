import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
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
    dimensions: {
      type: String,
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
    images: [
      {
        type: String,
        required: false,
      },
    ],
    // Keep the single imageUrl for backward compatibility
    imageUrl: {
      type: String,
      required: false,
    },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },
    isHotThisWeek: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Add this field to the existing productSchema
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductReview",
      },
    ],
  },

  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
