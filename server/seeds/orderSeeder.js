import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

dotenv.config();

const sampleOrders = [
  {
    orderStatus: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    paymentId: 'pay_12345',
    totalAmount: 120.00,
    tax: 15.60,
    shippingCost: 0,
    discount: 0,
    shippingAddress: {
      addressLine1: '123 Maple Street',
      city: 'Toronto',
      province: 'Ontario',
      postalCode: 'M5V 3A8',
      country: 'Canada',
      phoneNumber: '(416) 123-4567'
    },
    billingAddress: {
      addressLine1: '123 Maple Street',
      city: 'Toronto',
      province: 'Ontario',
      postalCode: 'M5V 3A8',
      country: 'Canada',
      phoneNumber: '(416) 123-4567'
    },
    trackingNumber: 'TRK123456789',
    carrier: 'UPS',
    notes: 'Please leave at front door',
    orderDate: new Date('2024-01-15')
  },
  {
    orderStatus: 'Shipped',
    paymentStatus: 'Paid',
    paymentMethod: 'PayPal',
    paymentId: 'pay_67890',
    totalAmount: 85.50,
    tax: 11.12,
    shippingCost: 15.00,
    discount: 5.00,
    shippingAddress: {
      addressLine1: '456 Oak Avenue',
      city: 'Vancouver',
      province: 'British Columbia',
      postalCode: 'V6B 1A1',
      country: 'Canada',
      phoneNumber: '(604) 987-6543'
    },
    billingAddress: {
      addressLine1: '456 Oak Avenue',
      city: 'Vancouver',
      province: 'British Columbia',
      postalCode: 'V6B 1A1',
      country: 'Canada',
      phoneNumber: '(604) 987-6543'
    },
    trackingNumber: 'CP987654321',
    carrier: 'Canada Post',
    orderDate: new Date('2024-01-18')
  },
  {
    orderStatus: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    paymentId: 'pay_13579',
    totalAmount: 200.00,
    tax: 26.00,
    shippingCost: 0,
    discount: 10.00,
    shippingAddress: {
      addressLine1: '789 Pine Road',
      city: 'Calgary',
      province: 'Alberta',
      postalCode: 'T2P 1J9',
      country: 'Canada',
      phoneNumber: '(403) 555-0123'
    },
    billingAddress: {
      addressLine1: '789 Pine Road',
      city: 'Calgary',
      province: 'Alberta',
      postalCode: 'T2P 1J9',
      country: 'Canada',
      phoneNumber: '(403) 555-0123'
    },
    orderDate: new Date('2024-01-20')
  },
  {
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash On Delivery',
    totalAmount: 45.99,
    tax: 5.98,
    shippingCost: 15.00,
    discount: 0,
    shippingAddress: {
      addressLine1: '321 Cedar Lane',
      city: 'Montreal',
      province: 'Quebec',
      postalCode: 'H3B 2Y7',
      country: 'Canada',
      phoneNumber: '(514) 123-7890'
    },
    billingAddress: {
      addressLine1: '321 Cedar Lane',
      city: 'Montreal',
      province: 'Quebec',
      postalCode: 'H3B 2Y7',
      country: 'Canada',
      phoneNumber: '(514) 123-7890'
    },
    orderDate: new Date('2024-01-22')
  }
];

const seedOrders = async () => {
  try {
    await connectDB();
    console.log('🗄️ Connected to MongoDB');

    // Clear existing orders
    await Order.deleteMany({});
    console.log('🗑️ Cleared existing orders');

    // Get sample users and products
    const users = await User.find({}).limit(4);
    const products = await Product.find({}).limit(10);

    if (users.length === 0) {
      console.log('⚠️ No users found. Please run user seeder first.');
      return;
    }

    if (products.length === 0) {
      console.log('⚠️ No products found. Please run product seeder first.');
      return;
    }

    // Create orders with sample data
    const ordersToCreate = sampleOrders.map((orderData, index) => {
      const user = users[index % users.length];
      const orderProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);
      
      const items = orderProducts.map(product => ({
        productId: product._id,
        productName: product.productName,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: product.price,
        total: product.price * (Math.floor(Math.random() * 3) + 1),
        image: product.imageUrl,
        sku: product.sku || `SKU-${product._id.toString().slice(-6)}`
      }));

      return {
        ...orderData,
        user: user._id,
        items: items,
        totalAmount: items.reduce((sum, item) => sum + item.total, 0)
      };
    });

    const orders = await Order.insertMany(ordersToCreate);
    console.log(`✅ Created ${orders.length} sample orders`);

    // Display created orders
    console.log('\n📋 Created Orders:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderId} - ${order.orderStatus} - $${order.totalAmount.toFixed(2)}`);
    });

    console.log('\n🎉 Order seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOrders();
}

export default seedOrders;
