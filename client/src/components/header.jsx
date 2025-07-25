import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const linkColor = isHome ? "text-[#ffffff]" : "text-black";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`w-full bg-cover bg-center bg-no-repeat bg-fixed ${
        !isHome ? "mb-[20px]" : ""
      }`}
    >
      {/* Large Desktop View (1400px+) */}
      <div className="hidden 2xl:flex flex-wrap items-center justify-between mt-[-20px]">
        {/* Logo */}
        <div className="flex items-center space-x-2 ml-[70px] mt-[20px]">
          <Link to="/">
            <img src="/TGO-Logo.png" alt="Logo" className="w-32 h-16" />
          </Link>
        </div>

        {/* Navigation */}
        {/* Navigation */}
        <nav className="hidden xl:flex items-center justify-center text-base mt-[40px]">
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

        {/* Right Buttons */}
        <div className="flex items-center gap-x-[40px] mr-[75px] mt-[40px]">
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
          {/* All cart icon instances should be updated with this logic */}
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
                style={{ filter: isHome ? "none" : "brightness(0)" }}
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Desktop View (1200px-1399px) - Hide right buttons first */}
      <div className="hidden xl:flex 2xl:hidden flex-wrap items-center justify-between mt-[-20px]">
        {/* Logo */}
        <div className="flex items-center space-x-2 ml-[50px] mt-[20px]">
          <Link to="/">
            <img src="/TGO-Logo.png" alt="Logo" className="w-32 h-16" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center justify-center text-base mt-[40px]">
          <ul className="flex items-center justify-center gap-[40px] w-full list-none">
            <li className="ml-[80px]">
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
            <li className="mr-[80px]">
              <Link
                to="/events"
                className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
              >
                Events
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Section - Cart & Hamburger */}
        <div className="flex items-center gap-4 mr-[50px] mt-[40px]">
          <Link to="/cart">
            <div
              className={`${linkColor} hover:text-[#8DC53E] transition-colors duration-200`}
            >
              <img src="/cart.svg" alt="Cart icon" className="w-7 h-7" />
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            className={`${linkColor} hover:text-[#8DC53E] transition-all duration-300 p-2 rounded-lg hover:bg-white/10`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Tablet View (768px-1199px) - Hide more navigation items */}
      <div className="hidden md:flex xl:hidden items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img src="/TGO-Logo.png" alt="Logo" className="w-28 h-14" />
          </Link>
        </div>

        {/* Limited Navigation */}
        <nav className="hidden sm:flex items-center text-base">
          <ul className="flex items-center gap-6 list-none">
            <li>
              <Link
                to="/"
                className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className={`${linkColor} hover:font-bold hover:underline transition-all duration-200 no-underline`}
              >
                Shop
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Section - Cart & Hamburger */}
        <div className="flex items-center gap-4">
          <Link to="/cart">
            <div
              className={`${linkColor} hover:text-[#8DC53E] transition-colors duration-200`}
            >
              <img src="/cart.svg" alt="Cart icon" className="w-7 h-7" />
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            className={`${linkColor} hover:text-[#8DC53E] transition-all duration-300 p-2 rounded-lg hover:bg-white/10`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile View (below 768px) */}
      <div className="md:hidden flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img
              src="/TGO-Logo.png"
              alt="Logo"
              className="w-24 h-12 sm:w-28 sm:h-14"
            />
          </Link>
        </div>

        {/* Right Section - Cart & Hamburger */}
        <div className="flex items-center gap-4">
          <Link to="/cart">
            <div
              className={`${linkColor} hover:text-[#8DC53E] transition-colors duration-200`}
            >
              <img
                src="/cart.svg"
                alt="Cart icon"
                className="w-6 h-6 sm:w-7 sm:h-7"
              />
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            className={`${linkColor} hover:text-[#8DC53E] transition-all duration-300 p-2 rounded-lg hover:bg-white/10`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="2xl:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col p-6 space-y-6">
              {/* Navigation Links */}
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
              </nav>

              {/* Action Buttons with improved spacing */}
              <div className="space-y-6 pt-6">
                <Link to="/register" onClick={toggleMenu}>
                  <button
                    className="w-full bg-[#8DC53E] text-[#ffffff] font-semibold hover:bg-[#7AB32E] transition-colors duration-200 border-none mb-3"
                    style={{
                      height: "45px",
                      borderRadius: "5px",
                      fontSize: "16px",
                    }}
                  >
                    Register Now
                  </button>
                </Link>

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
