const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: { // userID (Foreign Key) - References User
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      required: true,
      // This will be updated by the Payment model, but good to have a default
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash On Delivery'],
      default: 'Cash On Delivery',
    },
    // Embedded shipping and billing address details (or you could reference Address model)
    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, required: false },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, required: false },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    trackingNumber: {
      type: String,
      required: false,
    },
    estimatedDelivery: {
      type: Date,
      required: false,
    },
    actualDelivery: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;