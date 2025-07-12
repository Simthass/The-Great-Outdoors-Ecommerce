const mongoose = require('mongoose');

const productSupplierSchema = mongoose.Schema(
  {
    product: { // productID (Foreign Key) - References Product
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    supplier: { // supplierID (Foreign Key) - References Supplier
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Supplier',
    },
    supplierPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    leadTime: { // In days, for example
      type: Number,
      required: false,
    },
    minimumOrderQty: {
      type: Number,
      required: false,
      default: 1,
    },
    isPreferred: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Optional: Add a unique compound index to ensure a product-supplier pair is unique
productSupplierSchema.index({ product: 1, supplier: 1 }, { unique: true });

const ProductSupplier = mongoose.model('ProductSupplier', productSupplierSchema);

module.exports = ProductSupplier;