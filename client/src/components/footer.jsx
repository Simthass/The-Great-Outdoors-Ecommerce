import React from "react";
import { defaultIfEmpty, firstValueFrom } from "rxjs";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mt-10">
        <hr className="w-[637px]" />
        <img src="/TGO-Logo.png" alt="" className="w-[132px] h-[63px]" />
        <hr className="w-[637px]" />
      </div>
      <div className="mr-[120px] ml-[120px] flex flex-wrap justify-between items-center mt-5 mb-5 leading-2">
        <div className="leading-10 text-[16px]">
          <p className="text-[18px] font-bold">CATEGORY</p>
          <p>Hicking & Trekking</p>
          <p>Fishing</p>
          <p>Footwear</p>
          <p>Camping & Outdoor Living</p>
          <p>Shooting & Archery</p>
        </div>
        <div className="leading-10 text-[16px]">
          <p className="text-[18px] font-bold">TOP BRANDS</p>
          <p>Flint and Tinde</p>
          <p>Proof</p>
          <p>Relwen</p>
          <p>Wellen</p>
          <p>Taylor Stitch</p>
        </div>
        <div className="leading-10 text-[16px]">
          <p className="text-[18px]" style={{ fontWeight: "bold" }}>
            ACCOUNT
          </p>
          <p>Sign in</p>
          <p>Sign up</p>
          <p>My Account</p>
          <p>About Us</p>
          <p>Privacy & Policy</p>
        </div>
        <div className="leading-[1.5] text-[16px] flex flex-col justify-center h-full">
          <p className="text-[18px]" style={{ fontWeight: "bold" }}>
            CONTACT US
          </p>
          <div className="leading-12">
            <div className="flex flex-wrap">
              <img src="/home.svg" alt="" className="mr-[15px]" />
              <p>35T, 1st Floor, Liberty Plaza, Colombo-03</p>
            </div>
            <div className="flex flex-wrap items-center mt-2">
              <img src="/Mobile.svg" alt="" className="mr-[15px]" />
              <p>94764078448</p>
            </div>
            <div className="flex flex-wrap items-center mt-2">
              <img src="/time.svg" alt="" className="mr-[15px]" />
              <p>10.00PM - 19.00 (Mon - Sat)</p>
            </div>
            <div className="flex flex-wrap items-center mt-2">
              <img src="/email (2).svg" alt="" className="mr-[15px]" />
              <p>Tgo@tgolk.com</p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <hr className="w-auto mb-[30px] mr-20 ml-20" />
        <div className="flex flex-wrap justify-between items-center mr-[100px] ml-[100px]">
          <div className="flex-1 flex items-center justify-center flex-col border-r leading-10">
            <img
              src="/chat-black.svg"
              alt=""
              className="w-[60px] h-[60px] mb-3"
            />
            <p className="text-[20px]" style={{ fontWeight: "bold" }}>
              Need Help?
            </p>
            <p className="text-[15px] mb-[20px]">
              Chat with one of our customer service reps{" "}
            </p>
            <a
              href="https://wa.link/soj1pk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                className="bg-[#8DC53E] text-white font-semibold hover:bg-[#7AB32E] transition-colors duration-200 cursor-pointer"
                style={{
                  height: "45px",
                  width: "163px",
                  borderRadius: "5px",
                  borderBottomRightRadius: "25px",
                  boxShadow: "none",
                  border: "none",
                  fontSize: "16px",
                  color: "white",
                  fontFamily: "inherit",
                }}
              >
                CHAT NOW
              </button>
            </a>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center leading-10">
            <img src="/Mobile.svg" alt="" className="w-[50px] h-[50px] mb-3" />
            <p className="text-[20px]" style={{ fontWeight: "bold" }}>
              Call us- 94764078448
            </p>
            <p className="text-[15px] mb-[20px]">
              We're here to answer your Questions
            </p>
            <div className="flex flex-wrap items-center justify-between">
              <a
                href="https://www.facebook.com/tgolk.outfitter/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-[42px] h-[42px] rounded-full bg-[#8DC53E] flex flex-wrap items-center justify-center cursor-pointer">
                  <img
                    src="/fb.png"
                    alt="Facebook"
                    className="w-[20px] h-[20px] object-cover"
                  />
                </div>
              </a>

              <a
                href="https://www.instagram.com/tgo.srilanka/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-[42px] h-[42px] rounded-full bg-[#8DC53E] flex flex-wrap items-center justify-center cursor-pointer mr-[40px] ml-[40px]">
                  <img
                    src="/instagram.png"
                    alt="Facebook"
                    className="w-[20px] h-[20px] object-cover"
                  />
                </div>
              </a>
              <div className="w-[42px] h-[42px] rounded-full bg-[#8DC53E] flex flex-wrap items-center justify-center">
                {" "}
                <img
                  src="/pintrest.png"
                  alt=""
                  className="w-[20px] h-[20px] object-cover"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center border-l leading-10">
            <img
              src="/location.svg"
              alt=""
              className="w-[50px] h-[50px] mb-3"
            />
            <p className="text-[20px]" style={{ fontWeight: "bold" }}>
              Store Locator
            </p>
            <p className="text-[15px] mb-[20px]">
              Explore a retail store Outlet near You
            </p>
            <button
              className="bg-[#8DC53E] text-white font-semibold hover:bg-[#7AB32E] transition-colors duration-200 cursor-pointer"
              style={{
                height: "45px",
                width: "163px",
                borderRadius: "5px",
                borderBottomRightRadius: "25px",
                boxShadow: "none",
                border: "none",
                fontSize: "16px",
                color: "white",
                fontFamily: "inherit",
              }}
              onClick={() =>
                window.open(
                  "https://maps.app.goo.gl/xyBXWuyT62Yp9reo9",
                  "_blank"
                )
              }
            >
              FIND STORE
            </button>
          </div>
        </div>
        <hr className="w-auto mr-20 ml-20 mt-[30px] mb-[30px]" />
      </div>
      <div className="w-full h-[30px] bg-[#8DC53E] flex items-center justify-center">
        <p className="text-[14px] text-[#ffffff]">
          Copyright © 2025 Team Cyber Nexus (SLIIT CITY UNI). All Rights
          Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
