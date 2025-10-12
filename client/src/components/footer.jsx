import React from "react";
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="text-center">
            <img
              src="/TGO-Logo.png"
              alt="The Great Outdoor"
              className="w-32 h-auto mx-auto mb-4"
            />
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Premium outdoor gear and adventure equipment for every explorer
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Category Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#8DC53E] inline-block">
              CATEGORIES
            </h3>
            <ul className="space-y-3">
              {[
                "Hiking & Trekking",
                "Fishing",
                "Footwear",
                "Camping & Outdoor Living",
                "Shooting & Archery",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#8DC53E] transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Brands Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#8DC53E] inline-block">
              TOP BRANDS
            </h3>
            <ul className="space-y-3">
              {[
                "Flint and Tinder",
                "Proof",
                "Relwen",
                "Wellen",
                "Taylor Stitch",
              ].map((brand) => (
                <li key={brand}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#8DC53E] transition-colors duration-200 text-sm"
                  >
                    {brand}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#8DC53E] inline-block">
              ACCOUNT
            </h3>
            <ul className="space-y-3">
              {[
                "Sign In",
                "Sign Up",
                "My Account",
                "About Us",
                "Privacy Policy",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#8DC53E] transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#8DC53E] inline-block">
              CONTACT US
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="text-[#8DC53E] mt-0.5 flex-shrink-0"
                />
                <p className="text-gray-600 text-sm">
                  35T, 1st Floor, Liberty Plaza, Colombo-03
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#8DC53E] flex-shrink-0" />
                <p className="text-gray-600 text-sm">+94 764078448</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#8DC53E] flex-shrink-0" />
                <p className="text-gray-600 text-sm">
                  10:00 AM - 7:00 PM (Mon - Sat)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="text-[#8DC53E] mt-0.5 flex-shrink-0"
                />
                <p className="text-gray-600 text-sm break-all">Tgo@tgolk.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 border-t border-gray-200 pt-12">
          {/* Need Help */}
          <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#8DC53E] transition-all duration-300">
            <MessageCircle size={48} className="text-[#8DC53E] mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-600 text-sm mb-6">
              Chat with our customer service team
            </p>
            <a
              href="https://wa.link/soj1pk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#8DC53E] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#7AB32E] transition-all duration-300 transform hover:scale-105 min-w-[140px]"
            >
              CHAT NOW
            </a>
          </div>

          {/* Call Us & Social */}
          <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#8DC53E] transition-all duration-300">
            <Phone size={48} className="text-[#8DC53E] mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-2">Call Us</h4>
            <p className="text-[#8DC53E] font-semibold text-lg mb-2">
              +94 764078448
            </p>
            <p className="text-gray-600 text-sm mb-6">
              We're here to answer your questions
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.facebook.com/tgolk.outfitter/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#8DC53E] rounded-full flex items-center justify-center hover:bg-[#7AB32E] transition-all duration-300 transform hover:scale-110"
              >
                <Facebook size={20} className="text-white" />
              </a>
              <a
                href="https://www.instagram.com/tgo.srilanka/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#8DC53E] rounded-full flex items-center justify-center hover:bg-[#7AB32E] transition-all duration-300 transform hover:scale-110"
              >
                <Instagram size={20} className="text-white" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-12 h-12 bg-[#8DC53E] rounded-full flex items-center justify-center hover:bg-[#7AB32E] transition-all duration-300 transform hover:scale-110"
              >
                <img
                  src="/pintrest.png"
                  alt="Pinterest"
                  className="w-5 h-5 object-cover"
                />
              </a>
            </div>
          </div>

          {/* Store Locator */}
          <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#8DC53E] transition-all duration-300">
            <MapPin size={48} className="text-[#8DC53E] mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Store Locator
            </h4>
            <p className="text-gray-600 text-sm mb-6">
              Find a retail store near you
            </p>
            <button
              onClick={() =>
                window.open(
                  "https://maps.app.goo.gl/xyBXWuyT62Yp9reo9",
                  "_blank"
                )
              }
              className="inline-flex items-center justify-center bg-[#8DC53E] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#7AB32E] transition-all duration-300 transform hover:scale-105 min-w-[140px]"
            >
              FIND STORE
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white text-center text-sm">
            Copyright © 2025 Team Cyber Nexus (SLIIT CITY UNI). All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
