import React from "react";

const TopBar = () => {
  return (
    <div>
      <div
        className="max-w-7xl flex flex-wrap items-center justify-between ml-[80px] mr-[77px] pt-[10px]"
        style={{ color: "white" }}
      >
        <div className="flex">
          <a
            href="mailto:Tgo@tgolk.com"
            className="flex flex-wrap items-center justify-between mr-[40px] text-[#ffffff] no-underline hover:underline cursor-pointer"
          >
            <img src="/email.svg" alt="" className="mr-[10px]" />
            <p>Tgo@tgolk.com</p>
          </a>

          <div className="flex flex-wrap items-center justify-between">
            <img src="/phone.svg" alt="" className="mr-[10px]" />
            <a
              href="tel:+94764078448"
              className="text-[#ffffff] no-underline hover:underline"
            >
              +94 764078448
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium ml-[-150px]">
            🎉 Free Standard Shipping for Orders Over Rs. 5000!
          </p>
        </div>
        <a
          href="https://wa.link/soj1pk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-wrap items-center justify-between cursor-pointer no-underline hover:underline text-[#ffffff]"
        >
          <img src="/chat.svg" alt="" className="mr-[10px]" />
          <p className="">Chat with Us</p>
        </a>
      </div>
      <hr
        className="border-0 border-t-1 my-4 w-full"
        style={{ color: "#bfbfbf" }}
      />
    </div>
  );
};

export default TopBar;
