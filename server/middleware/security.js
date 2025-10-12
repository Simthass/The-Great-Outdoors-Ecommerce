import sanitizeHtml from "sanitize-html";

// Enhanced SQL injection prevention with better email handling
export const sqlInjectionPrevention = (req, res, next) => {
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "UNION",
    "EXEC",
    "EXECUTE",
    "TRUNCATE",
    "DECLARE",
    "MERGE",
    "CALL",
    "SHUTDOWN",
    "XP_",
    "SP_",
    "WAITFOR",
    "DELAY",
    "BENCHMARK",
  ];

  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/i,
    /('|"|;|--|\/\*|\*\/|@@|char\(|nchar\(|varchar\(|nvarchar\()/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i, // OR 1=1 pattern
    /(\b(OR|AND)\b\s+'\w+'\s*=\s*'\w+')/i, // OR 'a'='a' pattern
    /(UNION\s+SELECT)/i,
    /(INSERT\s+INTO)/i,
    /(DROP\s+TABLE)/i,
    /(UPDATE\s+\w+\s+SET)/i,
    /(DELETE\s+FROM)/i,
  ];

  const checkObject = (obj, path = "") => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof obj[key] === "string") {
          const value = obj[key];

          // Skip validation for email fields with common patterns
          if (key.toLowerCase().includes("email")) {
            // For email fields, only check for the most dangerous patterns
            const dangerousPatterns = [
              /;/,
              /--/,
              /\/\*/,
              /@@/,
              /char\(/,
              /nchar\(/,
              /varchar\(/,
              /nvarchar\(/,
              /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i, // OR 1=1
              /(UNION\s+SELECT)/i,
              /(INSERT\s+INTO)/i,
              /(DROP\s+TABLE)/i,
            ];

            const hasDangerousPattern = dangerousPatterns.some((pattern) =>
              pattern.test(value)
            );

            if (hasDangerousPattern) {
              console.warn(
                `SQL_INJECTION_ATTEMPT: Dangerous pattern in email field ${currentPath}`
              );
              return true;
            }
            continue; // Skip further checks for email fields
          }

          // For non-email fields, do comprehensive checks
          const hasSqlKeyword = sqlKeywords.some((keyword) => {
            // Only match as whole words and in suspicious contexts
            const regex = new RegExp(`\\b${keyword}\\b`, "i");
            return regex.test(value);
          });

          // Check for suspicious command patterns
          const hasSuspiciousPattern = suspiciousPatterns.some((pattern) =>
            pattern.test(value)
          );

          // Check for basic injection patterns
          const hasBasicInjection =
            value.includes(";") ||
            value.includes("--") ||
            value.includes("/*") ||
            value.includes("*/") ||
            value.includes("@@") ||
            value.includes("char(") ||
            value.includes("nchar(") ||
            value.includes("varchar(") ||
            value.includes("nvarchar(");

          if (hasSuspiciousPattern || hasBasicInjection) {
            console.warn(
              `SQL_INJECTION_ATTEMPT: Detected in field ${currentPath}`
            );
            return true;
          }

          // For SQL keywords, only flag if they appear in suspicious contexts
          if (hasSqlKeyword) {
            // Allow common words that might be SQL keywords but are also legitimate
            const commonWords = [
              "select",
              "insert",
              "update",
              "delete",
              "drop",
              "union",
              "or",
              "and",
              "where",
              "from",
            ];
            const isCommonWord = commonWords.some(
              (word) =>
                value.toLowerCase().includes(word) &&
                !suspiciousPatterns.some((pattern) => pattern.test(value))
            );

            if (!isCommonWord) {
              console.warn(
                `SQL_INJECTION_ATTEMPT: SQL keyword in suspicious context in field ${currentPath}`
              );
              return true;
            }
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          if (checkObject(obj[key], currentPath)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Skip SQL injection check for certain safe endpoints
  const safeEndpoints = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
  ];
  if (safeEndpoints.includes(req.originalUrl)) {
    // For auth endpoints, use a more permissive check
    const hasCriticalInjection =
      checkObjectForCriticalOnly(req.body) ||
      checkObjectForCriticalOnly(req.query) ||
      checkObjectForCriticalOnly(req.params);

    if (hasCriticalInjection) {
      console.warn(
        `CRITICAL_SQL_INJECTION: IP ${req.ip} for ${req.originalUrl}`
      );
      return res.status(400).json({
        success: false,
        message: "Invalid input detected.",
      });
    }
    return next();
  }

  // For other endpoints, use full check
  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    console.warn(
      `POTENTIAL_SQL_INJECTION: IP ${req.ip} for ${req.originalUrl}`
    );
    return res.status(400).json({
      success: false,
      message: "Invalid input detected. Please check your input and try again.",
    });
  }

  next();
};

// Less restrictive check for auth endpoints
const checkObjectForCriticalOnly = (obj) => {
  const criticalPatterns = [
    /;/,
    /--/,
    /\/\*/,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(UNION\s+SELECT)/i,
    /(INSERT\s+INTO)/i,
    /(DROP\s+TABLE)/i,
    /(DELETE\s+FROM)/i,
  ];

  const check = (obj) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === "string") {
          const hasCritical = criticalPatterns.some((pattern) =>
            pattern.test(obj[key])
          );
          if (hasCritical) return true;
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          if (check(obj[key])) return true;
        }
      }
    }
    return false;
  };

  return check(obj);
};

// XSS Protection middleware
export const xssProtection = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === "string") {
          // Use sanitize-html for better XSS protection
          obj[key] = sanitizeHtml(obj[key], {
            allowedTags: [], // No HTML tags allowed
            allowedAttributes: {},
            disallowedTagsMode: "escape",
          });
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);

  next();
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Remove server identification
  res.removeHeader("X-Powered-By");

  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  next();
};
