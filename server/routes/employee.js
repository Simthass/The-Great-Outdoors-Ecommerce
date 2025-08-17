// routes/employeeRoutes.js
import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkDeleteEmployees,
  //getEmployeeReport,
  //getEmployeeStats,
} from "../controllers/employeeController.js";
import { authenticateUser, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get employee statistics (for dashboard)
//router.get("/stats", admin, getEmployeeStats);

// Get employee report
//router.get("/report", admin, getEmployeeReport);

// Get all employees with pagination and filtering
router.get("/", admin, getAllEmployees);

// Create new employee
router.post("/", admin, createEmployee);

// Get single employee by ID
router.get("/:id", admin, getEmployeeById);

// Update employee
router.put("/:id", admin, updateEmployee);

// Delete single employee

router.delete("/:id", admin, deleteEmployee);
// Bulk delete employees
router.post("/bulk-delete", admin, bulkDeleteEmployees);

export default router;
