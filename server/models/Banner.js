// models/Banner.js
import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Banner", bannerSchema);
