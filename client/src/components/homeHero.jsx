import React from "react";
import ScrollLink from "./ScrollLink";

const HomeHero = () => {
  return (
    <div className="text-center px-4 sm:px-6 lg:px-8">
      {/* Hero Heading */}
      <h1
        className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white pt-8 sm:pt-12 md:pt-16 lg:pt-20 mb-4 sm:mb-5 lg:mb-7 leading-1"
        style={{
          fontFamily: "Raleway, sans-serif",
        }}
      >
        Gear Up for Your Next
        <br className="hidden xs:block" />
        <span className="block xs:inline">Adventures Trip</span>
      </h1>

      {/* Hero Description */}
      <p
        className="text-white mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2 sm:px-4 md:px-8 lg:px-0 text-xs xs:text-sm sm:text-sm md:text-base lg:text-[15px] max-w-4xl mx-auto"
        style={{
          lineHeight: 2,
        }}
      >
        Discover premium outdoor equipment for camping, hiking, and adventure
        sports. From mountain peaks to <br className="hidden sm:block" />
        forest trails, we've got everything you need to explore the great
        outdoors.
      </p>

      {/* Hero Images */}
      <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
        {/* Mobile (<640px) */}
        <div className="flex flex-col items-center gap-4 sm:hidden">
          <img
            src="/Home-hero-1.jpg"
            alt="Outdoor gear"
            className="w-[280px] h-[190px] rounded-[30px_10px] border-[3px] border-white object-cover shadow-lg"
          />
          <div className="flex gap-4">
            <img
              src="/Home-hero-2.jpg"
              alt="Adventure equipment"
              className="w-[135px] h-[90px] rounded-[20px_8px] border-[2px] border-white object-cover shadow-lg"
            />
            <img
              src="/Home-hero-3.jpg"
              alt="Camping gear"
              className="w-[135px] h-[90px] rounded-[20px_8px] border-[2px] border-white object-cover shadow-lg"
            />
          </div>
        </div>

        {/* Tablet Portrait (640px - 767px) */}
        <div className="hidden sm:flex md:hidden flex-wrap justify-center gap-6 px-4">
          <img
            src="/Home-hero-1.jpg"
            alt="Outdoor gear"
            className="w-[180px] h-[120px] rounded-[25px_8px] border-[3px] border-white object-cover shadow-lg"
          />
          <img
            src="/Home-hero-2.jpg"
            alt="Adventure equipment"
            className="w-[180px] h-[120px] rounded-[25px_8px] border-[3px] border-white object-cover shadow-lg"
          />
          <img
            src="/Home-hero-3.jpg"
            alt="Camping gear"
            className="w-[180px] h-[120px] rounded-[25px_8px] border-[3px] border-white object-cover shadow-lg"
          />
        </div>

        {/* Tablet Landscape (768px - 1023px) */}
        <div className="hidden md:flex lg:hidden flex-wrap justify-center gap-8 px-6 max-w-4xl mx-auto">
          <img
            src="/Home-hero-1.jpg"
            alt="Outdoor gear"
            className="w-[220px] h-[140px] rounded-[30px_10px] border-[3px] border-white object-cover shadow-lg"
          />
          <img
            src="/Home-hero-2.jpg"
            alt="Adventure equipment"
            className="w-[220px] h-[140px] rounded-[30px_10px] border-[3px] border-white object-cover shadow-lg"
          />
          <img
            src="/Home-hero-3.jpg"
            alt="Camping gear"
            className="w-[220px] h-[140px] rounded-[30px_10px] border-[3px] border-white object-cover shadow-lg"
          />
        </div>

        {/* Laptop & Desktop (1024px+) */}
        <div className="hidden lg:flex items-center justify-center gap-10 xl:gap-14">
          <img
            src="/Home-hero-1.jpg"
            alt="Outdoor gear"
            className="w-[200px] h-[130px] rounded-[30px_10px] border-[3px] border-white object-cover"
          />
          <img
            src="/Home-hero-2.jpg"
            alt="Adventure equipment"
            className="w-[200px] h-[130px] rounded-[30px_10px] border-[3px] border-white object-cover"
          />
          <img
            src="/Home-hero-3.jpg"
            alt="Camping gear"
            className="w-[200px] h-[130px] rounded-[30px_10px] border-[3px] border-white object-cover"
          />
        </div>
      </div>

      {/* CTA Button */}
      <ScrollLink to="/#hot-this-week">
        <button
          className="bg-[#FFA81D] text-black font-bold rounded-[5px] hover:bg-[#E3981F] transition-all duration-300 ease-in-out cursor-pointer mb-8 sm:mb-10 md:mb-11 lg:mb-12 h-[38px] w-[145px] text-[12px] xs:h-[40px] xs:w-[150px] xs:text-[13px] sm:h-[42px] sm:w-[160px] sm:text-[13px] md:h-[44px] md:w-[165px] md:text-[14px] lg:h-[45px] lg:w-[170px] lg:text-[15px]"
          style={{
            borderBottomRightRadius: "25px",
            boxShadow: "none",
            border: "none",
          }}
        >
          EXPLORE NOW
        </button>
      </ScrollLink>
    </div>
  );
};

export default HomeHero;
