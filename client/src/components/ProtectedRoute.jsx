import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { updateUser } from "../store/slices/authSlice";
import { Shield, Home, ArrowLeft } from "lucide-react";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredRoles = [],
  fallbackPath = "/",
}) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token, loading } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!token) {
        setVerifying(false);
        setAccessDenied(false);
        return;
      }

      if (user) {
        checkRoleAccess(user);
        setVerifying(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/verify",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          dispatch(updateUser(response.data.data.user));
          checkRoleAccess(response.data.data.user);
        } else {
          setAccessDenied(false);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setAccessDenied(false);
      } finally {
        setVerifying(false);
      }
    };

    const checkRoleAccess = (userData) => {
      if (requiredRole || requiredRoles.length > 0) {
        const rolesToCheck = requiredRole ? [requiredRole] : requiredRoles;
        if (!rolesToCheck.includes(userData.role)) {
          setAccessDenied(true);
        } else {
          setAccessDenied(false);
        }
      } else {
        setAccessDenied(false);
      }
    };

    verifyAccess();
  }, [token, user, requiredRole, requiredRoles, dispatch]);

  // Loading state
  if (verifying || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#8DC53E] mx-auto mb-6"></div>
            <Shield
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#8DC53E]"
              size={24}
            />
          </div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account deactivated
  if (user && !user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Account Suspended
              </h2>
            </div>
            <div className="px-6 py-8">
              <p className="text-gray-600 text-center mb-6">
                Your account has been temporarily suspended. Please contact our
                support team for assistance.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access denied - Modern professional design
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-40 h-40 bg-white rounded-full"></div>
              </div>
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Access Restricted
                </h2>
                <p className="text-white/90 text-sm">
                  This page requires special permissions
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <div className="text-center mb-8">
                <p className="text-gray-600 text-lg leading-relaxed">
                  You don't have permission to access this page. If you believe
                  this is an error, please contact your administrator.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  <ArrowLeft size={20} />
                  Go Back
                </button>
                <button
                  onClick={() => (window.location.href = fallbackPath)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8DC53E] to-[#7ab82e] text-white px-6 py-3 rounded-lg font-medium hover:from-[#97D243] hover:to-[#8DC53E] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Home size={20} />
                  Home
                </button>
              </div>

              {/* Help section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 text-center">
                  Need help?{" "}
                  <a
                    href="mailto:Simthass@outlook.com"
                    className="text-blue-600 hover:text-blue-700 font-medium
                  underline"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
