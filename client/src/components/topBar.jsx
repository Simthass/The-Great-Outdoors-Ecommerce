import React from "react";

const TopBar = () => {
  return (
    <div>
      {/* Desktop View (lg+) - Show all elements */}
      <div className="hidden lg:flex items-center justify-between ml-[80px] mr-[77px] py-4 text-white pt-6">
        {/* Left Section */}
        <div className="flex items-center space-x-10 justify-center">
          <a
            href="mailto:Tgo@tgolk.com"
            className="flex items-center hover:underline"
          >
            <img src="/email.svg" alt="Email" className="mr-2" />
            <span className="text-base">Tgo@tgolk.com</span>
          </a>
          <a
            href="tel:+94764078448"
            className="flex items-center hover:underline"
          >
            <img src="/phone.svg" alt="Phone" className="mr-2" />
            <span className="text-base">+94 764078448</span>
          </a>
        </div>

        {/* Center Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 ">
          <p className="text-base whitespace-nowrap">
            🎉 Free Standard Shipping for Orders Over Rs. 5000!
          </p>
        </div>

        {/* Right Section */}
        <a
          href="https://wa.link/soj1pk"
          target="_blank"
          className="flex items-center hover:underline"
        >
          <img src="/chat.svg" alt="Chat" className="mr-2" />
          <span className="text-base">Chat with Us</span>
        </a>
      </div>

      {/* Tablet View (md) - Hide phone number */}
      <div className="hidden md:flex lg:hidden items-center justify-between ml-[40px] mr-[40px] py-4 text-white ">
        <div className="flex items-center justify-center">
          <a
            href="mailto:Tgo@tgolk.com"
            className="flex items-center hover:underline mr-8"
          >
            <img src="/email.svg" alt="Email" className="mr-2" />
            <span className="text-base">Tgo@tgolk.com</span>
          </a>
        </div>

        <p className="text-base font-medium">
          🎉 Free Standard Shipping for Orders Over Rs. 5000!
        </p>

        <a
          href="https://wa.link/soj1pk"
          target="_blank"
          className="flex items-center hover:underline"
        >
          <img src="/chat.svg" alt="Chat" className="mr-2" />
          <span className="text-base">Chat with Us</span>
        </a>
      </div>

      {/* Mobile View (sm) - Only shipping text */}
      <div className="md:hidden text-center py-4 text-white">
        <p className="text-base font-medium">
          🎉 Free Standard Shipping for Orders Over Rs. 5000!
        </p>
      </div>

      <hr className="border-t border-gray-300 mt-3 mb-2" />
    </div>
  );
};

export default TopBar;
