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
    <footer className="bg-white border-t border-gray-100 pt-20">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-[75px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <img
              src="/TGO-Logo.png"
              alt="The Great Outdoor"
              className="w-40 h-auto"
            />
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed font-medium">
              Premium outdoor gear and adventure equipment for every explorer.
              Designed for the wild, built for reliability.
            </p>
            <div className="flex gap-4 pt-4">
              <a
                href="#"
                className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center hover:bg-[#8DC53E] hover:text-white text-gray-600 transition-colors duration-300"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center hover:bg-[#8DC53E] hover:text-white text-gray-600 transition-colors duration-300"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-4">
              {[
                "Hiking & Trekking",
                "Fishing",
                "Footwear",
                "Camping & Outdoor",
                "Shooting & Archery",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-[#8DC53E] transition-colors duration-200 text-sm font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-4">
              {[
                "My Account",
                "Order Tracking",
                "Wishlist",
                "Privacy Policy",
                "Terms of Service",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-[#8DC53E] transition-colors duration-200 text-sm font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">
              Contact Info
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-[#8DC53E]">
                  <MapPin size={18} />
                </div>
                <p className="text-gray-500 text-sm font-medium pt-2">
                  35T, 1st Floor, Liberty Plaza, Colombo-03
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-[#8DC53E]">
                  <Phone size={18} />
                </div>
                <p className="text-gray-500 text-sm font-medium pt-2">
                  +94 764078448
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-[#8DC53E]">
                  <Mail size={18} />
                </div>
                <p className="text-gray-500 text-sm font-medium pt-2">
                  Tgo@tgolk.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
          <div className="bg-gray-50 rounded-[2rem] p-8 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Need Support?
              </h4>
              <p className="text-gray-500 text-sm font-medium">
                Chat with our team on WhatsApp
              </p>
            </div>
            <a
              href="https://wa.link/soj1pk"
              className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 text-[#8DC53E]"
            >
              <MessageCircle size={24} />
            </a>
          </div>
          <div className="bg-[#8DC53E]/10 rounded-[2rem] p-8 flex items-center justify-between group cursor-pointer hover:bg-[#8DC53E]/20 transition-colors">
            <div>
              <h4 className="text-xl font-bold text-[#7ab535] mb-2">
                Find a Store
              </h4>
              <p className="text-[#8DC53E] text-sm font-medium">
                Visit us at our retail locations
              </p>
            </div>
            <button className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 text-[#8DC53E]">
              <MapPin size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="bg-gray-900 py-3">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-[75px] flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm font-medium">
            Copyright © 2026{" "}
            <span className="font-bold">Brand Systems Studio</span>. All Rights
            Reserved. All Rights Reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
