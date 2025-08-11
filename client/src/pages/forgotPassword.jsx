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
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-xl">
        <div className="flex md:flex-row">
          {/* Left Side - Form */}
          <div className="md:w-1/2 w-full p-[60px] flex flex-col justify-center items-center bg-gradient-to-br from-[#ECEAEA] to-[#F5F5F5]">
            <div className="w-full max-w-[400px]">
              <h2
                className="text-[48px] font-bold mb-[15px] text-center leading-tight"
                style={{ color: "#7d9d49ff" }}
              >
                Forgot Password?
              </h2>

              <p
                className="text-[16px] mb-[40px] text-center font-medium"
                style={{ color: "#4f4f4f" }}
              >
                Enter your email address and we'll send you a link to reset your
                password
              </p>

              {error && (
                <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
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

              {success && (
                <div className="w-full mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {success}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full space-y-[25px]">
                <div className="w-full relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-[50px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

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
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </span>
                </button>

                <div className="text-center pt-[20px]">
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
            <div className="absolute inset-0 z-10"></div>
            <img
              src="/ForgotPassword.png"
              alt="Forgot Password"
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
