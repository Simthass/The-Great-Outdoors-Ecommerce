import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate(); // Add this hook

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

    // Check if terms are agreed
    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to register with data:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      // Test if server is reachable first
      console.log("Testing server connection...");

      try {
        const healthCheck = await fetch("http://localhost:5000/api/health");
        console.log(
          "Health check response:",
          healthCheck.status,
          healthCheck.ok
        );
        const healthData = await healthCheck.json();
        console.log("Health data:", healthData);
      } catch (healthError) {
        console.error("Health check failed:", healthError);
        throw new Error("Cannot reach server - health check failed");
      }

      console.log("Server is reachable, attempting registration...");

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          password: formData.password,
        }),
      });

      console.log("Registration response status:", response.status);
      console.log("Registration response ok:", response.ok);
      console.log("Registration response headers:", [
        ...response.headers.entries(),
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Registration response data:", data);

      if (data.success) {
        // Store user data and token (Note: localStorage not available in artifacts)
        console.log("Registration successful!", data.data);

        // In a real app with localStorage:
        // localStorage.setItem('userInfo', JSON.stringify(data.data));
        // localStorage.setItem('token', data.data.token);

        // Redirect to home page after successful registration
        navigate("/login"); // This will redirect to home page
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Full error object:", error);

      if (error.message.includes("Failed to fetch")) {
        setError(
          "Cannot connect to server. Please make sure the backend server is running on port 5000."
        );
      } else if (error.message.includes("HTTP error")) {
        setError(
          `Server error: ${error.message}. Please check the server logs.`
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

    // Redirect to previous page
    navigate(-1); // This will go back to the previous page
  };

  return (
    <div className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-xl">
      <div className="flex md:flex-row">
        {/* Left Side - Image */}
        <div className="md:w-1/2 w-full relative overflow-hidden">
          <div className="absolute inset-0  z-10"></div>
          <img
            src="/Register.png"
            alt="Adventure"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            style={{ minHeight: "600px", maxHeight: "1000px" }}
          />
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-[50px] bg-gradient-to-br from-[#ECEAEA] to-[#F5F5F5]">
          <div className="w-full max-w-[550px]">
            <h2
              className="text-[48px] font-bold mb-[15px] text-center leading-tight"
              style={{ color: "#7d9d49ff" }}
            >
              Join The <br />
              <span style={{ color: "#6B8E3D" }}>Adventure Challenge</span>
            </h2>
            <p
              className="text-[16px] mb-[40px] text-center font-medium"
              style={{ color: "#4f4f4f" }}
            >
              Sign Up To Embark On An Unforgettable Outdoor Experience
            </p>

            {error && (
              <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
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

            <form className="w-full space-y-[25px]" onSubmit={handleSubmit}>
              <div className="flex gap-[30px] w-full">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
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
                    required
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
                    required
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
                    required
                    minLength="6"
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
                  className="mt-1 w-4 h-4 accent-[#7d9d49ff] rounded focus:ring-2 focus:ring-[#7d9d49ff]/50"
                  required
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
                  style={{
                    backgroundColor: "transparent",
                    color: "#79a730ff",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{
                    backgroundColor: "#79a730ff",
                    color: "#ffffff",
                  }}
                >
                  <span className="relative z-10">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
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
                        Registering...
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </span>
                </button>
              </div>

              <div className="text-center pt-[25px]">
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
