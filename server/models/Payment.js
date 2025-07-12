const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    order: { // orderID (Foreign Key) - References Order
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash On Delivery'],
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    transactionID: {
      type: String,
      required: false, // This comes from payment gateway
      unique: true, // Transaction IDs should be unique
      sparse: true, // Allows multiple documents to have null/undefined transactionID
    },
    gatewayResponse: { // Store the raw response from the payment gateway
      type: Object, // Can be a JSON object
      required: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;