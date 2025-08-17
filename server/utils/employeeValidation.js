// utils/employeeValidation.js

export const validateEmployeeData = (data) => {
  const errors = {};
  const { name, position, email, phoneNumber, address } = data;

  // Name validation
  if (!name || !name.trim()) {
    errors.name = "Name is required";
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (name.trim().length > 100) {
    errors.name = "Name cannot exceed 100 characters";
  }

  // Position validation
  const validPositions = [
    "Cashier",
    "Inventory manager",
    "Executive manager",
    "Cleaner",
    "Sales Associate",
  ];
  if (!position) {
    errors.position = "Position is required";
  } else if (!validPositions.includes(position)) {
    errors.position = "Please select a valid position";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(email.trim())) {
    errors.email = "Please provide a valid email address";
  }

  // Phone number validation
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneNumber || !phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!phoneRegex.test(phoneNumber.trim())) {
    errors.phoneNumber = "Please provide a valid phone number";
  }

  // Address validation
  if (!address || !address.trim()) {
    errors.address = "Address is required";
  } else if (address.trim().length > 200) {
    errors.address = "Address cannot exceed 200 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const sanitizeEmployeeData = (data) => {
  return {
    name: data.name?.trim(),
    position: data.position,
    email: data.email?.toLowerCase().trim(),
    phoneNumber: data.phoneNumber?.trim(),
    address: data.address?.trim(),
  };
};

export const generateEmployeeId = async (Employee) => {
  try {
    const count = await Employee.countDocuments();
    return `EMP${String(count + 1).padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating employee ID:", error);
    return `EMP${String(Date.now()).slice(-3)}`;
  }
};
