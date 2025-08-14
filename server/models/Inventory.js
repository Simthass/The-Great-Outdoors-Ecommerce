import mongoose from "mongoose";

const inventorySchema = mongoose.Schema(
  {
    product: {
      // productID (Foreign Key) - References Product
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
      unique: true, // One inventory record per product
    },
    stockLevel: {
      type: Number,
      required: true,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 10, // Example default
    },
    reorderPoint: {
      type: Number,
      required: true,
      default: 20, // Example default
    },
    maxStockLevel: {
      type: Number,
      required: false,
    },
    lastRestocked: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Only updatedAt is in ER, but createdAt is useful
  }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
