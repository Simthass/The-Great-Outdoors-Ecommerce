// src/pages/login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../store/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const { loading, error: reduxError } = useSelector((state) => state.auth);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    dispatch(loginStart());

    if (!formData.email || !formData.password) {
      dispatch(loginFailure("Please provide both email and password"));
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch(loginSuccess({ user: data.data.user, token: data.data.token }));
        setFormData({ email: "", password: "" });
        navigate("/");
      } else {
        dispatch(loginFailure(data.message || "Login failed"));
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.message?.includes("Failed to fetch")) {
        dispatch(
          loginFailure(
            "Cannot connect to server. Please make sure the backend server is running on port 5000."
          )
        );
      } else {
        dispatch(loginFailure("Login failed. Please try again."));
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address first");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Password reset instructions have been sent to your email (if the account exists).");
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Failed to send reset email. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login will be implemented in the future");
  };

  return (
    <div
      className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-xl"
      data-testid="login-page"
    >
      <div className="flex md:flex-row">
        {/* Left Side - Form */}
        <div className="md:w-1/2 w-full p-[60px] flex flex-col justify-center items-center bg-gradient-to-br from-[#ECEAEA] to-[#F5F5F5]">
          <div className="w-full max-w-[350px]">
            <h2
              className="text-[48px] font-bold mb-[15px] text-center leading-tight"
              style={{ color: "#7d9d49ff" }}
              data-testid="login-title"
            >
              Welcome Back!
            </h2>

            <p
              className="text-[16px] mb-[50px] text-center font-medium"
              style={{ color: "#4f4f4f" }}
              data-testid="login-subtitle"
            >
              Sign in To Embark On An Unforgettable Outdoor Experience
            </p>

            {(error || reduxError) && (
              <div
                className="w-full mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
                data-testid="error-alert"
                role="alert"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error || reduxError}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              data-testid="login-form"
              aria-label="Login form"
              noValidate
            >
              <div className="w-full space-y-[25px]">
                <div className="w-full relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    autoComplete="username"
                    data-testid="email-input"
                    className="w-full h-[50px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="w-full space-y-3">
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      data-testid="password-input"
                      className="w-full h-[50px] pl-[20px] pr-[20px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 placeholder:text-gray-500 outline-none rounded-[8px] focus:border-[#7d9d49ff] focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="text-right">
                    <Link
                      to="/forgotPassword"
                      className="text-[14px] font-semibold hover:underline transition-all duration-200 cursor-pointer"
                      style={{ color: "#4e7f00ff" }}
                      data-testid="forgot-link"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <div className="space-y-[25px] pt-[10px]">
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="signin-btn"
                    aria-busy={loading ? "true" : "false"}
                    className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                    style={{ backgroundColor: "#79a730ff", color: "#ffffff" }}
                  >
                    <span className="relative z-10">
                      {loading ? (
                        <div
                          className="flex items-center justify-center gap-2"
                          data-testid="signin-loading"
                        >
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                          Signing in...
                        </div>
                      ) : (
                        "Sign in"
                      )}
                    </span>
                  </button>

                  <div className="relative flex items-center justify-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-[15px] text-gray-500 font-medium bg-[#ECEAEA] px-3 py-1 rounded-full">
                      OR
                    </span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    data-testid="google-btn"
                    className="w-full h-[50px] text-[16px] font-semibold rounded-[8px] outline-none border-2 border-[#79a730ff] flex items-center justify-center gap-[12px] disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                    style={{ backgroundColor: "transparent", color: "#79a730ff" }}
                  >
                    <img
                      src="/Google.png"
                      alt="Google"
                      className="w-[25px] h-[25px] object-contain"
                      data-testid="google-icon"
                    />
                    <span>Sign in with Google</span>
                  </button>
                </div>

                <div className="text-center pt-[20px]">
                  <p className="text-[15px]" style={{ color: "#4f4f4f" }}>
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold cursor-pointer no-underline hover:underline transition-all duration-200"
                      style={{ color: "#7d9d49ff" }}
                      data-testid="register-link"
                    >
                      Register Now
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="md:w-1/2 w-full relative overflow-hidden">
          <div className="absolute inset-0 z-10"></div>
          <img
            src="/Login.png"
            alt="Adventure"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            style={{ minHeight: "600px", maxHeight: "1000px" }}
            data-testid="login-hero-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;

