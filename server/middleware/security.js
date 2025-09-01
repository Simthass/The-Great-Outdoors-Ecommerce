// middleware/security.js - Enhanced SQL injection prevention
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
    "EXEC",
    "EXECUTE",
    "TRUNCATE",
    "DECLARE",
    "MERGE",
    "CALL",
    "SHUTDOWN",
    "--",
    "/*",
    "*/",
    "XP_",
    "SP_",
    "WAITFOR",
    "DELAY",
    "BENCHMARK",
    "SQL",
  ];

  const checkObject = (obj, path = "") => {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof obj[key] === "string") {
        const value = obj[key].toUpperCase();

        // Check for SQL keywords
        if (
          sqlKeywords.some((keyword) => {
            // Match whole words to avoid false positives
            const regex = new RegExp(`\\b${keyword}\\b`, "i");
            return regex.test(value);
          })
        ) {
          console.warn(
            `Potential SQL injection detected in field: ${currentPath}`
          );
          return true;
        }

        // Check for suspicious patterns
        if (
          value.includes(";") ||
          value.includes("--") ||
          value.includes("/*") ||
          value.includes("*/") ||
          value.includes("XP_") ||
          value.includes("@@")
        ) {
          console.warn(`Suspicious pattern detected in field: ${currentPath}`);
          return true;
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (checkObject(obj[key], currentPath)) {
          return true;
        }
      }
    }
    return false;
  };

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid input detected. Please check your input and try again.",
    });
  }

  next();
};
