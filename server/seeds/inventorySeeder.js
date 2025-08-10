import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

dotenv.config();

// Sample product data
const sampleProducts = [
  {
    name: "ElkHorn Compound Bow Set",
    description: "Professional compound bow perfect for hunting and archery sports",
    price: 150,
    category: "Archery",
    imageUrl: "/products/product 1.jpg",
    sku: "BOW-001",
    weight: 3.5,
    dimensions: "30x12x3 inches",
    inStock: true,
    featured: true
  },
  {
    name: "Hawksbill Long Bow Set", 
    description: "Traditional longbow made from premium wood",
    price: 120,
    category: "Archery",
    imageUrl: "/products/product 2.jpg",
    sku: "BOW-002",
    weight: 2.8,
    dimensions: "72x2x1 inches",
    inStock: true,
    featured: false
  },
  {
    name: "Sentinel Recurve Bow Set",
    description: "High-performance recurve bow for precision shooting",
    price: 180,
    category: "Archery", 
    imageUrl: "/products/product 3.jpg",
    sku: "BOW-003",
    weight: 2.5,
    dimensions: "68x2x1 inches",
    inStock: true,
    featured: true
  },
  {
    name: "Upland Compound Bow Set",
    description: "Advanced compound bow with precision engineering",
    price: 220,
    category: "Archery",
    imageUrl: "/products/product 4.jpg", 
    sku: "BOW-004",
    weight: 4.2,
    dimensions: "32x14x4 inches",
    inStock: true,
    featured: false
  },
  {
    name: "Coleman Sundome Tents",
    description: "Durable 2-person camping tent with easy setup",
    price: 89,
    category: "Camping",
    imageUrl: "/products/product 5.jpg",
    sku: "TENT-001", 
    weight: 8.5,
    dimensions: "84x60x48 inches",
    inStock: true,
    featured: true
  },
  {
    name: "Decathlon Quechua 2 Seconds Easy 3-person Tent",
    description: "Pop-up tent that sets up in just 2 seconds",
    price: 129,
    category: "Camping",
    imageUrl: "/products/product 6.jpg",
    sku: "TENT-002",
    weight: 9.2,
    dimensions: "86x76x43 inches", 
    inStock: true,
    featured: true
  },
  {
    name: "30L Backpack",
    description: "Compact hiking backpack perfect for day trips",
    price: 45,
    category: "Hiking",
    imageUrl: "/products/product 7.jpg",
    sku: "BAG-001",
    weight: 1.8,
    dimensions: "20x12x8 inches",
    inStock: true,
    featured: false
  },
  {
    name: "40L Backpack", 
    description: "Mid-size backpack for multi-day adventures",
    price: 65,
    category: "Hiking",
    imageUrl: "/products/product 8.jpg",
    sku: "BAG-002",
    weight: 2.3,
    dimensions: "22x14x10 inches",
    inStock: false,
    featured: false
  },
  {
    name: "50L Backpack",
    description: "Large capacity backpack for extended outdoor trips",
    price: 85,
    category: "Hiking", 
    imageUrl: "/products/product 9.jpg",
    sku: "BAG-003",
    weight: 2.8,
    dimensions: "24x16x12 inches",
    inStock: true,
    featured: true
  }
];

