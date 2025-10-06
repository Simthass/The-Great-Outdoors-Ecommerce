import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Shield,
  Package,
  ShoppingCart,
  ChevronDown,
  Home,
  Store,
  Info,
  Mail,
  Calendar,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import SearchModal from "./SearchModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);

  const profileMenuRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const isHome = location.pathname === "/";
  const linkColor = isHome ? "text-[#ffffff]" : "text-[#111111]";

  // Check if user is admin - handle loading state
  const isAdmin = isAuthenticated && user && user.role === "Admin";

  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const shopDropdownRef = useRef(null);

  const categories = [
    "Backpacks",
    "Climbing",
    "Camping",
    "Fishing",
    "Hiking",
    "Hunting",
    "Outfitting",
    "Hydration",
    "Knives & Multitools",
  ];

  // Function to determine the correct image URL
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

    return "/default-profile.jpg";
  };

  // Fetch user profile image when component mounts or user changes
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (isAuthenticated && user) {
        try {
          setImageLoading(true);
          setImageError(false);

          const token = localStorage.getItem("token");
          const response = await fetch(
            "http://localhost:5000/api/auth/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.profileImage) {
              const imageUrl = getProfileImageUrl(data.data.profileImage);
              setProfileImage(imageUrl);
            } else {
              setProfileImage("/default-profile.jpg");
            }
          } else {
            setProfileImage("/default-profile.jpg");
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
          setProfileImage("/default-profile.jpg");
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      } else {
        setProfileImage("/default-profile.jpg");
        setImageError(false);
      }
    };

    fetchProfileImage();
  }, [isAuthenticated, user]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Close shop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target)
      ) {
        setIsShopDropdownOpen(false);
      }
    };

    if (isShopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShopDropdownOpen]);

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target)
      ) {
        setIsMobileSearchOpen(false);
        setMobileSearchQuery("");
      }
    };

    if (isMobileSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileSearchOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        if (window.innerWidth >= 768) {
          setIsSearchModalOpen(true);
        } else {
          setIsMobileSearchOpen(true);
        }
      }
      // Escape to close search modal
      if (event.key === "Escape") {
        if (isSearchModalOpen) {
          setIsSearchModalOpen(false);
        }
        if (isMobileSearchOpen) {
          setIsMobileSearchOpen(false);
          setMobileSearchQuery("");
        }
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, isMobileSearchOpen, isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    setProfileImage("/default-profile.jpg");
    setImageError(false);
    navigate("/");
  };

  // Mobile search submit handler
  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setMobileSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  // Function to get user initials as fallback
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
    return initials;
  };

  // Handle image error by falling back to initials
  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = "none";
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = "flex";
    }
  };

  // Handle successful image load
  const handleImageLoad = (e) => {
    setImageError(false);
    e.target.style.display = "block";
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = "none";
    }
  };

  const ProfileAvatar = ({
    size = "w-[50px] h-[50px]",
    textSize = "text-sm",
  }) => (
    <div className={`relative ${size} rounded-full overflow-hidden`}>
      {imageLoading || loading ? (
        <div className="bg-gray-300 animate-pulse rounded-full w-full h-full flex items-center justify-center">
          <User
            size={size.includes("12") ? 16 : 24}
            className="text-gray-500"
          />
        </div>
      ) : (
        <>
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover cursor-pointer rounded-full border-2 border-white"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageError ? "none" : "block" }}
          />
          <div
            className={`bg-[#8DC53E] rounded-full w-full h-full flex items-center justify-center text-white font-semibold ${textSize} cursor-pointer absolute top-0 left-0`}
            style={{ display: imageError ? "flex" : "none" }}
          >
            {getUserInitials()}
          </div>
        </>
      )}
    </div>
  );

  const DesktopProfileMenu = () => (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={toggleProfileMenu}
        className={`${linkColor} hover:text-[#8DC53E] transition-colors duration-200 p-2 rounded-full`}
      >
        {isAuthenticated ? <ProfileAvatar /> : <User size={24} />}
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-3 z-50 border border-gray-100">
          <Link
            to="/userProfile"
            className="flex items-center px-6 py-4 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <User size={20} className="mr-4 text-gray-500" />
            <span>Profile</span>
          </Link>

          <Link
            to="/settings"
            className="flex items-center px-6 py-4 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <Settings size={20} className="mr-4 text-gray-500" />
            <span>Settings</span>
          </Link>

          <Link
            to="/orders"
            className="flex items-center px-6 py-4 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <Package size={20} className="mr-4 text-gray-500" />
            <span>My Orders</span>
          </Link>

          <hr className="my-2 border-gray-200" />

          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
          >
            <LogOut size={20} className="mr-4 text-gray-500" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );

  const DesktopAuthButtons = ({ className = "" }) => (
    <div className={`flex items-center gap-x-[40px] ${className}`}>
      {isAuthenticated ? (
        <DesktopProfileMenu />
      ) : (
        <Link to="/register">
          <button
            className="bg-[#8DC53E] text-[#ffffff] font-semibold hover:bg-[#7AB32E] transition-colors duration-200 border-none cursor-pointer"
            style={{
              height: "45px",
              width: "163px",
              borderRadius: "5px",
              borderBottomRightRadius: "25px",
              fontSize: "16px",
            }}
          >
            Register Now
          </button>
        </Link>
      )}

      <button
        onClick={() => setIsSearchModalOpen(true)}
        className="bg-[#8DC53E] text-[#ffffff] flex items-center justify-center hover:bg-[#7AB32E] transition-colors duration-200 border-none relative group cursor-pointer"
        style={{
          height: "45px",
          width: "50px",
          borderRadius: "5px",
          fontSize: "16px",
        }}
        title="Search (Ctrl+K)"
      >
        <Search size={20} />
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Search (Ctrl+K)
        </div>
      </button>

      <Link to="/cart">
        <div
          className={`${
            isHome ? "text-white" : "text-black"
          } hover:text-[#8DC53E] transition-colors duration-200`}
        >
          <img
            src="/cart.svg"
            alt="Cart icon"
            className="w-7 h-7"
            style={{
              filter: isHome ? "none" : "brightness(0)",
            }}
          />
        </div>
      </Link>
    </div>
  );

  return (
    <>
      <header
        className={`w-full bg-cover bg-center bg-no-repeat bg-fixed ${
          !isHome ? "mb-[20px]" : ""
        }`}
      >
        {/* Desktop View (1280px+) - UNCHANGED ORIGINAL DESIGN */}
        <div className="hidden xl:flex flex-wrap items-center justify-between mt-[-20px]">
          <div className="flex items-center space-x-2 ml-[70px] mt-[20px]">
            <Link to="/">
              <img src="/TGO-Logo.png" alt="Logo" className="w-32 h-16" />
            </Link>
          </div>

          <nav className="flex items-center justify-center text-base mt-[40px]">
            <ul className="flex items-center justify-center gap-[60px] w-full list-none">
              <li>
                <Link
                  to="/"
                  className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
                >
                  Home
                </Link>
              </li>
              <div
                className="flex items-center relative"
                ref={shopDropdownRef}
                onMouseEnter={() => setIsShopDropdownOpen(true)}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <li className="relative">
                  <Link
                    to="/shop"
                    className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline mr-[5px] flex items-center gap-1`}
                  >
                    Shop
                    <img
                      src="/dropdown-arrow.svg"
                      alt="Dropdown"
                      height={7}
                      width={12}
                      className={`mt-[3px] transition-transform duration-200 ${
                        isShopDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Link>

                  {isShopDropdownOpen && (
                    <div className="absolute top-full left-0 mt-3 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                      <div className="p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                          Shop by Category
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                          {categories.map((category) => (
                            <button
                              key={category}
                              onClick={() => {
                                navigate(`/shop?category=${category}`);
                                setIsShopDropdownOpen(false);
                              }}
                              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#8DC53E]/15 hover:to-[#8DC53E]/5 hover:text-[#8DC53E] transition-all duration-200 group w-full"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-[#8DC53E]">
                                {category}
                              </span>
                              <svg
                                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#8DC53E]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          ))}
                        </div>

                        <div className="mt-5 border-t border-gray-200 pt-4">
                          <Link
                            to="/shop"
                            onClick={() => setIsShopDropdownOpen(false)}
                            className="text-sm text-[#8DC53E] hover:text-[#7AB32E] font-medium transition-colors duration-200"
                          >
                            View All Products →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              </div>

              <li>
                <Link
                  to="/aboutUs"
                  className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contactus"
                  className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/Events"
                  className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
                >
                  Events
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    to="/AdminDashboard"
                    className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline flex items-center gap-2`}
                  >
                    <span className={isHome ? "text-white" : "text-black"}>
                      Admin
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <DesktopAuthButtons className="mr-[75px] mt-[40px]" />
        </div>

        {/* MODERN TABLET VIEW (768px - 1279px) */}
        <div className="hidden md:flex xl:hidden items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-40">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/TGO-Logo.png" alt="Logo" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleMobileSearchSubmit(e);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent text-sm bg-gray-50"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Right - Action Icons */}
          <div className="flex items-center gap-4">
            {/* Cart Icon with Badge */}
            <Link to="/cart" className="relative">
              <div className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <ShoppingCart size={22} className="text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8DC53E] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Profile/Login */}
            {isAuthenticated ? (
              <button
                onClick={toggleProfileMenu}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ProfileAvatar size="w-9 h-9" textSize="text-xs" />
              </button>
            ) : (
              <Link to="/register">
                <button className="bg-[#8DC53E] text-white px-5 py-2 rounded-full hover:bg-[#7AB32E] transition-colors duration-200 text-sm font-medium">
                  Sign In
                </button>
              </Link>
            )}

            {/* Hamburger Menu */}
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Profile Dropdown for Tablet */}
          {isProfileMenuOpen && isAuthenticated && (
            <div
              ref={profileMenuRef}
              className="absolute right-6 top-16 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link
                to="/userProfile"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User size={18} className="mr-3 text-gray-500" />
                Profile
              </Link>
              <Link
                to="/orders"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Package size={18} className="mr-3 text-gray-500" />
                My Orders
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Settings size={18} className="mr-3 text-gray-500" />
                Settings
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-3" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* MODERN MOBILE VIEW (< 768px) */}
        <div className="md:hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-40">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/TGO-Logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              {/* Search Icon */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Search size={20} className="text-gray-700" />
              </button>

              {/* Cart Icon with Badge */}
              <Link to="/cart" className="relative">
                <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <ShoppingCart size={20} className="text-gray-700" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#8DC53E] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Hamburger Menu */}
              <button
                onClick={toggleMenu}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Menu size={20} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Expandable Search Bar */}
          {isMobileSearchOpen && (
            <div className="px-4 py-3 bg-white border-b border-gray-200 animate-slideDown">
              <form onSubmit={handleMobileSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent text-sm"
                  autoFocus
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setMobileSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* MODERN SIDE DRAWER MENU (Tablet & Mobile) */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={toggleMenu}
            ></div>

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-[#8DC53E] to-[#7AB32E]">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={toggleMenu}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Info Section */}
              {isAuthenticated && user ? (
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar size="w-14 h-14" textSize="text-base" />
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-800">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    Sign in to access your account
                  </p>
                  <div className="flex gap-2">
                    <Link to="/login" onClick={toggleMenu} className="flex-1">
                      <button className="w-full bg-white border-2 border-[#8DC53E] text-[#8DC53E] py-2 rounded-lg hover:bg-[#8DC53E] hover:text-white transition-colors duration-200 text-sm font-medium">
                        Login
                      </button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={toggleMenu}
                      className="flex-1"
                    >
                      <button className="w-full bg-[#8DC53E] text-white py-2 rounded-lg hover:bg-[#7AB32E] transition-colors duration-200 text-sm font-medium">
                        Register
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="p-5 space-y-1">
                <Link
                  to="/"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                >
                  <Home
                    size={20}
                    className="text-gray-500 group-hover:text-[#8DC53E]"
                  />
                  <span className="font-medium">Home</span>
                </Link>

                {/* Shop with Dropdown */}
                <div>
                  <button
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <Store
                        size={20}
                        className="text-gray-500 group-hover:text-[#8DC53E]"
                      />
                      <span className="font-medium">Shop</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        isShopDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Shop Dropdown */}
                  {isShopDropdownOpen && (
                    <div className="mt-1 ml-4 pl-8 space-y-1 border-l-2 border-[#8DC53E]/20">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            navigate(`/shop?category=${category}`);
                            setIsShopDropdownOpen(false);
                            toggleMenu();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-[#8DC53E] hover:bg-[#8DC53E]/5 rounded-lg transition-all duration-200"
                        >
                          {category}
                        </button>
                      ))}
                      <Link
                        to="/shop"
                        onClick={() => {
                          setIsShopDropdownOpen(false);
                          toggleMenu();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-[#8DC53E] font-medium hover:bg-[#8DC53E]/5 rounded-lg transition-all duration-200"
                      >
                        View All Products →
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/aboutUs"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                >
                  <Info
                    size={20}
                    className="text-gray-500 group-hover:text-[#8DC53E]"
                  />
                  <span className="font-medium">About Us</span>
                </Link>

                <Link
                  to="/contactus"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                >
                  <Mail
                    size={20}
                    className="text-gray-500 group-hover:text-[#8DC53E]"
                  />
                  <span className="font-medium">Contact Us</span>
                </Link>

                <Link
                  to="/Events"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                >
                  <Calendar
                    size={20}
                    className="text-gray-500 group-hover:text-[#8DC53E]"
                  />
                  <span className="font-medium">Events</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/AdminDashboard"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <Shield size={20} className="text-blue-500" />
                    <span className="font-medium">Admin Dashboard</span>
                  </Link>
                )}
              </nav>

              {/* User Account Links (Only show if authenticated) */}
              {isAuthenticated && (
                <>
                  <div className="px-5 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      My Account
                    </h3>
                  </div>
                  <nav className="px-5 space-y-1">
                    <Link
                      to="/userProfile"
                      onClick={toggleMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                    >
                      <User
                        size={20}
                        className="text-gray-500 group-hover:text-[#8DC53E]"
                      />
                      <span className="font-medium">My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={toggleMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                    >
                      <Package
                        size={20}
                        className="text-gray-500 group-hover:text-[#8DC53E]"
                      />
                      <span className="font-medium">My Orders</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={toggleMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                    >
                      <Settings
                        size={20}
                        className="text-gray-500 group-hover:text-[#8DC53E]"
                      />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </nav>
                </>
              )}

              {/* Bottom Action Button */}
              {isAuthenticated && (
                <div className="p-5 border-t border-gray-200 mt-4">
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal for Desktop/Tablet */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        /* Smooth scrolling for drawer */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #8dc53e #f3f4f6;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #8dc53e;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #7ab32e;
        }

        /* Backdrop blur effect */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }

        /* Focus styles for inputs */
        input:focus {
          box-shadow: 0 0 0 3px rgba(141, 197, 62, 0.1);
        }

        /* Smooth transitions */
        * {
          transition-property: background-color, border-color, color, fill,
            stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Button hover effects */
        button:active {
          transform: scale(0.98);
        }

        /* Link hover effects */
        a:active {
          transform: scale(0.98);
        }

        /* Badge animation */
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Responsive text sizing */
        @media (max-width: 768px) {
          .text-responsive {
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .text-responsive {
            font-size: 0.8rem;
          }
        }

        /* Drawer slide-in animation */
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        /* Shadow utilities */
        .shadow-soft {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .shadow-medium {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        /* Gradient text effect */
        .gradient-text {
          background: linear-gradient(135deg, #8dc53e 0%, #7ab32e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Category badge styles */
        .category-badge {
          background: linear-gradient(
            135deg,
            rgba(141, 197, 62, 0.1) 0%,
            rgba(122, 179, 46, 0.1) 100%
          );
          border: 1px solid rgba(141, 197, 62, 0.2);
        }

        /* Sticky header enhancement */
        .sticky {
          position: sticky;
          top: 0;
          z-index: 40;
        }

        /* Modern card styling */
        .modern-card {
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
        }

        /* Icon hover effect */
        .icon-hover {
          transition: transform 0.2s ease;
        }

        .icon-hover:hover {
          transform: translateY(-2px);
        }

        /* Search input glow effect */
        input:focus {
          box-shadow: 0 0 0 3px rgba(141, 197, 62, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Menu item active state */
        .menu-item-active {
          background: linear-gradient(
            90deg,
            rgba(141, 197, 62, 0.1) 0%,
            transparent 100%
          );
          border-left: 3px solid #8dc53e;
        }

        /* Dropdown animation */
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-animate {
          animation: dropdownSlide 0.2s ease-out;
        }

        /* Badge pulse animation */
        @keyframes badgePulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .badge-pulse {
          animation: badgePulse 2s infinite;
        }

        /* Responsive utilities */
        @media (max-width: 640px) {
          .drawer-width {
            width: 85%;
          }
        }

        @media (min-width: 641px) and (max-width: 1023px) {
          .drawer-width {
            width: 380px;
          }
        }

        /* Loading skeleton */
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }

        .skeleton {
          animation: shimmer 1.2s ease-in-out infinite;
          background: linear-gradient(
            to right,
            #f0f0f0 4%,
            #e0e0e0 25%,
            #f0f0f0 36%
          );
          background-size: 1000px 100%;
        }

        /* Prevent body scroll when menu is open */
        body.menu-open {
          overflow: hidden;
        }

        /* Enhanced hover states */
        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(141, 197, 62, 0.2);
        }

        /* Button loading state */
        .btn-loading {
          position: relative;
          pointer-events: none;
        }

        .btn-loading::after {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          top: 50%;
          left: 50%;
          margin-left: -8px;
          margin-top: -8px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Glass morphism effect */
        .glass {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* Gradient border effect */
        .gradient-border {
          position: relative;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .gradient-border::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #8dc53e, #7ab32e);
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>
    </>
  );
};

export default Header;
