// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { resettoken } = useParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { password, confirmPassword } = formData;

    // Basic validation
    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Strong password: at least 1 uppercase, 1 number, 1 special char
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password must contain at least one uppercase letter, one number, and one special character"
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/reset-password/${resettoken}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setFormData({ password: "", confirmPassword: "" });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="reset-page">
      <div className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-xl">
        <div className="flex md:flex-row">
          {/* Left Side - Form */}
          <div className="md:w-1/2 w-full p-[60px] flex flex-col justify-center items-center bg-gradient-to-br from-[#ECEAEA] to-[#F5F5F5]">
            <div className="w-full max-w-[400px]">
              <h2
                className="text-[48px] font-bold mb-[15px] text-center leading-tight"
                style={{ color: "#7d9d49ff" }}
                data-testid="reset-title"
              >
                Reset Password
              </h2>

              <p
                className="text-[16px] mb-[40px] text-center font-medium"
                style={{ color: "#4f4f4f" }}
                data-testid="reset-subtitle"
              >
                Enter your new password below to complete the reset process
              </p>

              {error && (
                <div
                  className="w-full mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
                  data-testid="error-alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="w-full mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm"
                  data-testid="success-alert"
                >
                  {success}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="w-full space-y-[25px]"
                data-testid="reset-form"
              >
                <div className="w-full relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    disabled={loading}
                    data-testid="password-input"
                    className="w-full h-[50px] pl-[20px] pr-[20px] bg-white/80 border-2 border-gray-200 rounded-[8px]"
                  />
                </div>

                <div className="w-full relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    disabled={loading}
                    data-testid="confirmPassword-input"
                    className="w-full h-[50px] pl-[20px] pr-[20px] bg-white/80 border-2 border-gray-200 rounded-[8px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="submit-btn"
                  className="w-full h-[50px] text-[16px] font-semibold rounded-[8px]"
                  style={{ backgroundColor: "#79a730ff", color: "#ffffff" }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <div
                  className="text-center pt-[20px]"
                  data-testid="back-to-login"
                >
                  <p className="text-[15px]" style={{ color: "#4f4f4f" }}>
                    Remember your password?{" "}
                    <Link
                      to="/login"
                      className="font-semibold cursor-pointer hover:underline"
                      style={{ color: "#7d9d49ff" }}
                    >
                      Back to Login
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="md:w-1/2 w-full relative overflow-hidden">
            <img
              src="/Reset-Password.png"
              alt="Reset Password"
              data-testid="reset-image"
              className="w-full h-full object-cover"
              style={{ minHeight: "600px", maxHeight: "600px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
