import Employee from "../models/Employee.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const sampleEmployees = [
  {
    name: "John Smith",
    position: "Cashier",
    email: "john.smith@company.com",
    phoneNumber: "+1-555-0101",
    address: "123 Main Street, New York, NY 10001",
  },
  {
    name: "Sarah Johnson",
    position: "Inventory manager",
    email: "sarah.johnson@company.com",
    phoneNumber: "+1-555-0102",
    address: "456 Oak Avenue, Los Angeles, CA 90210",
  },
  {
    name: "Michael Brown",
    position: "Executive manager",
    email: "michael.brown@company.com",
    phoneNumber: "+1-555-0103",
    address: "789 Pine Road, Chicago, IL 60601",
  },
  {
    name: "Emily Davis",
    position: "Sales Associate",
    email: "emily.davis@company.com",
    phoneNumber: "+1-555-0104",
    address: "321 Cedar Lane, Houston, TX 77001",
  },
  {
    name: "David Wilson",
    position: "Cleaner",
    email: "david.wilson@company.com",
    phoneNumber: "+1-555-0105",
    address: "654 Elm Street, Phoenix, AZ 85001",
  },
  {
    name: "Jessica Garcia",
    position: "Cashier",
    email: "jessica.garcia@company.com",
    phoneNumber: "+1-555-0106",
    address: "987 Maple Drive, Philadelphia, PA 19101",
  },
  {
    name: "Robert Martinez",
    position: "Sales Associate",
    email: "robert.martinez@company.com",
    phoneNumber: "+1-555-0107",
    address: "147 Birch Way, San Antonio, TX 78201",
  },
  {
    name: "Amanda Taylor",
    position: "Inventory manager",
    email: "amanda.taylor@company.com",
    phoneNumber: "+1-555-0108",
    address: "258 Spruce Court, San Diego, CA 92101",
  },
];

const seedEmployees = async () => {
  let connection;
  try {
    // Connect to MongoDB
    connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing employees
    await Employee.deleteMany({});
    console.log("Cleared existing employees");

    // Create employees with sequential IDs
    let employeeCount = 1;
    for (const empData of sampleEmployees) {
      const employee = new Employee({
        ...empData,
        employeeId: `EMP${String(employeeCount).padStart(3, "0")}`,
        joinedDate: new Date(
          Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
        ),
      });

      await employee.save();
      console.log(
        `Created employee: ${employee.name} (${employee.employeeId})`
      );
      employeeCount++;
    }

    console.log("Successfully seeded employees");
  } catch (error) {
    console.error("Error seeding employees:", error);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log("Database connection closed");
    }
  }
};

// Execute seeder
seedEmployees();
