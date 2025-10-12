const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: true,
      unique: true,
    },
    contactPerson: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    address: { // Could be a string or a nested object for more structure
      type: String,
      required: false,
    },
    paymentTerms: {
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

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;