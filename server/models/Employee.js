// models/Employee.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    employeeId: {
      type: String,
      unique: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      enum: {
        values: [
          "Cashier",
          "Inventory manager",
          "Executive manager",
          "Cleaner",
          "Sales Associate",
        ],
        message: "Please select a valid position",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[\d\s\-\+\(\)]+$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxLength: [200, "Address cannot exceed 200 characters"],
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
      salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
      max: [1000000, "Salary cannot exceed 1,000,000"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate employee ID
employeeSchema.pre("save", async function (next) {
  if (!this.employeeId) {
    const lastEmployee = await this.constructor
      .findOne()
      .sort({ createdAt: -1 });
    let nextId = "EMP001";
    if (lastEmployee && lastEmployee.employeeId) {
      const lastNum = parseInt(lastEmployee.employeeId.replace("EMP", ""), 10);
      nextId = `EMP${String(lastNum + 1).padStart(3, "0")}`;
    }
    this.employeeId = nextId;
  }
  next();
});

// Index for better search performance
employeeSchema.index({ name: "text", email: "text", employeeId: "text" });
employeeSchema.index({ position: 1 });
employeeSchema.index({ createdAt: -1 });
employeeSchema.index({ isActive: 1 });

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;