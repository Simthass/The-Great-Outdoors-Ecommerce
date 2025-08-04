import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isHome = location.pathname === "/";
  const linkColor = isHome ? "text-[#ffffff]" : "text-[#111111]";

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileMenuOpen(false);
  };

  const ProfileMenu = () => (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={toggleProfileMenu}
        className={`${linkColor} hover:text-[#8DC53E] transition-colors duration-200 p-2 rounded-full`}
      >
        <User size={24} />
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-3 z-50 border border-gray-100">
          <Link
            to="/profile"
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
            to="/help"
            className="flex items-center px-6 py-4 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <HelpCircle size={20} className="mr-4 text-gray-500" />
            <span>Help center</span>
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
            className="bg-[#8DC53E] text-[#ffffff] font-semibold hover:bg-[#7AB32E] transition-colors duration-200 border-none"
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
        className="bg-[#8DC53E] text-[#ffffff] flex items-center justify-center hover:bg-[#7AB32E] transition-colors duration-200 border-none"
        style={{
          height: "45px",
          width: "50px",
          borderRadius: "5px",
          fontSize: "16px",
        }}
      >
        <Search size={20} />
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
            <li className="ml-[100px]">
              <Link
                to="/"
                className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
              >
                Home
              </Link>
            </li>
            <div className="flex items-center">
              <li>
                <Link
                  to="/shop"
                  className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline mr-[5px]`}
                >
                  Shop
                </Link>
              </li>
              <img
                src="/dropdown-arrow.svg"
                alt="Dropdown"
                height={7}
                width={12}
                className="mt-[3px]"
              />
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
                to="/contact"
                className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
              >
                Contact Us
              </Link>
            </li>
            <li className="mr-[100px]">
              <Link
                to="/events"
                className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
              >
                Events
              </Link>
            </li>
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
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-gray-800 font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
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
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <Link
                    to="/shop"
                    onClick={toggleMenu}
                    className="text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium"
                  >
                    Shop
                  </Link>
                  <img
                    src="/dropdown-arrow.svg"
                    alt="Dropdown"
                    height={7}
                    width={12}
                    className="ml-2"
                  />
                </div>
                <Link
                  to="/aboutUs"
                  onClick={toggleMenu}
                  className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={toggleMenu}
                  className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                >
                  Contact Us
                </Link>
                <Link
                  to="/events"
                  onClick={toggleMenu}
                  className="block text-gray-800 hover:text-[#8DC53E] transition-colors duration-200 text-base font-medium py-2 border-b border-gray-100"
                >
                  Events
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      to="/profile"
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
                        className="w-full bg-[#8DC53E] text-[#ffffff] font-semibold hover:bg-[#7AB32E] transition-colors duration-200 border-none mb-3"
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

                <button
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
  );
};

export default Header;
