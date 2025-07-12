const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema(
  {
    order: { // orderID (Foreign Key) - References Order
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    product: { // productID (Foreign Key) - References Product
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unitPrice: { // Price at the time of order
      type: Number,
      required: true,
    },
    totalPrice: { // quantity * unitPrice
      type: Number,
      required: true,
    },
    discount: { // Item-specific discount
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt (though not explicitly in ER for this)
  }
);

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;