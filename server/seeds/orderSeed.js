import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import connectDB from "../config/database.js";

dotenv.config();

const sampleOrders = [
  {
    orderStatus: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    paymentId: "pay_12345",
    tax: 15.6,
    shippingCost: 0,
    discount: 0,
    shippingAddress: {
      addressLine1: "123 Maple Street",
      city: "Toronto",
      province: "Ontario",
      postalCode: "M5V 3A8",
      country: "Canada",
      phoneNumber: "(416) 123-4567",
    },
    billingAddress: {
      addressLine1: "123 Maple Street",
      city: "Toronto",
      province: "Ontario",
      postalCode: "M5V 3A8",
      country: "Canada",
      phoneNumber: "(416) 123-4567",
    },
    trackingNumber: "TRK123456789",
    carrier: "UPS",
    notes: "Please leave at front door",
    orderDate: new Date("2024-01-15"),
    estimatedDelivery: new Date("2024-01-20"),
    actualDelivery: new Date("2024-01-19"),
  },
  // ... (keep your other sample orders as they were)
];

const seedOrders = async () => {
  try {
    await connectDB();
    console.log("🗄️ Connected to MongoDB");

    // Clear existing orders
    await Order.deleteMany({});
    console.log("🗑️ Cleared existing orders");

    // Find the specific user
    const user = await User.findOne({ email: "Simthass@outlook.com" });

    if (!user) {
      throw new Error(
        "User with email Simthass@outlook.com not found. Please create this user first."
      );
    }

    // Get sample products
    const products = await Product.find({}).limit(10);

    if (products.length === 0) {
      throw new Error("No products found. Please run product seeder first.");
    }

    // Create orders with sample data for this specific user
    const ordersToCreate = await Promise.all(
      sampleOrders.map(async (orderData) => {
        const orderProducts = products.slice(
          0,
          Math.floor(Math.random() * 3) + 1
        );

        const items = orderProducts.map((product) => {
          const quantity = Math.floor(Math.random() * 3) + 1;
          return {
            productId: product._id,
            productName: product.productName,
            quantity: quantity,
            price: product.price,
            total: product.price * quantity,
            image: product.imageUrl,
            sku: product.sku || `SKU-${product._id.toString().slice(-6)}`,
          };
        });

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const totalAmount =
          subtotal +
          orderData.shippingCost +
          orderData.tax -
          orderData.discount;

        return {
          ...orderData,
          user: user._id,
          items: items,
          subtotal: subtotal,
          totalAmount: totalAmount,
        };
      })
    );

    const orders = await Order.insertMany(ordersToCreate);
    console.log(`✅ Created ${orders.length} sample orders for ${user.email}`);

    // Detailed output
    console.log("\n📋 Created Orders:");
    orders.forEach((order, index) => {
      console.log(`
      ${index + 1}. Order ID: ${order.orderId}
         Status: ${order.orderStatus}
         Date: ${order.orderDate.toLocaleDateString()}
         Customer: ${user.email}
         Items: ${order.items.length}
         Total: $${order.totalAmount.toFixed(2)}
      `);
    });

    console.log("\n🎉 Order seeding completed successfully!");
    return orders;
  } catch (error) {
    console.error("❌ Error seeding orders:", error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOrders().catch(() => process.exit(1));
}

seedOrders();
