// controllers/employeeController.js
import Employee from "../models/Employee.js";
import mongoose from "mongoose";

// Create new employee
export const createEmployee = async (req, res) => {
  try {
    const { name, position, email, phoneNumber, address, salary } = req.body;

    // Validation - Make sure ALL fields are properly checked
    if (!name || !position || !email || !phoneNumber || !address || !salary) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errors: {
          ...(!name && { name: "Name is required" }),
          ...(!position && { position: "Position is required" }),
          ...(!email && { email: "Email is required" }),
          ...(!phoneNumber && { phoneNumber: "Phone number is required" }),
          ...(!address && { address: "Address is required" }),
          ...(!salary && { salary: "Salary is required" }),
        },
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase(),
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
        errors: { email: "Email already exists" },
      });
    }

    const employee = new Employee({
      name: name.trim(),
      position,
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      salary: parseFloat(salary), // Convert string to number
      createdBy: req.user._id,
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Employee with this ${field} already exists`,
        errors: { [field]: `${field} already exists` },
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating employee",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Get all employees with pagination, search and filtering
export const getAllEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      search,
      position,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    let filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { employeeId: { $regex: search.trim(), $options: "i" } },
        { phoneNumber: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (position && position !== "All Positions") {
      filter.position = position;
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    const totalEmployees = await Employee.countDocuments(filter);
    const totalPages = Math.ceil(totalEmployees / limit);

    const employees = await Employee.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          currentPage: page,
          totalPages,
          totalEmployees,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employees",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format",
      });
    }

    const employee = await Employee.findById(id)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employee",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, email, phoneNumber, address, salary } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format",
      });
    }

    // Make sure ALL fields are properly checked
    if (!name || !position || !email || !phoneNumber || !address || !salary) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if email already exists for another employee
    const existingEmployee = await Employee.findOne({
      email: email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // Update fields
    employee.name = name.trim();
    employee.position = position;
    employee.email = email.toLowerCase().trim();
    employee.phoneNumber = phoneNumber.trim();
    employee.address = address.trim();
    employee.salary = parseFloat(salary); // Convert string to number
    employee.updatedBy = req.user._id;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating employee",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete single employee (HARD DELETE)
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format",
      });
    }

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting employee",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Bulk delete employees (HARD DELETE)
export const bulkDeleteEmployees = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employee IDs are required",
      });
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format",
        invalidIds,
      });
    }

    const result = await Employee.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found to delete",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} employee(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete employees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting employees",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};