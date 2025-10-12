import { body, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";

// XSS Protection
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    });
  }
  next();
};

// SQL Injection Protection
export const sqlInjectionCheck = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/i,
    /('|"|;|--|\/\*|\*\/|@@|char|nchar|varchar|nvarchar)/i,
  ];

  const checkObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        for (let pattern of sqlInjectionPatterns) {
          if (pattern.test(obj[key])) {
            return res.status(400).json({
              success: false,
              message: "Invalid input detected.",
            });
          }
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (checkObject(obj[key])) return true;
      }
    }
    return false;
  };

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    return;
  }

  next();
};

// Validation chains
export const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
    ),
  body("firstName").isLength({ min: 2, max: 50 }).trim().escape(),
  body("lastName").isLength({ min: 2, max: 50 }).trim().escape(),
  body("phoneNumber").isMobilePhone().optional(),
];

export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 1 }),
];

export const validatePayment = [
  body("cardNumber").isCreditCard(),
  body("expiryMonth").isInt({ min: 1, max: 12 }),
  body("expiryYear").isInt({ min: new Date().getFullYear() }),
  body("cvv").isLength({ min: 3, max: 4 }),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};
