import React from "react";
const homeHero = () => {
  return (
    <div className="text-center">
      <h1
        className="text-7xl font-black text-white pt-20 mb-7"
        style={{
          fontFamily: "Raleway, sans-serif",
        }}
      >
        Gear Up for Your Next
        <br />
        Adventures Trip
      </h1>
      <p
        className="text-white mb-12"
        style={{
          lineHeight: 2,
          fontSize: 15,
          color: "white",
        }}
      >
        Discover premium outdoor equipment for camping, hiking, and adventure
        sports. From mountain peaks to <br />
        forest trails, we've got everything you need to explore the great
        outdoors.
      </p>
      <div className="flex flex-wrap item-center justify-between ml-[420px] mr-[420px] mb-12">
        <img
          src="/Home-hero-1.jpg"
          alt=""
          style={{
            width: 190,
            height: 125,
            borderRadius: " 30px 10px",
            border: "3px solid white",
          }}
        />
        <img
          src="/Home-hero-2.jpg"
          alt=""
          style={{
            width: 190,
            height: 125,
            borderRadius: " 30px 10px",
            border: "3px solid white",
          }}
        />
        <img
          src="/Home-hero-3.jpg"
          alt=""
          style={{
            width: 190,
            height: 125,
            borderRadius: " 30px 10px",
            border: "3px solid white",
          }}
        />
      </div>
      <button
        className="bg-[#FFA81D] text-black font-bold font-inherit rounded-[5px] hover:bg-[#E3981F] hover:rounded-[5px] transition-all duration-300 ease-in-out cursor-pointer mb-12"
        style={{
          height: "45px",
          width: "170px",
          borderBottomRightRadius: "25px", // starting with big radius on bottom right
          boxShadow: "none",
          border: "none",
          fontSize: "15px",
        }}
      >
        EXPLORE NOW
      </button>
    </div>
  );
};
export default homeHero;
