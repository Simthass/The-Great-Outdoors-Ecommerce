import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user has only one cart
    },
    items: [cartItemSchema],
    sessionId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Update total price virtual
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

// Update total items virtual
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtuals are serialized
cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
