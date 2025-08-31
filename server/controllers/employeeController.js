import Employee from "../models/Employee.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { createCanvas } from "canvas";

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

// Get employee report data as JSON
export const getEmployeeReportData = async (req, res) => {
  try {
    // Fetch all active employees
    const employees = await Employee.find({ isActive: true })
      .select(
        "name employeeId position email phoneNumber address salary joinedDate"
      )
      .lean();

    // Calculate summary statistics
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce(
      (sum, emp) => sum + (emp.salary || 0),
      0
    );
    const averageSalary = totalEmployees
      ? (totalSalary / totalEmployees).toFixed(2)
      : "0.00";

    // Salary distribution (buckets: <30k, 30k-50k, 50k-70k, >70k)
    const salaryRanges = {
      "<30k": 0,
      "30k-50k": 0,
      "50k-70k": 0,
      ">70k": 0,
    };
    employees.forEach((emp) => {
      const salary = emp.salary || 0;
      if (salary < 30000) salaryRanges["<30k"]++;
      else if (salary >= 30000 && salary <= 50000) salaryRanges["30k-50k"]++;
      else if (salary > 50000 && salary <= 70000) salaryRanges["50k-70k"]++;
      else salaryRanges[">70k"]++;
    });

    // Position distribution
    const positionCounts = {};
    employees.forEach((emp) => {
      positionCounts[emp.position] = (positionCounts[emp.position] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          totalSalary: totalSalary.toFixed(2),
          averageSalary,
        },
        salaryDistribution: salaryRanges,
        positionDistribution: positionCounts,
        generatedOn: new Date().toLocaleDateString("en-GB"),
      },
    });
  } catch (error) {
    console.error("Error fetching employee report data:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employee report data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Generate employee report as PDF (raw employee data)
export const getEmployeeReport = async (req, res) => {
  try {
    // Fetch all active employees
    const employees = await Employee.find({ isActive: true })
      .select(
        "name employeeId position email phoneNumber address salary joinedDate"
      )
      .lean();

    // Create a new PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Create a readable stream for the PDF
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="employee_report.pdf"',
          "Content-Length": pdfData.length,
        })
        .end(pdfData);
    });

    // Add content to the PDF
    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Employee Report", { align: "center" });
    doc.moveDown();

    // Company Info
    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Your Company Name", { align: "left" });
    doc.text("123 Business Street, City, Country", { align: "left" });
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB")}`, {
      align: "left",
    });
    doc.moveDown(2);

    // Summary Statistics
    doc.fontSize(14).font("Helvetica-Bold").text("Summary", { align: "left" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Total Employees: ${employees.length}`);
    doc.text(
      `Total Salary Expense: $${employees
        .reduce((sum, emp) => sum + (emp.salary || 0), 0)
        .toFixed(2)}`
    );
    doc.text(
      `Average Salary: $${
        employees.length
          ? (
              employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) /
              employees.length
            ).toFixed(2)
          : "0.00"
      }`
    );
    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    const colWidths = [50, 100, 80, 100, 80, 80, 50];
    const headers = [
      "ID",
      "Name",
      "Position",
      "Email",
      "Phone",
      "Address",
      "Salary",
    ];

    headers.forEach((header, i) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(
          header,
          50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          tableTop,
          {
            width: colWidths[i],
            align: "left",
          }
        );
    });

    doc.moveDown();
    const tableRowTop = doc.y;
    doc
      .lineWidth(1)
      .rect(
        50,
        tableTop,
        colWidths.reduce((a, b) => a + b, 0),
        tableRowTop - tableTop
      )
      .stroke();

    // Table Content
    employees.forEach((emp, index) => {
      const y = tableRowTop + index * 20;
      const rowData = [
        emp.employeeId,
        emp.name,
        emp.position,
        emp.email,
        emp.phoneNumber,
        emp.address,
        `$${emp.salary.toFixed(2)}`,
      ];

      rowData.forEach((data, i) => {
        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            data,
            50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            {
              width: colWidths[i],
              align: "left",
            }
          );
      });
    });

    // Add page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Page ${i - range.start + 1} of ${range.count}`,
          50,
          doc.page.height - 50,
          {
            align: "center",
          }
        );
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating employee report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate employee report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Generate employee analysis report as PDF
export const getEmployeeAnalysisReport = async (req, res) => {
  try {
    // Fetch all active employees
    const employees = await Employee.find({ isActive: true })
      .select(
        "name employeeId position email phoneNumber address salary joinedDate"
      )
      .lean();

    // Calculate summary statistics
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce(
      (sum, emp) => sum + (emp.salary || 0),
      0
    );
    const averageSalary = totalEmployees
      ? (totalSalary / totalEmployees).toFixed(2)
      : "0.00";

    // Salary distribution
    const salaryRanges = {
      "<30k": 0,
      "30k-50k": 0,
      "50k-70k": 0,
      ">70k": 0,
    };
    employees.forEach((emp) => {
      const salary = emp.salary || 0;
      if (salary < 30000) salaryRanges["<30k"]++;
      else if (salary >= 30000 && salary <= 50000) salaryRanges["30k-50k"]++;
      else if (salary > 50000 && salary <= 70000) salaryRanges["50k-70k"]++;
      else salaryRanges[">70k"]++;
    });

    // Position distribution
    const positionCounts = {};
    employees.forEach((emp) => {
      positionCounts[emp.position] = (positionCounts[emp.position] || 0) + 1;
    });

    // Create a new PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Create a readable stream for the PDF
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="employee_analysis_report_${new Date().toISOString()}.pdf"`,
          "Content-Length": pdfData.length,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        })
        .end(pdfData);
    });

    // Add content to the PDF with precise alignment
    const startY = 50; // Starting Y position
    let currentY = startY;

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#15803d") // green-700
      .text("Employee Analysis Report", 50, currentY, {
        align: "center",
        width: 500,
      });
    currentY += 40;

    // Company Info
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1f2937") // gray-800
      .text("Your Company Name", 50, currentY);
    currentY += 20;
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#4b5563") // gray-600
      .text("123 Business Street, City, Country", 50, currentY);
    currentY += 15;
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      })}`,
      50,
      currentY
    );
    currentY += 30;

    // Summary
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Summary", 50, currentY);
    currentY += 20;
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#4b5563")
      .text(`Total Employees: ${totalEmployees}`, 50, currentY);
    currentY += 15;
    doc.text(`Total Salary Expense: $${totalSalary.toFixed(2)}`, 50, currentY);
    currentY += 15;
    doc.text(`Average Salary: $${averageSalary}`, 50, currentY);
    currentY += 30;

    // Salary Distribution Chart
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Salary Distribution", 50, currentY);
    currentY += 20;

    // Create canvas for bar chart
    const barCanvas = createCanvas(400, 200);
    const ctx = barCanvas.getContext("2d");

    // Draw bar chart
    const barData = [
      salaryRanges["<30k"],
      salaryRanges["30k-50k"],
      salaryRanges["50k-70k"],
      salaryRanges[">70k"],
    ];
    const barLabels = ["<30k", "30k-50k", "50k-70k", ">70k"];
    const barColors = [
      "rgba(75, 192, 192, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(255, 99, 132, 0.6)",
    ];
    const barWidth = 80;
    const maxBarHeight = 150;
    const barSpacing = 20;
    const maxValue = Math.max(...barData, 1);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, barCanvas.width, barCanvas.height);

    // Draw bars
    barData.forEach((value, i) => {
      const height = (value / maxValue) * maxBarHeight || 1; // Avoid zero height
      ctx.fillStyle = barColors[i];
      ctx.fillRect(
        50 + i * (barWidth + barSpacing),
        200 - height - 20,
        barWidth,
        height
      );
      ctx.fillStyle = "#4b5563";
      ctx.font = "12px Helvetica";
      ctx.textAlign = "center";
      ctx.fillText(
        barLabels[i],
        50 + i * (barWidth + barSpacing) + barWidth / 2,
        190
      );
      ctx.fillText(
        value,
        50 + i * (barWidth + barSpacing) + barWidth / 2,
        200 - height - 25
      );
    });

    // Draw axes
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 180);
    ctx.lineTo(380, 180);
    ctx.stroke();

    // Add bar chart to PDF
    doc.image(barCanvas.toBuffer(), 50, currentY, { width: 400 });
    currentY += 220; // Adjusted height to accommodate chart

    // Position Distribution Chart
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Position Distribution", 50, currentY);
    currentY += 20;

    // Create canvas for pie chart
    const pieCanvas = createCanvas(200, 200);
    const pieCtx = pieCanvas.getContext("2d");
    const pieData = Object.values(positionCounts);
    const pieLabels = Object.keys(positionCounts);
    const pieColors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(153, 102, 255, 0.6)",
    ];
    const total = pieData.reduce((sum, val) => sum + val, 0);

    let startAngle = 0;
    pieCtx.fillStyle = "#ffffff";
    pieCtx.fillRect(0, 0, pieCanvas.width, pieCanvas.height);

    // Draw pie slices
    pieData.forEach((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI || 0.01; // Avoid zero angle
      pieCtx.beginPath();
      pieCtx.moveTo(100, 100);
      pieCtx.arc(100, 100, 80, startAngle, startAngle + sliceAngle);
      pieCtx.fillStyle = pieColors[i % pieColors.length];
      pieCtx.fill();
      startAngle += sliceAngle;

      // Add label
      const midAngle = startAngle - sliceAngle / 2;
      const labelX = 100 + Math.cos(midAngle) * 100;
      const labelY = 100 + Math.sin(midAngle) * 100;
      pieCtx.fillStyle = "#4b5563";
      pieCtx.font = "12px Helvetica";
      pieCtx.textAlign = "center";
      pieCtx.fillText(pieLabels[i], labelX, labelY);
    });

    // Add pie chart to PDF
    doc.image(pieCanvas.toBuffer(), 50, currentY, { width: 200 });
    currentY += 220; // Adjusted height to accommodate chart

    // Add legend for pie chart
    currentY += 10;
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1f2937")
      .text("Legend", 50, currentY);
    currentY += 20;
    pieLabels.forEach((label, i) => {
      doc
        .fillColor(pieColors[i % pieColors.length])
        .rect(50, currentY, 10, 10)
        .fill();
      doc.fillColor("#4b5563").font("Helvetica").text(label, 70, currentY);
      currentY += 15;
    });

    // Add page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(
          `Page ${i - range.start + 1} of ${range.count}`,
          50,
          doc.page.height - 50,
          {
            align: "center",
          }
        );
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating employee analysis report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate employee analysis report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
