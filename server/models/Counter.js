import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // e.g., "review"
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);
