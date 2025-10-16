import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ message: "", error: false });
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Brand colors using #8DC53E and its shades
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
    name: {
      required: true,
      minLength: 2,
      message: "Name must be at least 2 characters",
    },
    phone: {
      required: true,
      pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
      message: "Please enter a valid phone number",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    subject: {
      required: true,
      minLength: 3,
      message: "Subject must be at least 3 characters",
    },
    message: {
      required: true,
      minLength: 10,
      message: "Message must be at least 10 characters",
    },
  };

  // Validate field
  const validateField = (name, value) => {
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
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation after user has touched the field
    if (touched[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }

    // Clear status when user starts typing
    if (status.message) {
      setStatus({ message: "", error: false });
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
    setSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach((key) => {
      errors[key] = validateField(key, formData[key]);
    });
    setFormErrors(errors);

    // Check if form is valid
    const isValid = !Object.values(errors).some((error) => error);
    if (!isValid) {
      setStatus({ message: "Please fix the errors above", error: true });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Reset form on success
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
      setTouched({});
      setFormErrors({});
      setStatus({
        message:
          data.message ||
          "Message sent successfully! We'll get back to you soon.",
        error: false,
      });
    } catch (err) {
      setStatus({
        message: err.message || "Failed to send message. Please try again.",
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Contact Info Component
  const ContactInfo = ({ icon, title, children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white/50 transition-all duration-300 group cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-[#8DC53E] to-[#7AB535] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#1A2E05] transition-colors">
          {title}
        </h3>
        <div className="text-gray-600 leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );

  // Input Field Component
  const InputField = ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    multiline = false,
  }) => (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={5}
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl outline-none transition-all duration-200 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed resize-vertical min-h-[120px] ${
            formErrors[name]
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-[#8DC53E] focus:shadow-lg"
          }`}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl outline-none transition-all duration-200 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
            formErrors[name]
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-[#8DC53E] focus:shadow-lg"
          }`}
          required={required}
        />
      )}
      {formErrors[name] && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-red-600 flex items-center space-x-1"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>{formErrors[name]}</span>
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F8FBEF]">
      {/* Hero Section */}
      <div
        className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden"
        data-testid="about-hero"
      >
        <div className="absolute inset-0 bg-[url(/page-name.png)] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-2"
            data-testid="about-hero-title"
          >
            Contact Us
          </h1>
          <p className="text-gray-200 text-sm md:text-base">
            {" "}
            Get in touch with our team of outdoor enthusiasts
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Let's Start a <span className="text-[#8DC53E]">Conversation</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our products, your order, or planning your
              next adventure? Our team is here to help you gear up for your
              journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Your Name"
                    name="name"
                    placeholder="Enter your full name"
                    required
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                  />
                  <InputField
                    label="Subject"
                    name="subject"
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <InputField
                  label="Your Message"
                  name="message"
                  placeholder="Tell us how we can help you..."
                  required
                  multiline
                />

                {/* Status Message */}
                <AnimatePresence>
                  {status.message && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-xl border ${
                        status.error
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-green-50 border-green-200 text-green-800"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className={`w-5 h-5 ${
                            status.error ? "text-red-500" : "text-green-500"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {status.error ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        <span className="font-medium">{status.message}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#8DC53E] to-[#7AB535] hover:from-[#7AB535] hover:to-[#6BA83A] disabled:from-[#C4E394] disabled:to-[#A3D15E] text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:shadow-md"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-3">
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
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                  Get in Touch
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Come visit or connect with us! We're always excited to meet
                  fellow adventurers — whether you're stopping by in person or
                  reaching out from the wild.
                </p>

                <div className="space-y-6">
                  <ContactInfo
                    icon={
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    }
                    title="Visit Our Store"
                    delay={0.1}
                  >
                    <p className="font-semibold text-gray-900">
                      35T, First Floor, Liberty Plaza, Colombo - 03
                    </p>
                  </ContactInfo>

                  <ContactInfo
                    icon={
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h1l2 5-2 1a11 11 0 006 6l1-2 5 2v1a2 2 0 01-2 2h-1c-7.732 0-14-6.268-14-14z"
                        />
                      </svg>
                    }
                    title="Call Us"
                    delay={0.2}
                  >
                    <p className="font-semibold text-gray-900">
                      +94 764078448 / +94 705702579
                    </p>
                  </ContactInfo>

                  <ContactInfo
                    icon={
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    }
                    title="Email Us"
                    delay={0.3}
                  >
                    <p className="font-semibold text-gray-900">
                      Simthass@outlook.com
                    </p>
                  </ContactInfo>

                  <ContactInfo
                    icon={
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                    title="Opening Hours"
                    delay={0.4}
                  >
                    <p className="font-semibold text-gray-900">
                      Monday - Saturday: 10:00 AM – 07:00 PM
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Closed on Sundays and public holidays
                    </p>
                  </ContactInfo>
                </div>
              </div>

              {/* Additional Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-gradient-to-br from-[#8DC53E] to-[#7AB535] rounded-2xl p-6 text-white shadow-2xl"
              >
                <h4 className="text-xl font-black mb-3">Quick Response</h4>
                <p className="opacity-90 leading-relaxed">
                  We typically respond to all inquiries within 2-4 hours during
                  business days. Your adventure questions are our top priority!
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
