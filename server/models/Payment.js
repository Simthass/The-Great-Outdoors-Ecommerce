import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    order: {
      // orderID (Foreign Key) - References Order
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Credit Card",
        "Debit Card",
        "PayPal",
        "Bank Transfer",
        "Cash On Delivery",
      ],
    },
    paymentAmount: {
      type: Number,
      required: true,
      min: [0, "Payment amount cannot be negative"],
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
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    transactionID: {
      type: String,
      required: false, // This comes from payment gateway
      unique: true, // Transaction IDs should be unique
      sparse: true, // Allows multiple documents to have null/undefined transactionID
    },
    gatewayResponse: {
      // Store the raw response from the payment gateway
      type: Object, // Can be a JSON object
      required: false,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, "Refund amount cannot be negative"],
      set: (v) => parseFloat(v.toFixed(2)),
    },
    refundReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
