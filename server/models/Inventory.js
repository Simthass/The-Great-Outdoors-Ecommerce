import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
    },
    reorderPoint: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
    },
    maxStockLevel: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      enum: ["Warehouse A", "Warehouse B", "Warehouse C", "Store Front"],
      default: "Warehouse A",
    },
    supplier: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    lastRestocked: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["normal", "low", "out"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

// Update status before saving
inventorySchema.pre("save", function (next) {
  if (this.quantity === 0) {
    this.status = "out";
  } else if (this.quantity <= this.lowStockThreshold) {
    this.status = "low";
  } else {
    this.status = "normal";
  }
  
  // Update lastRestocked if quantity is increased
  if (this.isModified("quantity") && this.quantity > this._originalQuantity) {
    this.lastRestocked = new Date();
  }
  next();
});

// Create text index for searching
inventorySchema.index({ name: "text", supplier: "text", category: "text" });

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;