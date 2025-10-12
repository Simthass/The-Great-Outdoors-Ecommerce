// Updated Register.jsx - Fixed Google OAuth implementation

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("Environment check:");
    console.log(
      "VITE_GOOGLE_CLIENT_ID:",
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    );
  }, []);

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        console.log("Google SDK already loaded");
        initializeGoogleAuth();
        return;
      }

      console.log("Loading Google SDK...");
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google SDK script loaded successfully");
        // Add a small delay to ensure the SDK is fully initialized
        setTimeout(() => {
          initializeGoogleAuth();
        }, 100);
      };
      script.onerror = (error) => {
        console.error("Failed to load Google SDK script:", error);
        setError(
          "Failed to load Google authentication. Please check your internet connection."
        );
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Initialize Google OAuth
  const initializeGoogleAuth = () => {
    console.log("Initializing Google Auth...");

    if (!window.google?.accounts?.id) {
      console.error("Google SDK not fully available");
      setTimeout(() => initializeGoogleAuth(), 500); // Retry after 500ms
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log("Using Client ID:", clientId);

    if (!clientId) {
      console.error("Google Client ID not found in environment variables");
      setError(
        "Google Client ID not configured. Please check your environment variables."
      );
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Additional configuration for better popup behavior
        use_fedcm_for_prompt: false,
        itp_support: true,
      });

      console.log("Google OAuth initialized successfully");
      setGoogleReady(true);
    } catch (error) {
      console.error("Google OAuth initialization error:", error);
      setError("Failed to initialize Google authentication: " + error.message);
    }
  };

  // Handle Google OAuth response
  const handleGoogleResponse = async (response) => {
    console.log("Google response received:", response);
    setGoogleLoading(true);
    setError("");

    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      console.log("Sending credential to backend...");

      // Send credential token to backend
      const backendResponse = await fetch(
        "http://localhost:5000/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: response.credential }),
        }
      );

      const data = await backendResponse.json();
      console.log("Backend response:", data);

      if (!backendResponse.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${backendResponse.status}`
        );
      }

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        navigate("/", {
          state: { message: "Registration successful! Welcome." },
        });
        window.location.reload();
      } else {
        setError(data.message || "Google authentication failed");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message || "Google authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  // FIXED: Updated Google sign-in method using renderButton instead of prompt
  const handleGoogleSignIn = () => {
    console.log("Google sign-in button clicked");
    console.log("Google ready state:", googleReady);
    console.log("Window.google available:", !!window.google);

    if (!window.google?.accounts?.id) {
      setError("Google SDK not loaded properly");
      return;
    }

    if (!googleReady) {
      setError("Google OAuth not initialized");
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      // Create a temporary container for the Google button
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.top = "-9999px";
      tempContainer.style.left = "-9999px";
      document.body.appendChild(tempContainer);

      // Render Google button and trigger it programmatically
      window.google.accounts.id.renderButton(tempContainer, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        width: 250,
      });

      // Trigger the button click
      setTimeout(() => {
        const googleButton = tempContainer.querySelector('[role="button"]');
        if (googleButton) {
          googleButton.click();
        } else {
          console.log("Falling back to prompt method");
          // Fallback to prompt method
          window.google.accounts.id.prompt((notification) => {
            console.log("Google prompt notification:", notification);
            setGoogleLoading(false);

            if (notification.isNotDisplayed()) {
              setError("Please allow popups for this site or try again");
            } else if (notification.isSkipped()) {
              setError("Google sign-in was cancelled");
            } else if (notification.isDismissedMoment()) {
              setError("Google sign-in was dismissed");
            }
          });
        }

        // Clean up the temporary container
        setTimeout(() => {
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        }, 1000);
      }, 100);
    } catch (error) {
      console.error("Google sign-in trigger error:", error);
      setError("Failed to start Google authentication: " + error.message);
      setGoogleLoading(false);
    }
  };

  // Alternative method: Create a proper Google button
  const createGoogleButton = () => {
    if (!googleReady || !window.google?.accounts?.id) {
      return null;
    }

    const buttonRef = React.useRef(null);

    React.useEffect(() => {
      if (buttonRef.current && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "rectangular",
            text: "continue_with",
            logo_alignment: "left",
            width: buttonRef.current.offsetWidth || 250,
          });
        } catch (error) {
          console.error("Error rendering Google button:", error);
        }
      }
    }, [googleReady]);

    return <div ref={buttonRef} className="w-full"></div>;
  };

  // Validation functions (keeping existing ones)
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return re.test(phone.replace(/\s/g, ""));
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) {
          errors[name] = "This field is required";
        } else {
          delete errors[name];
        }
        break;
      case "email":
        if (!value) {
          errors[name] = "Email is required";
        } else if (!validateEmail(value)) {
          errors[name] = "Please enter a valid email address";
        } else {
          delete errors[name];
        }
        break;
      case "password":
        if (!value) {
          errors[name] = "Password is required";
        } else if (!validatePassword(value)) {
          errors[name] = "Password must be at least 6 characters";
        } else {
          delete errors[name];
        }
        break;
      case "phoneNumber":
        if (value && !validatePhone(value)) {
          errors[name] = "Please enter a valid phone number";
        } else {
          delete errors[name];
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (type !== "checkbox") {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation logic (keeping existing)
    let isValid = true;
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError(
        "Please provide all required fields: First name, Last name, Email, and Password."
      );
      return;
    }

    setLoading(true);

    try {
      // Health check
      try {
        await fetch("http://localhost:5000/api/health");
      } catch (healthError) {
        throw new Error("Cannot reach server - health check failed");
      }

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          password: formData.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || `HTTP error! status: ${response.status}`
        );
      }

      if (responseData.success) {
        navigate("/login", {
          state: {
            message: "Registration successful! Please log in to continue.",
          },
        });
      } else {
        setError(
          responseData.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("Cannot connect")
      ) {
        setError(
          "Cannot connect to our servers. Please check your internet connection and try again."
        );
      } else if (error.message.includes("User already exists")) {
        setError(
          "An account with this email already exists. Please try logging in or use a different email."
        );
      } else {
        setError(
          error.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      agreeToTerms: false,
    });
    setError("");
    setFieldErrors({});
    navigate(-1);
  };

  return (
    <div
      className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-xl"
      data-testid="register-page"
    >
      <div className="flex md:flex-row">
        {/* Left Side - Image */}
        <div className="md:w-1/2 w-full relative overflow-hidden">
          <div className="absolute inset-0 z-10"></div>
          <img
            src="/Register.png"
            alt="Adventure"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            style={{ minHeight: "600px", maxHeight: "1000px" }}
            data-testid="register-image"
          />
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-[50px] bg-gradient-to-br from-[#ECEAEA] to-[#F5F5F5]">
          <div className="w-full max-w-[550px]">
            <h2
              className="text-[48px] font-bold mb-[15px] text-center leading-tight"
              style={{ color: "#7d9d49ff" }}
              data-testid="register-title"
            >
              Join The <br />
              <span style={{ color: "#6B8E3D" }}>Adventure Challenge</span>
            </h2>
            <p
              className="text-[16px] mb-[40px] text-center font-medium"
              style={{ color: "#4f4f4f" }}
              data-testid="register-subtitle"
            >
              Sign Up To Embark On An Unforgettable Outdoor Experience
            </p>

            {error && (
              <div
                className="w-full mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
                data-testid="error-alert"
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <form
              className="w-full space-y-[25px]"
              onSubmit={handleSubmit}
              data-testid="register-form"
              noValidate
            >
              {/* Form fields (keeping existing structure) */}
              <div className="flex gap-[30px] w-full">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    data-testid="firstName-input"
                    className={`w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 placeholder:text-gray-500 outline-none rounded-[8px] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md ${
                      fieldErrors.firstName
                        ? "border-red-500"
                        : "border-gray-200 focus:border-[#7d9d49ff]"
                    }`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    data-testid="lastName-input"
                    className={`w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 placeholder:text-gray-500 outline-none rounded-[8px] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md ${
                      fieldErrors.lastName
                        ? "border-red-500"
                        : "border-gray-200 focus:border-[#7d9d49ff]"
                    }`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-[30px] w-full">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    data-testid="email-input"
                    className={`w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 placeholder:text-gray-500 outline-none rounded-[8px] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md ${
                      fieldErrors.email
                        ? "border-red-500"
                        : "border-gray-200 focus:border-[#7d9d49ff]"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number (Optional)"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    data-testid="phone-input"
                    className={`w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 placeholder:text-gray-500 outline-none rounded-[8px] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md ${
                      fieldErrors.phoneNumber
                        ? "border-red-500"
                        : "border-gray-200 focus:border-[#7d9d49ff]"
                    }`}
                  />
                  {fieldErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-[30px] w-full">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address (Optional)"
                    value={formData.address}
                    onChange={handleInputChange}
                    data-testid="address-input"
                    className="w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    minLength="6"
                    data-testid="password-input"
                    className={`w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 placeholder:text-gray-500 outline-none rounded-[8px] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md ${
                      fieldErrors.password
                        ? "border-red-500"
                        : "border-gray-200 focus:border-[#7d9d49ff]"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 accent-[#7d9d49ff] rounded focus:ring-2 focus:ring-[#7d9d49ff]/50"
                  required
                  data-testid="terms-checkbox"
                />
                <label
                  className="text-[15px] leading-relaxed"
                  style={{ color: "#4f4f4f" }}
                >
                  By signing up, you agree to our{" "}
                  <span
                    className="font-semibold cursor-pointer hover:underline transition-all duration-200"
                    style={{ color: "#7d9d49ff" }}
                  >
                    Terms and Conditions
                  </span>
                </label>
              </div>

              <div className="flex justify-between mt-[40px] gap-[30px]">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "transparent", color: "#79a730ff" }}
                  data-testid="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || Object.keys(fieldErrors).length > 0}
                  className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{ backgroundColor: "#79a730ff", color: "#ffffff" }}
                  data-testid="submit-btn"
                >
                  <span className="relative z-10">
                    {loading ? "Registering..." : "Submit"}
                  </span>
                </button>
              </div>

              {/* OPTION 1: Use the custom button approach */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading || !googleReady}
                data-testid="google-btn"
                className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] flex items-center justify-center gap-[12px] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                style={{
                  backgroundColor: "transparent",
                  color: "#79a730ff",
                }}
              >
                <img
                  src="/Google.png"
                  alt="Google"
                  className="w-[25px] h-[25px] object-contain"
                  data-testid="google-icon"
                />
                <span>
                  {googleLoading
                    ? "Connecting..."
                    : googleReady
                    ? "Continue with Google"
                    : "Loading Google..."}
                </span>
              </button>
              <div className="text-center pt-[25px]" data-testid="login-link">
                <p className="text-[15px]" style={{ color: "#4f4f4f" }}>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold cursor-pointer no-underline hover:underline transition-all duration-200"
                    style={{ color: "#7d9d49ff" }}
                  >
                    Login Here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