// Sample inventory data matching the products
const sampleInventory = [
  { stockLevel: 3, lowStockThreshold: 5, reorderPoint: 10, maxStockLevel: 20 },
  { stockLevel: 1, lowStockThreshold: 3, reorderPoint: 5, maxStockLevel: 15 },
  { stockLevel: 4, lowStockThreshold: 5, reorderPoint: 8, maxStockLevel: 18 },
  { stockLevel: 2, lowStockThreshold: 4, reorderPoint: 7, maxStockLevel: 16 },
  { stockLevel: 10, lowStockThreshold: 5, reorderPoint: 12, maxStockLevel: 25 },
  { stockLevel: 9, lowStockThreshold: 8, reorderPoint: 15, maxStockLevel: 30 },
  { stockLevel: 10, lowStockThreshold: 5, reorderPoint: 12, maxStockLevel: 20 },
  { stockLevel: 0, lowStockThreshold: 3, reorderPoint: 5, maxStockLevel: 15 },
  { stockLevel: 4, lowStockThreshold: 6, reorderPoint: 10, maxStockLevel: 22 }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    
    // Create products
    console.log('🏭 Creating products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${createdProducts.length} products`);
    
    // Create inventory records for each product
    console.log('📦 Creating inventory records...');
    const inventoryPromises = createdProducts.map((product, index) => {
      return new Inventory({
        product: product._id,
        ...sampleInventory[index],
        lastRestocked: new Date()
      }).save();
    });
    
    const createdInventory = await Promise.all(inventoryPromises);
    console.log(`✅ Created ${createdInventory.length} inventory records`);
    
    // Create sample user if not exists
    console.log('👤 Creating sample user...');
    let sampleUser = await User.findOne({ email: 'john.doe@example.com' });
    if (!sampleUser) {
      sampleUser = new User({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashedpasswordhere', // In real app, this would be properly hashed
        phone: '+1234567890',
        role: 'customer',
        isActive: true,
        emailVerified: true
      });
      await sampleUser.save();
      console.log('✅ Created sample user');
    } else {
      console.log('👤 Sample user already exists');
    }
    
    // Create sample orders
    console.log('🛒 Creating sample orders...');
    const sampleOrders = [
      {
        user: sampleUser._id,
        items: [
          {
            productId: createdProducts[0]._id,
            productName: createdProducts[0].name,
            quantity: 1,
            price: createdProducts[0].price,
            total: createdProducts[0].price,
            sku: createdProducts[0].sku
          }
        ],
        totalAmount: createdProducts[0].price,
        tax: createdProducts[0].price * 0.08,
        shippingCost: 10,
        discount: 0,
        orderStatus: 'Shipped',
        paymentStatus: 'Paid',
        paymentMethod: 'Credit Card',
        shippingAddress: {
          addressLine1: '123 Main St',
          city: 'Toronto',
          province: 'Ontario',
          postalCode: 'M1A 1A1',
          country: 'Canada'
        }
      },
      {
        user: sampleUser._id,
        items: [
          {
            productId: createdProducts[4]._id,
            productName: createdProducts[4].name,
            quantity: 2,
            price: createdProducts[4].price,
            total: createdProducts[4].price * 2,
            sku: createdProducts[4].sku
          }
        ],
        totalAmount: createdProducts[4].price * 2,
        tax: createdProducts[4].price * 2 * 0.08,
        shippingCost: 15,
        discount: 0,
        orderStatus: 'Pending',
        paymentStatus: 'Paid',
        paymentMethod: 'Credit Card',
        shippingAddress: {
          addressLine1: '456 Oak Ave',
          city: 'Vancouver',
          province: 'British Columbia',
          postalCode: 'V1A 1A1',
          country: 'Canada'
        }
      },
      {
        user: sampleUser._id,
        items: [
          {
            productId: createdProducts[6]._id,
            productName: createdProducts[6].name,
            quantity: 4,
            price: createdProducts[6].price,
            total: createdProducts[6].price * 4,
            sku: createdProducts[6].sku
          }
        ],
        totalAmount: createdProducts[6].price * 4,
        tax: createdProducts[6].price * 4 * 0.08,
        shippingCost: 12,
        discount: 20,
        orderStatus: 'Delivered',
        paymentStatus: 'Paid',
        paymentMethod: 'Debit Card',
        actualDelivery: new Date(),
        shippingAddress: {
          addressLine1: '789 Pine Rd',
          city: 'Calgary',
          province: 'Alberta',
          postalCode: 'T1A 1A1',
          country: 'Canada'
        }
      },
      {
        user: sampleUser._id,
        items: [
          {
            productId: createdProducts[8]._id,
            productName: createdProducts[8].name,
            quantity: 3,
            price: createdProducts[8].price,
            total: createdProducts[8].price * 3,
            sku: createdProducts[8].sku
          }
        ],
        totalAmount: createdProducts[8].price * 3,
        tax: createdProducts[8].price * 3 * 0.08,
        shippingCost: 18,
        discount: 0,
        orderStatus: 'Cancelled',
        paymentStatus: 'Refunded',
        paymentMethod: 'Credit Card',
        shippingAddress: {
          addressLine1: '321 Elm St',
          city: 'Montreal',
          province: 'Quebec',
          postalCode: 'H1A 1A1',
          country: 'Canada'
        }
      }
    ];
    
    await Order.deleteMany({}); // Clear existing orders
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} sample orders`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Inventory records: ${createdInventory.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Users: 1`);
    
    // Display inventory stats
    const totalProducts = createdInventory.length;
    const lowStock = createdInventory.filter(item => 
      sampleInventory[createdInventory.indexOf(item)].stockLevel <= 
      sampleInventory[createdInventory.indexOf(item)].lowStockThreshold
    ).length;
    const outOfStock = createdInventory.filter(item => 
      sampleInventory[createdInventory.indexOf(item)].stockLevel === 0
    ).length;
    
    console.log('📈 Inventory Stats:');
    console.log(`   - Total Products: ${totalProducts}`);
    console.log(`   - Low Stock Items: ${lowStock}`);
    console.log(`   - Out of Stock Items: ${outOfStock}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the seeder
seedDatabase();
