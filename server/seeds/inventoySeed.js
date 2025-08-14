import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/database.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

dotenv.config();

// Sample product data
const sampleProducts = [
  {
    name: "ElkHorn Compound Bow Set",
    description:
      "Professional compound bow perfect for hunting and archery sports",
    price: 150,
    category: "Archery",
    imageUrl: "/products/product 1.jpg",
    sku: "BOW-001",
    weight: 3.5,
    dimensions: "30x12x3 inches",
    inStock: true,
    featured: true,
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
    featured: false,
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
    featured: true,
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
    featured: false,
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
    featured: true,
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
    featured: true,
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
    featured: false,
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
    featured: false,
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
    featured: true,
  },
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
  { stockLevel: 4, lowStockThreshold: 6, reorderPoint: 10, maxStockLevel: 22 },
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    await Category.deleteMany({});

    // Create categories first
    console.log("📁 Creating categories...");
    const categories = [
      { categoryName: "Archery", description: "Bows, arrows, and archery accessories" },
      { categoryName: "Camping", description: "Tents, sleeping bags, and camping gear" },
      { categoryName: "Hiking", description: "Backpacks, hiking boots, and outdoor gear" }
    ];
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create category lookup map
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.categoryName] = cat._id;
    });

    // Transform sampleProducts to match the Product model
    console.log("🏭 Creating products...");
    const transformedProducts = sampleProducts.map(product => ({
      productName: product.name,
      description: product.description,
      price: product.price,
      category: categoryMap[product.category],
      imageUrl: product.imageUrl,
      weight: product.weight,
      dimensions: product.dimensions,
      brand: "The Great Outdoors", // Add default brand
      isActive: true
    }));

    const createdProducts = await Product.insertMany(transformedProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create inventory records for each product
    console.log("📦 Creating inventory records...");
    const inventoryPromises = createdProducts.map((product, index) => {
      return new Inventory({
        product: product._id,
        ...sampleInventory[index],
        lastRestocked: new Date(),
      }).save();
    });

    const createdInventory = await Promise.all(inventoryPromises);
    console.log(`✅ Created ${createdInventory.length} inventory records`);

    console.log("⚠️ Skipping order creation for now...");
    const createdOrders = [];

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Inventory records: ${createdInventory.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Users: 1`);

    // Display inventory stats
    const totalProducts = createdInventory.length;
    const lowStock = createdInventory.filter(
      (item) =>
        sampleInventory[createdInventory.indexOf(item)].stockLevel <=
        sampleInventory[createdInventory.indexOf(item)].lowStockThreshold
    ).length;
    const outOfStock = createdInventory.filter(
      (item) => sampleInventory[createdInventory.indexOf(item)].stockLevel === 0
    ).length;

    console.log("📈 Inventory Stats:");
    console.log(`   - Total Products: ${totalProducts}`);
    console.log(`   - Low Stock Items: ${lowStock}`);
    console.log(`   - Out of Stock Items: ${outOfStock}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Run the seeder
seedDatabase();
