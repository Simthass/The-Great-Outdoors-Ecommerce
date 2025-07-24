import React from "react";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/"; // true if on homepage
  const linkColor = isHome ? "text-[#ffffff]" : "text-[#111111]";

  return (
    <header
      className={`w-full bg-cover bg-center bg-no-repeat bg-fixed ${
        !isHome ? "mb-[20px]" : ""
      }`}
    >
      <div className=" flex flex-wrap items-center justify-between mt-[-20px]">
        {/* Logo */}
        <div className="flex items-center space-x-2 ml-[70px] mt-[20px]">
          <Link to="/">
            <img src="/TGO-Logo.png" alt="Logo" className="w-32 h-16" />
          </Link>
        </div>

        {/* Navigation */}
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
                className={`${linkColor}  hover:font-bold hover:underline transition-all duration-200 no-underline`}
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

          <Link to="/cart">
            <div
              className={`${linkColor} hover:text-[#8DC53E] transition-colors duration-200`}
            >
              <img src="/cart.svg" alt="Cart icon" className="w-7 h-7" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
