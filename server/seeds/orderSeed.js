import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const orderSeedData = [
  {
    user: new mongoose.Types.ObjectId(),
    orderId: 'ORD-2024-001',
    orderDate: new Date('2024-01-15'),
    totalAmount: 449.98,
    tax: 35.99,
    shippingCost: 15.00,
    discount: 0.00,
    orderStatus: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      addressLine1: '123 Adventure Lane',
      addressLine2: '',
      city: 'Denver',
      province: 'Colorado',
      postalCode: '80202',
      country: 'USA',
      phoneNumber: '+1234567890'
    },
    billingAddress: {
      addressLine1: '123 Adventure Lane',
      addressLine2: '',
      city: 'Denver',
      province: 'Colorado',
      postalCode: '80202',
      country: 'USA',
      phoneNumber: '+1234567890'
    },
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Hiking Boots',
        price: 149.99,
        quantity: 1,
        total: 149.99,
        image: '/images/hiking-boots.jpg',
        sku: 'HB-001'
      },
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Camping Tent',
        price: 299.99,
        quantity: 1,
        total: 299.99,
        image: '/images/camping-tent.jpg',
        sku: 'CT-001'
      }
    ],
    trackingNumber: 'TRK123456789',
    carrier: 'FedEx',
    estimatedDelivery: new Date('2024-01-25'),
    actualDelivery: new Date('2024-01-20')
  },
  {
    user: new mongoose.Types.ObjectId(),
    orderId: 'ORD-2024-002',
    orderDate: new Date('2024-02-01'),
    totalAmount: 179.98,
    tax: 14.40,
    shippingCost: 10.00,
    discount: 5.00,
    orderStatus: 'Shipped',
    paymentStatus: 'Paid',
    paymentMethod: 'PayPal',
    shippingAddress: {
      addressLine1: '456 Mountain View Dr',
      addressLine2: 'Apt 2B',
      city: 'Boulder',
      province: 'Colorado',
      postalCode: '80301',
      country: 'USA',
      phoneNumber: '+1234567891'
    },
    billingAddress: {
      addressLine1: '456 Mountain View Dr',
      addressLine2: 'Apt 2B',
      city: 'Boulder',
      province: 'Colorado',
      postalCode: '80301',
      country: 'USA',
      phoneNumber: '+1234567891'
    },
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Sleeping Bag',
        price: 89.99,
        quantity: 2,
        total: 179.98,
        image: '/images/sleeping-bag.jpg',
        sku: 'SB-002'
      }
    ],
    trackingNumber: 'TRK987654321',
    carrier: 'UPS',
    estimatedDelivery: new Date('2024-02-08')
  },
  {
    user: new mongoose.Types.ObjectId(),
    orderId: 'ORD-2024-003',
    orderDate: new Date('2024-02-10'),
    totalAmount: 288.95,
    tax: 23.12,
    shippingCost: 12.00,
    discount: 10.00,
    orderStatus: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      addressLine1: '789 Forest Trail',
      addressLine2: 'Unit 5',
      city: 'Portland',
      province: 'Oregon',
      postalCode: '97205',
      country: 'USA',
      phoneNumber: '+1234567892'
    },
    billingAddress: {
      addressLine1: '789 Forest Trail',
      addressLine2: 'Unit 5',
      city: 'Portland',
      province: 'Oregon',
      postalCode: '97205',
      country: 'USA',
      phoneNumber: '+1234567892'
    },
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Backpack - 40L',
        price: 199.99,
        quantity: 1,
        total: 199.99,
        image: '/images/backpack-40l.jpg',
        sku: 'BP-003'
      },
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Water Bottle',
        price: 24.99,
        quantity: 2,
        total: 49.98,
        image: '/images/water-bottle.jpg',
        sku: 'WB-004'
      },
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Trail Mix',
        price: 12.99,
        quantity: 3,
        total: 38.97,
        image: '/images/trail-mix.jpg',
        sku: 'TM-005'
      }
    ]
  },
  {
    user: new mongoose.Types.ObjectId(),
    orderId: 'ORD-2024-004',
    orderDate: new Date('2024-02-12'),
    totalAmount: 79.99,
    tax: 6.40,
    shippingCost: 8.00,
    discount: 0.00,
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Debit Card',
    shippingAddress: {
      addressLine1: '321 Pine Street',
      addressLine2: '',
      city: 'Seattle',
      province: 'Washington',
      postalCode: '98101',
      country: 'USA',
      phoneNumber: '+1234567893'
    },
    billingAddress: {
      addressLine1: '321 Pine Street',
      addressLine2: '',
      city: 'Seattle',
      province: 'Washington',
      postalCode: '98101',
      country: 'USA',
      phoneNumber: '+1234567893'
    },
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Camping Stove',
        price: 79.99,
        quantity: 1,
        total: 79.99,
        image: '/images/camping-stove.jpg',
        sku: 'CS-006'
      }
    ]
  },
  {
    user: new mongoose.Types.ObjectId(),
    orderId: 'ORD-2024-005',
    orderDate: new Date('2024-01-28'),
    totalAmount: 89.98,
    tax: 7.20,
    shippingCost: 9.00,
    discount: 0.00,
    orderStatus: 'Cancelled',
    paymentStatus: 'Refunded',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      addressLine1: '654 River Road',
      addressLine2: 'Suite 10',
      city: 'Austin',
      province: 'Texas',
      postalCode: '73301',
      country: 'USA',
      phoneNumber: '+1234567894'
    },
    billingAddress: {
      addressLine1: '654 River Road',
      addressLine2: 'Suite 10',
      city: 'Austin',
      province: 'Texas',
      postalCode: '73301',
      country: 'USA',
      phoneNumber: '+1234567894'
    },
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'Headlamp',
        price: 39.99,
        quantity: 1,
        total: 39.99,
        image: '/images/headlamp.jpg',
        sku: 'HL-007'
      },
      {
        productId: new mongoose.Types.ObjectId(),
        productName: 'First Aid Kit',
        price: 49.99,
        quantity: 1,
        total: 49.99,
        image: '/images/first-aid-kit.jpg',
        sku: 'FK-008'
      }
    ]
  }
];

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected for seeding orders...');
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('Existing orders cleared');
    
    // Insert seed data
    const orders = await Order.insertMany(orderSeedData);
    console.log(`${orders.length} orders seeded successfully`);
    
    console.log('Order seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
};

// Run the seed function
seedOrders();
