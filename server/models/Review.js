import mongoose from "mongoose";
import Counter from "./Counter.js";

const reviewSchema = new mongoose.Schema(
  {
    reviewId: { type: String, unique: true }, // e.g., R001
    rating: { type: Number, min: 1, max: 5, required: true },
    description: { type: String, default: "" },
    customerId: { type: String, required: true },
    productId: { type: String, required: true },
    status: { type: String, enum: ["Y", "N"], default: "Y" },
    dateAdded: { type: Date, default: Date.now },
    response: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-generate reviewId like R001 on create (if not provided)
reviewSchema.pre("save", async function (next) {
  if (this.reviewId) return next();
  const counter = await Counter.findOneAndUpdate(
    { key: "review" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(counter.seq).padStart(3, "0"); // 001, 002, ...
  this.reviewId = `R${num}`;
  next();
});

// Helpful indexes
reviewSchema.index({ productId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ dateAdded: -1 });

export default mongoose.model("Review", reviewSchema);
