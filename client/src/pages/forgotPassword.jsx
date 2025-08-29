// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Password reset email sent successfully! Check your inbox.");
        setEmail("");
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-12"
      data-testid="forgot-page"
    >
      <div className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-xl">
        <div className="flex md:flex-row">
          {/* Left Side - Form */}
          <div className="md:w-1/2 w-full p-[60px] flex flex-col justify-center items-center bg-gradient-to-br from-[#ECEAEA] to-[#F5F5F5]">
            <div className="w-full max-w-[400px]">
              <h2
                className="text-[48px] font-bold mb-[15px] text-center leading-tight"
                style={{ color: "#7d9d49ff" }}
                data-testid="forgot-title"
              >
                Forgot Password?
              </h2>

              <p
                className="text-[16px] mb-[40px] text-center font-medium"
                style={{ color: "#4f4f4f" }}
                data-testid="forgot-subtitle"
              >
                Enter your email address and we'll send you a link to reset your
                password
              </p>

              {error && (
                <div
                  className="w-full mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
                  data-testid="error-alert"
                >
                  <div className="flex items-center">{error}</div>
                </div>
              )}

              {success && (
                <div
                  className="w-full mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm"
                  data-testid="success-alert"
                >
                  <div className="flex items-center">{success}</div>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="w-full space-y-[25px]"
                data-testid="forgot-form"
              >
                <div className="w-full relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    data-testid="email-input"
                    className="w-full h-[50px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="submit-btn"
                  className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{ backgroundColor: "#79a730ff", color: "#ffffff" }}
                >
                  <span className="relative z-10">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </span>
                </button>

                <div
                  className="text-center pt-[20px]"
                  data-testid="back-to-login"
                >
                  <p className="text-[15px]" style={{ color: "#4f4f4f" }}>
                    Remember your password?{" "}
                    <Link
                      to="/login"
                      className="font-semibold cursor-pointer no-underline hover:underline transition-all duration-200"
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
              src="/ForgotPassword.png"
              alt="Forgot Password"
              data-testid="forgot-image"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              style={{ minHeight: "600px", maxHeight: "600px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

