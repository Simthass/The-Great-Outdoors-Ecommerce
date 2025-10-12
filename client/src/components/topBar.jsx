import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const TopBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop & Tablet View */}
      <div
        className={`hidden md:block transition-all duration-500 fixed top-0 left-0 right-0 z-30 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100"
            : "bg-gradient-to-r from-[#8DC53E]/80 to-[#7db434]/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-8xl mx-auto px-6 lg:px-8 py-4 relative">
          <div className="flex items-center justify-between">
            {/* Left Section - Contact Info */}
            <div className="flex items-center space-x-8">
              <a
                href="mailto:Tgo@tgolk.com"
                className={`flex items-center space-x-2 transition-all duration-300 hover:scale-105 group ${
                  isScrolled
                    ? "text-gray-700 hover:text-[#8DC53E]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg backdrop-blur-sm ${
                    isScrolled ? "bg-[#8DC53E]/10" : "bg-white/20"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Tgo@tgolk.com</span>
              </a>

              <a
                href="tel:+94764078448"
                className={`lg:flex items-center space-x-2 transition-all duration-300 hover:scale-105 group hidden ${
                  isScrolled
                    ? "text-gray-700 hover:text-[#8DC53E]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg backdrop-blur-sm ${
                    isScrolled ? "bg-[#8DC53E]/10" : "bg-white/20"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">+94 764078448</span>
              </a>
            </div>

            {/* Center Section - Promo Text */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div
                className={`flex items-center space-x-2 px-4 py-1.5 text-white`}
              >
                <span className="text-lg">🎉</span>
                <p className="text-sm font-semibold whitespace-nowrap">
                  Free Shipping Over Rs. 5000!
                </p>
              </div>
            </div>

            {/* Right Section - WhatsApp */}
            <a
              href="https://wa.link/soj1pk"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-2 transition-all duration-300 hover:scale-105 group ${
                isScrolled
                  ? "text-gray-700 hover:text-[#8DC53E]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg backdrop-blur-sm ${
                  isScrolled ? "bg-[#8DC53E]/10" : "bg-white/20"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.55-3.7 8.25-8.25 8.25c-1.43 0-2.8-.36-4.04-1.05l-.3-.15l-3.12.82l.83-3.04l-.2-.32a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18c.21-.58.21-1.07.15-1.18c-.07-.1-.22-.16-.47-.27c-.25-.14-1.46-.72-1.69-.8c-.23-.08-.37-.12-.56.12c-.16.25-.64.8-.78.97c-.14.17-.29.19-.53.07c-.25-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.12-.12.25-.32.37-.47c.12-.15.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.12-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Chat with Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-[#8DC53E]/90 to-[#7db434]/90 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-semibold text-white flex-1">
                Free Shipping Over Rs. 5000!
              </p>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <a
                href="mailto:Tgo@tgolk.com"
                className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>

              <a
                href="https://wa.link/soj1pk"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.55-3.7 8.25-8.25 8.25c-1.43 0-2.8-.36-4.04-1.05l-.3-.15l-3.12.82l.83-3.04l-.2-.32a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18c.21-.58.21-1.07.15-1.18c-.07-.1-.22-.16-.47-.27c-.25-.14-1.46-.72-1.69-.8c-.23-.08-.37-.12-.56.12c-.16.25-.64.8-.78.97c-.14.17-.29.19-.53.07c-.25-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.12-.12.25-.32.37-.47c.12-.15.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.12-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed positioning */}
      <div className="h-16 md:h-14" />
    </>
  );
};

export default TopBar;
