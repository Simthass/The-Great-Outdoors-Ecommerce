<<<<<<< HEAD
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
=======
import mongoose from "mongoose";
>>>>>>> 2ea1a0e48f5027ef2d66d3b71f6b60a587c60672

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Changed from String to ObjectId for proper reference
    ref: "Product", // Added reference to Product model
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true, // Added trim to remove whitespace
    maxlength: 100, // Added maximum length
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"], // Added custom error message
    max: [1000, "Quantity cannot exceed 1000"], // Added maximum quantity
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"], // Added custom error message
    set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
  },
  total: {
    type: Number,
    required: true,
    min: [0, "Total cannot be negative"], // Added custom error message
    set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
  },
  image: {
    // Added product image for order history
    type: String,
    required: false,
  },
  sku: {
    // Added SKU for product identification
    type: String,
    required: false,
    trim: true,
  },
});

const addressSchema = new mongoose.Schema({
  // Extracted address to reusable schema
  addressLine1: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  addressLine2: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  province: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    validate: {
      // Added postal code validation
      validator: function (v) {
        // Basic postal code validation - customize for your country
        return /^[A-Za-z0-9\- ]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid postal code!`,
    },
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: "Canada", // Set default country
  },
  phoneNumber: {
    // Added phone number for shipping
    type: String,
    required: false,
    trim: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true, // Added index for better query performance
    },
    orderId: {
      // Moved orderId to schema definition for better control
      type: String,
      unique: true,
      index: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      set: (v) => parseFloat(v.toFixed(2)), // Ensure 2 decimal places
    },
    orderStatus: {
      type: String,
      required: true,
      enum: {
        values: [
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Refunded",
        ],
        message: "{VALUE} is not a valid order status",
      },
      default: "Pending",
      index: true, // Added index for better query performance
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: {
        values: ["Pending", "Paid", "Failed", "Refunded"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "Pending",
      index: true, // Added index for better query performance
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: [
          "Credit Card",
          "Debit Card",
          "PayPal",
          "Bank Transfer",
          "Cash On Delivery",
        ],
        message: "{VALUE} is not a valid payment method",
      },
      default: "Cash On Delivery",
    },
    paymentId: {
      // Added payment reference
      type: String,
      required: false,
    },
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    trackingNumber: {
      type: String,
      required: false,
      trim: true,
    },
    carrier: {
      // Added shipping carrier
      type: String,
      required: false,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
      required: false,
    },
    actualDelivery: {
      type: Date,
      required: false,
    },
<<<<<<< HEAD
    items: [OrderItemSchema],
    notes: {
      type: String
    }
=======
    items: {
      type: [OrderItemSchema],
      validate: {
        // Validate at least one item in order
        validator: function (v) {
          return v.length > 0;
        },
        message: "Order must have at least one item",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    couponCode: {
      // Added coupon/discount code
      type: String,
      required: false,
      trim: true,
    },
    ipAddress: {
      // Added for fraud detection
      type: String,
      required: false,
    },
>>>>>>> 2ea1a0e48f5027ef2d66d3b71f6b60a587c60672
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to object
  }
);

<<<<<<< HEAD
// Generate unique order ID
orderSchema.pre('save', function(next) {
    if (!this.orderId) {
        this.orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

=======
// Virtual for formatted order date
orderSchema.virtual("formattedDate").get(function () {
  return this.orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for order total with tax and shipping
orderSchema.virtual("grandTotal").get(function () {
  return this.totalAmount + this.tax + this.shippingCost - this.discount;
});

// Generate unique order ID
orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
  }
  next();
});

// Update product stock when order is completed
orderSchema.post("save", async function (doc, next) {
  if (doc.orderStatus === "Processing") {
    // Implement logic to update product stock
    // This would require Product model import
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

>>>>>>> 2ea1a0e48f5027ef2d66d3b71f6b60a587c60672
export default Order;
