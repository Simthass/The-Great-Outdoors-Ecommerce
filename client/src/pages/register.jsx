// src/pages/Register.jsx
import React, { useState } from "react";
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      // Optional health check before register
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        setError(
          "Cannot connect to server. Please make sure the backend server is running on port 5000."
        );
      } else if (error.message.includes("HTTP error")) {
        setError(
          `Server error: ${error.message}. Please check the server logs.`
        );
      } else if (error.message.includes("Cannot reach server")) {
        setError(
          "Cannot connect to server. Please make sure the backend server is running on port 5000."
        );
      } else {
        setError("Network error. Please try again.");
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
          <div className="absolute inset-0  z-10"></div>
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
                <div className="flex items-center">{error}</div>
              </div>
            )}

            <form
              className="w-full space-y-[25px]"
              onSubmit={handleSubmit}
              data-testid="register-form"
              noValidate
            >
              <div className="flex gap-[30px] w-full">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    data-testid="firstName-input"
                    className="w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    data-testid="lastName-input"
                    className="w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  />
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
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    data-testid="email-input"
                    className="w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    data-testid="phone-input"
                    className="w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div className="flex gap-[30px] w-full">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
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
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    required
                    minLength="6"
                    data-testid="password-input"
                    className="w-full h-[48px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
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
                  disabled={loading}
                  className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{ backgroundColor: "#79a730ff", color: "#ffffff" }}
                  data-testid="submit-btn"
                >
                  <span className="relative z-10">
                    {loading ? "Registering..." : "Submit"}
                  </span>
                </button>
              </div>

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
