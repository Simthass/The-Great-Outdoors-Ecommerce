import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }
});

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
    items: [OrderItemSchema],
    notes: {
      type: String
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Generate unique order ID
orderSchema.pre('save', function(next) {
    if (!this.orderId) {
        this.orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
