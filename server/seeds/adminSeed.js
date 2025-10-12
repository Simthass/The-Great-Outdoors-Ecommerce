// seeds/adminSeed.js (Advanced version)
import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Admin users to seed
const adminUsers = [
  {
    firstName: "Simthaass",
    lastName: "Admin",
    email: "Simthaass@outlook.com",
    password: "admin@#&%TGO123456",
    phoneNumber: "+94764078448",
    address: "123 Admin Street, Admin City, AC 12345",
    role: "Admin",
    isActive: true,
  },
  {
    firstName: "John",
    lastName: "Manager",
    email: "manager@ecommerce.com",
    password: "manager123456",
    phoneNumber: "+1234567891",
    address: "456 Manager Avenue, Manager City, MC 67890",
    role: "Employee",
    isActive: true,
  },
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected for seeding...");

    for (const adminData of adminUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: adminData.email });

      if (existingUser) {
        console.log(
          `User with email ${adminData.email} already exists, skipping...`
        );
        continue;
      }

      // Create the user
      const user = new User(adminData);
      await user.save();

      console.log(`${adminData.role} user created:`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Name: ${user.firstName} ${user.lastName}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- ID: ${user._id}\n`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedAdmins();
