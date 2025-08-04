import React from "react";
import ScrollLink from "./ScrollLink";

const homeHero = () => {
  return (
    <div className="text-center">
      {/* Hero Heading */}
      <h1
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white pt-12 lg:pt-20 mb-5 lg:mb-7"
        style={{
          fontFamily: "Raleway, sans-serif",
        }}
      >
        Gear Up for Your Next
        <br className="hidden sm:block" />
        Adventures Trip
      </h1>

      {/* Hero Description */}
      <p
        className="text-white mb-8 lg:mb-12 px-4 sm:px-0 text-[13px] sm:text-[15px]"
        style={{
          lineHeight: 2,
        }}
      >
        Discover premium outdoor equipment for camping, hiking, and adventure
        sports. From mountain peaks to <br className="hidden sm:block" />
        forest trails, we've got everything you need to explore the great
        outdoors.
      </p>

      {/* Hero Images - Adjusted mobile size */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-0 lg:justify-between lg:ml-[420px] lg:mr-[420px] mb-8 lg:mb-12 px-4 sm:px-0">
        <img
          src="/Home-hero-1.jpg"
          alt="Outdoor gear"
          className="w-[200px] h-[135px] sm:w-[190px] sm:h-[125px] rounded-[30px_10px] border-[3px] border-white"
        />
        <img
          src="/Home-hero-2.jpg"
          alt="Adventure equipment"
          className="w-[200px] h-[135px] sm:w-[190px] sm:h-[125px] rounded-[30px_10px] border-[3px] border-white"
        />
        <img
          src="/Home-hero-3.jpg"
          alt="Camping gear"
          className="w-[200px] h-[135px] sm:w-[190px] sm:h-[125px] rounded-[30px_10px] border-[3px] border-white"
        />
      </div>

      {/* CTA Button */}
      <ScrollLink to="/#hot-this-week">
        <button
          className="bg-[#FFA81D] text-black font-bold font-inherit rounded-[5px] hover:bg-[#E3981F] hover:rounded-[5px] transition-all duration-300 ease-in-out cursor-pointer mb-12"
          style={{
            height: "45px",
            width: "170px",
            borderBottomRightRadius: "25px",
            boxShadow: "none",
            border: "none",
            fontSize: "15px",
          }}
        >
          EXPLORE NOW
        </button>
      </ScrollLink>
    </div>
  );
};

export default homeHero;
