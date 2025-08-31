import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkDeleteEmployees,
  getEmployeeReport,
  getEmployeeReportData,
  getEmployeeAnalysisReport,
} from "../controllers/employeeController.js";
import { authenticateUser, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get employee report data (JSON)
router.get("/report-data", admin, getEmployeeReportData);

// Get employee report (PDF - raw employee data)
router.get("/report", admin, getEmployeeReport);

// Get employee analysis report (PDF - analysis data)
router.get("/analysis-report", admin, getEmployeeAnalysisReport);

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
