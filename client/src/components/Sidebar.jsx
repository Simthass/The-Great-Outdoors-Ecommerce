// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  LogOut,
  Calendar,
  Star,
  Truck,
  FileText,
  Tag,
  ClipboardList,
  Bell,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ currentPage, onPageChange, userProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localUserProfile, setLocalUserProfile] = useState(userProfile);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [imageError, setImageError] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fetch user profile if not provided
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userProfile) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch("/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (data.success) {
            setLocalUserProfile(data.data);
            if (
              data.data.profileImage &&
              data.data.profileImage !== "/default-profile.jpg"
            ) {
              setProfileImage(getProfileImageUrl(data.data.profileImage));
            }
          }
        } catch (err) {
          console.error("Error fetching user profile in sidebar:", err);
        }
      } else {
        setLocalUserProfile(userProfile);
        if (
          userProfile.profileImage &&
          userProfile.profileImage !== "/default-profile.jpg"
        ) {
          setProfileImage(getProfileImageUrl(userProfile.profileImage));
        }
      }
    };

    fetchUserProfile();
  }, [userProfile]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && !event.target.closest(".sidebar-container")) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  const getProfileImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl === "/default-profile.jpg") {
      return "/default-profile.jpg";
    }
    if (imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("/uploads/")) {
      return `http://localhost:5000${imageUrl}`;
    }
    if (imageUrl.startsWith("http://localhost:5000/uploads/")) {
      return imageUrl;
    }
    return "/default-profile.jpg";
  };

  const getUserInitials = () => {
    if (!localUserProfile) return "A";
    const firstName = localUserProfile.firstName || "";
    const lastName = localUserProfile.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "A";
  };

  const desktopMenuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/AdminDashboard",
    },
    {
      key: "users",
      label: "User Management",
      icon: Users,
      path: "/Admin/User",
    },
    {
      key: "products",
      label: "Product Management",
      icon: Package,
      path: "/Admin/AdminProduct",
    },
    {
      key: "orders",
      label: "Order Management",
      icon: ShoppingCart,
      path: "/Admin/OrderManagement",
    },
    {
      key: "inventory",
      label: "Inventory",
      icon: ClipboardList,
      path: "/Admin/Inventory",
    },
    {
      key: "reviews",
      label: "Review Management",
      icon: Star,
      path: "/Admin/ReviewList",
    },
    {
      key: "coupons",
      label: "Coupon Management",
      icon: Tag,
      path: "/Admin/AdminCoupons",
    },
    {
      key: "events",
      label: "Event Management",
      icon: Calendar,
      path: "/Admin/EventManagement",
    },
    {
      key: "content",
      label: "Content Management",
      icon: FileText,
      path: "/Admin/ContentManagement",
    },
  ];

  const mobileMenuItems = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      path: "/",
    },
    ...desktopMenuItems,
  ];

  const handleNavigation = (key, path) => {
    onPageChange(key);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
            <div className="w-10 h-10 bg-[#8DC53E] rounded-xl flex items-center justify-center shadow-lg">
              <img
                src="/TGO-Logo.png"
                alt="The Great Outdoor"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="text-white font-bold text-sm hidden items-center justify-center w-full h-full"
                style={{ display: "none" }}
              >
                TGO
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
            </div>
          </div>

          {/* Mobile User Profile */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#8DC53E] bg-gray-100">
                <img
                  src={profileImage}
                  alt={localUserProfile?.firstName || "Admin"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  style={{ display: imageError ? "none" : "block" }}
                />
                {imageError && (
                  <div className="w-full h-full bg-gradient-to-br from-[#8DC53E] to-[#7db434] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)] h-screen sticky top-0">
        {/* Header with Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#8DC53E] rounded-xl flex items-center justify-center shadow-lg">
              <img
                src="/TGO-Logo.png"
                alt="The Great Outdoor"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="text-white font-bold text-lg hidden items-center justify-center w-full h-full"
                style={{ display: "none" }}
              >
                TGO
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#8DC53E]/5 to-[#7db434]/5">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#8DC53E] bg-gray-100">
                <img
                  src={profileImage}
                  alt={localUserProfile?.firstName || "Admin"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  style={{ display: imageError ? "none" : "block" }}
                />
                {imageError && (
                  <div className="w-full h-full bg-gradient-to-br from-[#8DC53E] to-[#7db434] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {localUserProfile
                  ? `${localUserProfile.firstName} ${localUserProfile.lastName}`
                  : "Loading..."}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {localUserProfile?.role || "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {desktopMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key, item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-[#8DC53E] text-white shadow-lg shadow-[#8DC53E]/25"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#8DC53E]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-[#8DC53E]"
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          sidebar-container
          lg:hidden fixed inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 bg-white flex flex-col border-r border-gray-200
          shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]
        `}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8DC53E] bg-gray-100">
                  <img
                    src={profileImage}
                    alt={localUserProfile?.firstName || "Admin"}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    style={{ display: imageError ? "none" : "block" }}
                  />
                  {imageError && (
                    <div className="w-full h-full bg-gradient-to-br from-[#8DC53E] to-[#7db434] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {getUserInitials()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {localUserProfile
                    ? `${localUserProfile.firstName} ${localUserProfile.lastName}`
                    : "Loading..."}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {localUserProfile?.role || "Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.key, item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-[#8DC53E] text-white shadow-lg shadow-[#8DC53E]/25"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#8DC53E]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-[#8DC53E]"
                  }`}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Sidebar;
