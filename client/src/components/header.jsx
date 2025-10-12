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
  Home,
  Store,
  Info,
  Mail,
  Calendar,
  ChevronDown,
  ChevronRight,
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
  const [isScrolled, setIsScrolled] = useState(false);

  const profileMenuRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const isHome = location.pathname === "/";
  const isAdmin = isAuthenticated && user && user.role === "Admin";

  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  const categories = [
    "Hiking Gear",
    "Camping Equipment",
    "Climbing Essentials",
    "Outdoor Apparel",
    "Adventure Accessories",
    "Water Sports",
    "Winter Gear",
    "Travel Bags",
  ];

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.profileImage) {
              setProfileImage(getProfileImageUrl(data.data.profileImage));
            }
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      }
    };
    fetchProfileImage();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target)
      ) {
        setIsShopDropdownOpen(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target)
      ) {
        setIsMobileSearchOpen(false);
        setMobileSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen, isShopDropdownOpen, isMobileSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        window.innerWidth >= 768
          ? setIsSearchModalOpen(true)
          : setIsMobileSearchOpen(true);
      }
      if (event.key === "Escape") {
        setIsSearchModalOpen(false);
        setIsMobileSearchOpen(false);
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, isMobileSearchOpen, isMenuOpen, isProfileMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    dispatch(logout());
    setProfileImage("/default-profile.jpg");
    navigate("/");
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setMobileSearchQuery("");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const handleProfileMenuClick = (path) => {
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    navigate(path);
  };

  const ProfileAvatar = ({ size = "w-10 h-10", textSize = "text-sm" }) => (
    <div
      className={`relative ${size} rounded-full overflow-hidden border-2 border-white/20 backdrop-blur-sm`}
    >
      {imageLoading ? (
        <div className="bg-gray-300 animate-pulse rounded-full w-full h-full" />
      ) : (
        <>
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover cursor-pointer"
            onError={(e) => {
              setImageError(true);
              e.target.style.display = "none";
            }}
            onLoad={(e) => {
              setImageError(false);
              e.target.style.display = "block";
            }}
            style={{ display: imageError ? "none" : "block" }}
          />
          {imageError && (
            <div
              className={`bg-gradient-to-br from-[#8DC53E] to-[#7db434] rounded-full w-full h-full flex items-center justify-center text-white font-semibold ${textSize} cursor-pointer absolute top-0 left-0`}
            >
              {getUserInitials()}
            </div>
          )}
        </>
      )}
    </div>
  );

  const DesktopNav = () => (
    <nav className="flex items-center space-x-8">
      {[
        { path: "/", label: "Home" },
        { path: "/shop", label: "Shop", dropdown: true },
        { path: "/aboutUs", label: "About" },
        { path: "/contactus", label: "Contact" },
        { path: "/events", label: "Events" },
        ...(isAdmin ? [{ path: "/AdminDashboard", label: "Admin" }] : []),
      ].map((item) => (
        <div
          key={item.path}
          className="relative group"
          ref={item.dropdown ? shopDropdownRef : null}
        >
          <Link
            to={item.path}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-300 ${
              isHome && !isScrolled
                ? "text-white/90 hover:text-white hover:bg-white/10"
                : "text-gray-700 hover:text-[#8DC53E] hover:bg-gray-50/80"
            } ${item.dropdown ? "cursor-default" : ""}`}
            onMouseEnter={
              item.dropdown ? () => setIsShopDropdownOpen(true) : undefined
            }
          >
            <span className="font-medium text-sm">{item.label}</span>
            {item.dropdown && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  isShopDropdownOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </Link>

          {item.dropdown && isShopDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-[520px] bg-white rounded-xl shadow-xl border border-gray-200/60 z-50 overflow-hidden animate-fadeIn"
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <div className="p-6">
                {/* Minimal Header */}
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-black">
                    Categories
                  </h3>
                </div>

                {/* Clean Grid Layout */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        navigate(`/shop?category=${category}`);
                        setIsShopDropdownOpen(false);
                      }}
                      className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <span className="font-medium text-sm text-black">
                        {category}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      />
                    </button>
                  ))}
                </div>

                {/* Minimal Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <Link
                    to="/shop"
                    onClick={() => setIsShopDropdownOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-[#8DC53E] text-white py-2.5 px-4 rounded-lg hover:bg-[#7db434] transition-all duration-200 text-sm font-medium"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  const ActionButtons = () => (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsSearchModalOpen(true)}
        className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
          isHome && !isScrolled
            ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            : "bg-gray-50 hover:bg-[#8DC53E] hover:text-white text-gray-600"
        }`}
        title="Search (Ctrl+K)"
      >
        <Search size={20} />
      </button>

      <Link to="/cart">
        <div
          className={`relative p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
            isHome && !isScrolled
              ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              : "bg-gray-50 hover:bg-[#8DC53E] hover:text-white text-gray-600"
          }`}
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
              {cartItemCount}
            </span>
          )}
        </div>
      </Link>

      {isAuthenticated ? (
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={toggleProfileMenu}
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
              isHome && !isScrolled
                ? "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                : "bg-gray-50 hover:bg-[#8DC53E] hover:text-white"
            }`}
          >
            <ProfileAvatar />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 bg-gradient-to-r from-[#8DC53E]/5 to-[#7db434]/5 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <ProfileAvatar size="w-12 h-12" textSize="text-base" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {[
                  { icon: User, label: "Profile", path: "/userProfile" },
                  { icon: Package, label: "My Orders", path: "/orders" },
                  { icon: Settings, label: "Settings", path: "/settings" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleProfileMenuClick(item.path)}
                    className="flex items-center w-full px-3 py-2.5 rounded-lg text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                  >
                    <item.icon size={18} className="mr-3" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}

                <hr className="my-2 border-gray-100" />

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group"
                >
                  <LogOut size={18} className="mr-3" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link to="/register">
          <button className="bg-gradient-to-r from-[#8DC53E] to-[#7db434] text-white px-8 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm hover:scale-105 cursor-pointer">
            Register Now
          </button>
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Fixed Header with proper z-index */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
          isHome
            ? isScrolled
              ? "bg-white/95 backdrop-blur-xl shadow-lg top-0"
              : "bg-transparent top-14"
            : "bg-white/95 backdrop-blur-xl shadow-lg top-0"
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="max-w-8xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img
                    src="/TGO-Logo.png"
                    alt="The Great Outdoor"
                    className="h-12 w-auto transition-all duration-300 group-hover:scale-105"
                  />
                </div>
                {(!isHome || isScrolled) && (
                  <div className="h-6 w-px bg-gray-200"></div>
                )}
              </Link>

              {/* Navigation */}
              <DesktopNav />

              {/* Action Buttons */}
              <ActionButtons />
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <div
            className={`px-4 py-3 transition-all duration-300 ${
              isHome && !isScrolled ? "" : "bg-white/95 backdrop-blur-xl"
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <img
                  src="/TGO-Logo.png"
                  alt="The Great Outdoor"
                  className="h-10 w-auto"
                />
              </Link>

              {/* Mobile Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isHome && !isScrolled
                      ? "text-white bg-white/10 backdrop-blur-sm"
                      : "text-gray-600 bg-gray-50"
                  }`}
                >
                  <Search size={20} />
                </button>

                <Link to="/cart">
                  <div
                    className={`relative p-2 rounded-xl transition-all duration-300 ${
                      isHome && !isScrolled
                        ? "text-white bg-white/10 backdrop-blur-sm"
                        : "text-gray-600 bg-gray-50"
                    }`}
                  >
                    <ShoppingCart size={20} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </Link>

                <button
                  onClick={toggleMenu}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isHome && !isScrolled
                      ? "text-white bg-white/10 backdrop-blur-sm"
                      : "text-gray-600 bg-gray-50"
                  }`}
                >
                  <Menu size={20} />
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            {isMobileSearchOpen && (
              <div ref={mobileSearchRef} className="mt-3 animate-fadeIn">
                <form onSubmit={handleMobileSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search adventure gear..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent text-sm"
                    autoFocus
                  />
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu with higher z-index */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={toggleMenu}
          />
          <div className="absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
            {/* Mobile menu content */}
            <div className="sticky top-0 bg-gradient-to-r from-[#8DC53E] to-[#7db434] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={toggleMenu}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <ProfileAvatar size="w-12 h-12" textSize="text-base" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-white/80 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-white/90 mb-3">
                    Welcome to The Great Outdoor
                  </p>
                  <div className="flex gap-2">
                    <Link to="/login" onClick={toggleMenu} className="flex-1">
                      <button className="w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-all duration-200 text-sm font-medium">
                        Login
                      </button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={toggleMenu}
                      className="flex-1"
                    >
                      <button className="w-full bg-white text-[#8DC53E] py-2 rounded-lg hover:bg-white/90 transition-all duration-200 text-sm font-medium">
                        Register
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <nav className="p-4 space-y-1">
              {[
                { icon: Home, label: "Home", path: "/" },
                { icon: Store, label: "Shop", path: "/shop" },
                { icon: Info, label: "About", path: "/aboutUs" },
                { icon: Mail, label: "Contact", path: "/contactus" },
                { icon: Calendar, label: "Events", path: "/events" },
                ...(isAdmin
                  ? [{ icon: Shield, label: "Admin", path: "/AdminDashboard" }]
                  : []),
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleMenu}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#8DC53E]/10 hover:text-[#8DC53E] transition-all duration-200 group"
                >
                  <item.icon size={20} className="text-[#8DC53E]" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Dynamic spacer that accounts for both TopBar and Header */}
      <div
        className={`transition-all duration-500 ${
          isHome && !isScrolled ? "h-32" : "h-20"
        }`}
      />

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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
