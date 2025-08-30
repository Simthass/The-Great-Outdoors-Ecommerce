import mongoose from "mongoose";
import Counter from "./Counter.js";

const reviewSchema = new mongoose.Schema(
  {
    reviewId: { type: String, unique: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    description: { type: String, required: true },
    customerName: { type: String, required: true },
    customerTitle: { type: String, default: "" }, // e.g., "CAR RACER", "ACTOR"
    customerImage: { type: String, default: "" }, // URL to customer image
    customerId: { type: String, required: false }, // Optional for admin-created reviews
    productId: { type: String, required: false }, // Optional for home page reviews
    isHomepageReview: { type: Boolean, default: false }, // Flag for homepage display
    status: { type: String, enum: ["Y", "N"], default: "Y" },
    dateAdded: { type: Date, default: Date.now },
    order: { type: Number, default: 0 }, // For ordering on homepage
  },
  { timestamps: true }
);

reviewSchema.pre("save", async function (next) {
  if (this.reviewId) return next();
  const counter = await Counter.findOneAndUpdate(
    { key: "review" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(counter.seq).padStart(3, "0");
  this.reviewId = `R${num}`;
  next();
});

reviewSchema.index({ productId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ isHomepageReview: 1 });
reviewSchema.index({ dateAdded: -1 });

export default mongoose.model("Review", reviewSchema);
