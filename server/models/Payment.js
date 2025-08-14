import mongoose from 'mongoose';

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
      set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
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
    currency: {
      type: String,
      default: 'CAD',
      required: true
    },
    refundAmount: {
      type: Number,
      default: 0,
      set: (v) => parseFloat(v.toFixed(2))
    },
    refundDate: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for net amount (payment amount - refund amount)
paymentSchema.virtual('netAmount').get(function() {
  return this.paymentAmount - this.refundAmount;
});

// Generate transaction ID if not provided
paymentSchema.pre('save', function(next) {
  if (!this.transactionID && this.paymentStatus === 'Paid') {
    this.transactionID = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
