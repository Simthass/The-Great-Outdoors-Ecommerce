import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

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

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Constants
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Brand colors using #8DC53E and its shades/tints
  const BRAND_COLORS = {
    primary: "#8DC53E",
    primaryDark: "#7AB535",
    primaryLight: "#A3D15E",
    primaryLighter: "#C4E394",
    primaryLightest: "#E6F2D8",
    text: "#1A2E05",
    textLight: "#4A5D34",
    background: "#F8FBEF",
    border: "#DAE8C3",
    error: "#DC2626",
  };

  // Validation rules
  const validationRules = {
    firstName: {
      required: true,
      minLength: 2,
      message: "First name must be at least 2 characters",
    },
    lastName: {
      required: true,
      minLength: 2,
      message: "Last name must be at least 2 characters",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    phoneNumber: {
      pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      message: "Please enter a valid phone number",
    },
    password: {
      required: true,
      minLength: 6,
      message: "Password must be at least 6 characters",
    },
  };

  // Validate field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && !value.trim()) {
      return "This field is required";
    }

    if (rules.minLength && value.length < rules.minLength) {
      return rules.message;
    }

    if (
      rules.pattern &&
      value &&
      !rules.pattern.test(value.replace(/\s/g, ""))
    ) {
      return rules.message;
    }

    return "";
  }, []);

  // Validate all fields
  const validateForm = useCallback(() => {
    const errors = {};
    Object.keys(validationRules).forEach((key) => {
      if (validationRules[key].required || formData[key]) {
        errors[key] = validateField(key, formData[key]);
      }
    });
    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  }, [formData, validateField]);

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleAuth();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => initializeGoogleAuth(), 100);
      };
      script.onerror = () => {
        console.error("Failed to load Google SDK");
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Initialize Google OAuth - FIXED VERSION
  const initializeGoogleAuth = useCallback(() => {
    if (!window.google?.accounts?.id) {
      setTimeout(() => initializeGoogleAuth(), 500);
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Google Client ID not configured");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      setGoogleReady(true);
      console.log("Google OAuth initialized successfully");
    } catch (error) {
      console.error("Google OAuth initialization error:", error);
    }
  }, []);

  // Handle Google OAuth response - FIXED VERSION
  const handleGoogleResponse = async (response) => {
    console.log("Google response received:", response);
    setGoogleLoading(true);
    setFormErrors({});

    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      const backendResponse = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

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
          replace: true,
          state: { message: "Registration successful! Welcome." },
        });
      } else {
        setFormErrors({
          general: data.message || "Google authentication failed",
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setFormErrors({
        general: error.message || "Google authentication failed",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google sign-in method - FIXED VERSION (using your working approach)
  const handleGoogleSignIn = () => {
    console.log("Google sign-in button clicked");
    console.log("Google ready state:", googleReady);
    console.log("Window.google available:", !!window.google);

    if (!window.google?.accounts?.id) {
      setFormErrors({ general: "Google SDK not loaded properly" });
      return;
    }

    if (!googleReady) {
      setFormErrors({ general: "Google OAuth not initialized" });
      return;
    }

    setGoogleLoading(true);
    setFormErrors({});

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
              setFormErrors({
                general: "Please allow popups for this site or try again",
              });
            } else if (notification.isSkipped()) {
              setFormErrors({ general: "Google sign-in was cancelled" });
            } else if (notification.isDismissedMoment()) {
              setFormErrors({ general: "Google sign-in was dismissed" });
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
      setFormErrors({
        general: "Failed to start Google authentication: " + error.message,
      });
      setGoogleLoading(false);
    }
  };

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Real-time validation after user has touched the field
    if (touched[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  // Handle blur events
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm() || !formData.agreeToTerms) {
      if (!formData.agreeToTerms) {
        setFormErrors((prev) => ({
          ...prev,
          agreeToTerms: "You must agree to the Terms and Conditions",
        }));
      }
      setIsSubmitting(false);
      return;
    }

    try {
      // Health check
      try {
        await fetch(`${API_URL}/health`);
      } catch (healthError) {
        throw new Error("Cannot reach server. Please check your connection.");
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
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
          replace: true,
          state: {
            message: "Registration successful! Please log in to continue.",
          },
        });
      } else {
        setFormErrors({
          general:
            responseData.message || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("Cannot reach")
      ) {
        setFormErrors({
          general:
            "Cannot connect to our servers. Please check your internet connection.",
        });
      } else if (error.message.includes("already exists")) {
        setFormErrors({
          general:
            "An account with this email already exists. Please try logging in.",
        });
      } else {
        setFormErrors({
          general:
            error.message || "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
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
    setFormErrors({});
    setTouched({});
    navigate(-1);
  };

  // Handle key events
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const isLoading = isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-4 lg:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden bg-white">
        {/* Left Side - Image */}
        <div className="w-full lg:w-1/2 relative overflow-hidden">
          <div className="relative h-64 lg:h-full min-h-[400px]">
            <img
              src="/Register.png"
              alt="Outdoor adventure - Join the community"
              className="w-full h-full object-cover"
              data-testid="register-image"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/40 lg:via-transparent lg:to-transparent" />

            {/* Mobile-only content overlay */}
            <div className="absolute bottom-6 left-6 right-6 lg:hidden">
              <h2 className="text-2xl font-bold text-white mb-2">
                Start Your Adventure
              </h2>
              <p className="text-white/90 text-sm">
                Join thousands of outdoor enthusiasts exploring nature
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 xl:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center lg:text-left mb-8 lg:mb-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
                Join the{" "}
                <span style={{ color: BRAND_COLORS.primary }}>Adventure</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-medium">
                Create your account and start exploring the great outdoors
              </p>
            </div>

            {/* Error Alert */}
            {formErrors.general && (
              <div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm"
                role="alert"
                data-testid="error-alert"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {formErrors.general}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg outline-none transition-all duration-200 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      formErrors.firstName
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-[#8DC53E] focus:shadow-lg"
                    }`}
                    data-testid="firstName-input"
                  />
                  {formErrors.firstName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{formErrors.firstName}</span>
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg outline-none transition-all duration-200 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      formErrors.lastName
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-[#8DC53E] focus:shadow-lg"
                    }`}
                    data-testid="lastName-input"
                  />
                  {formErrors.lastName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{formErrors.lastName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  autoComplete="email"
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg outline-none transition-all duration-200 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    formErrors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-[#8DC53E] focus:shadow-lg"
                  }`}
                  data-testid="email-input"
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{formErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone and Address Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg outline-none transition-all duration-200 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      formErrors.phoneNumber
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-[#8DC53E] focus:shadow-lg"
                    }`}
                    data-testid="phone-input"
                  />
                  {formErrors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{formErrors.phoneNumber}</span>
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    autoComplete="street-address"
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg outline-none transition-all duration-200 focus:bg-white focus:border-[#8DC53E] focus:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="address-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg outline-none transition-all duration-200 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    formErrors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-[#8DC53E] focus:shadow-lg"
                  }`}
                  data-testid="password-input"
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{formErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 text-[#8DC53E] bg-gray-100 border-gray-300 rounded focus:ring-[#8DC53E] focus:ring-2 disabled:opacity-50"
                  data-testid="terms-checkbox"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-[#8DC53E] hover:text-[#7AB535] font-medium underline focus:outline-none focus:ring-2 focus:ring-[#8DC53E] rounded"
                  >
                    Terms and Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-[#8DC53E] hover:text-[#7AB535] font-medium underline focus:outline-none focus:ring-2 focus:ring-[#8DC53E] rounded"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {formErrors.agreeToTerms && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{formErrors.agreeToTerms}</span>
                </p>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full py-3 px-6 border-2 border-[#8DC53E] text-[#8DC53E] hover:bg-[#F8FBEF] disabled:border-[#C4E394] disabled:text-[#C4E394] font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#E6F2D8]"
                  data-testid="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-[#8DC53E] hover:bg-[#7AB535] disabled:bg-[#C4E394] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#E6F2D8]"
                  data-testid="submit-btn"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                OR
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Google Sign In - FIXED VERSION */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || googleLoading || !googleReady}
              className="w-full py-3 px-6 border-2 border-gray-300 hover:border-gray-400 disabled:border-gray-200 bg-white text-gray-700 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-gray-100"
              data-testid="google-btn"
            >
              <div className="flex items-center justify-center space-x-3">
                <img
                  src="/Google.png"
                  alt="Google"
                  className="w-5 h-5"
                  data-testid="google-icon"
                />
                <span>
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </span>
              </div>
            </button>

            {/* Login Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#8DC53E] hover:text-[#7AB535] transition-colors duration-200 focus:outline-none focus:underline"
                  data-testid="login-link"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
