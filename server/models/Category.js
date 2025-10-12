import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;