import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Package,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import SearchModal from "./SearchModal"; // Import the SearchModal

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // Add search modal state
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [imageLoading, setImageLoading] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isHome = location.pathname === "/";
  const linkColor = isHome ? "text-[#ffffff]" : "text-[#111111]";

  // Check if user is admin
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

  // Fetch user profile image when component mounts or user changes
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (isAuthenticated && user) {
        try {
          setImageLoading(true);
          const token = localStorage.getItem("token");
          const response = await fetch("/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.profileImage) {
              // Construct the full image URL
              const imageUrl = data.data.profileImage.startsWith("http")
                ? data.data.profileImage
                : `http://localhost:5000${data.data.profileImage}`;
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
        } finally {
          setImageLoading(false);
        }
      } else {
        setProfileImage("/default-profile.jpg");
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
      // Escape to close search modal
      if (event.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

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
    setProfileImage("/default-profile.jpg"); // Reset to default on logout
    navigate("/");
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
    console.log("Profile image failed to load, falling back to initials");
    e.target.style.display = "none";
    e.target.nextElementSibling.style.display = "flex";
  };

  const ProfileMenu = () => (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={toggleProfileMenu}
        className={`${linkColor} hover:text-[#8DC53E] transition-colors duration-200 p-2 rounded-full`}
      >
        {isAuthenticated && (user?.firstName || user?.lastName) ? (
          <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden">
            {imageLoading ? (
              <div className="bg-gray-300 animate-pulse rounded-full w-full h-full flex items-center justify-center">
                <User size={24} className="text-gray-500" />
              </div>
            ) : (
              <>
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover cursor-pointer rounded-full border-2 border-white"
                  onError={handleImageError}
                  style={{ display: "block" }}
                />
                <div
                  className="bg-[#8DC53E] rounded-full w-full h-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer absolute top-0 left-0"
                  style={{ display: "none" }}
                >
                  {getUserInitials()}
                </div>
              </>
            )}
          </div>
        ) : (
          <User size={24} />
        )}
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
            to="/usersettings"
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

  const AuthButtons = ({ className = "" }) => (
    <div className={`flex items-center gap-x-[40px] ${className}`}>
      {isAuthenticated ? (
        <ProfileMenu />
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

      {/* Updated Search Button */}
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
        {/* Search tooltip */}
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
        {/* Large Desktop View (1400px+) */}
        <div className="hidden 2xl:flex flex-wrap items-center justify-between mt-[-20px]">
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

                  {/* Categories Dropdown */}
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
              {/* Admin Menu - Only show when user is admin */}
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

          <AuthButtons className="mr-[75px] mt-[40px]" />
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="xl:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={toggleMenu}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col p-6 space-y-6">
                {isAuthenticated && (
                  <div className="pb-4 border-b border-gray-200 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {imageLoading ? (
                        <div className="bg-gray-300 animate-pulse rounded-full w-full h-full flex items-center justify-center">
                          <User size={16} className="text-gray-500" />
                        </div>
                      ) : (
                        <>
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                            style={{ display: "block" }}
                          />
                          <div
                            className="bg-[#8DC53E] rounded-full w-full h-full flex items-center justify-center text-white font-semibold text-xs"
                            style={{ display: "none" }}
                          >
                            {getUserInitials()}
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-gray-500 text-sm">{user?.email}</p>
                    </div>
                  </div>
                )}

                <nav className="space-y-4">
                  <Link
                    to="/"
                    onClick={toggleMenu}
                    className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                  >
                    Home
                  </Link>
                  <div className="py-2 border-b border-gray-100">
                    <button
                      onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                      className="w-full flex items-center justify-between text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium"
                    >
                      <span>Shop</span>
                      <img
                        src="/dropdown-arrow.svg"
                        alt="Dropdown"
                        height={7}
                        width={12}
                        className={`transition-transform duration-200 ${
                          isShopDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isShopDropdownOpen && (
                      <div className="mt-2 pl-4 space-y-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              navigate(`/shop?category=${category}`);
                              setIsShopDropdownOpen(false);
                              toggleMenu();
                            }}
                            className="block w-full text-left py-2 text-sm text-gray-600 hover:text-[#8DC53E] transition-colors duration-200 border-l-2 border-transparent hover:border-[#8DC53E] pl-3"
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
                          className="block w-full text-left py-2 text-sm text-[#8DC53E] font-medium border-l-2 border-[#8DC53E] pl-3"
                        >
                          View All Products
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/aboutUs"
                    onClick={toggleMenu}
                    className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contactus"
                    onClick={toggleMenu}
                    className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/Events"
                    onClick={toggleMenu}
                    className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                  >
                    Events
                  </Link>

                  {/* Admin menu item in mobile */}
                  {isAdmin && (
                    <Link
                      to="/AdminDashboard"
                      onClick={toggleMenu}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100 gap-2"
                    >
                      <Shield size={18} className="text-blue-500" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {isAuthenticated && (
                    <>
                      <Link
                        to="/userProfile"
                        onClick={toggleMenu}
                        className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={toggleMenu}
                        className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                      >
                        My Orders
                      </Link>
                    </>
                  )}
                </nav>

                <div className="space-y-6 pt-6">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/register" onClick={toggleMenu}>
                        <button
                          className="w-full bg-[#8DC53E] text-[#ffffff] font-semibold hover:bg-[#7AB32E] transition-colors duration-200 border-none mb-3 cursor-pointer"
                          style={{
                            height: "45px",
                            borderRadius: "5px",
                            borderBottomRightRadius: "25px",
                            fontSize: "16px",
                          }}
                        >
                          Register Now
                        </button>
                      </Link>
                      <Link to="/login" onClick={toggleMenu}>
                        <button
                          className="w-full bg-[#8DC53E] text-[#ffffff] font-semibold hover:bg-[#7AB32E] transition-colors duration-200 border-none mb-3"
                          style={{
                            height: "45px",
                            borderRadius: "5px",
                            fontSize: "16px",
                          }}
                        >
                          Login
                        </button>
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      className="w-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-200 border-none"
                      style={{
                        height: "45px",
                        borderRadius: "5px",
                        fontSize: "16px",
                      }}
                    >
                      Logout
                    </button>
                  )}

                  {/* Mobile Search Button */}
                  <button
                    onClick={() => {
                      setIsSearchModalOpen(true);
                      toggleMenu();
                    }}
                    className="w-full bg-[#8DC53E] text-[#ffffff] flex items-center justify-center hover:bg-[#7AB32E] transition-colors duration-200 border-none gap-2"
                    style={{
                      height: "45px",
                      borderRadius: "5px",
                      fontSize: "16px",
                    }}
                  >
                    <Search size={20} />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};

export default Header;
