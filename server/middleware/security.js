// middleware/security.js
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

// SQL injection prevention middleware
export const sqlInjectionPrevention = (req, res, next) => {
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "UNION",
    "OR",
    "AND",
    "WHERE",
    "FROM",
    "TABLE",
    "DATABASE",
    "SCRIPT",
    "ALTER",
    "CREATE",
  ];

  const checkObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        const value = obj[key].toUpperCase();
        if (sqlKeywords.some((keyword) => value.includes(keyword))) {
          return true;
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input detected",
    });
  }

  next();
};

// XSS prevention middleware
export const xssPrevention = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key]
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);

  next();
};
