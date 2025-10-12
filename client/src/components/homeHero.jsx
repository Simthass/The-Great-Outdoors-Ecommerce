import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HomeHero = () => {
  const stats = [
    { number: "10K+", label: "Happy Customers", icon: "😊" },
    { number: "500+", label: "Premium Products", icon: "🎒" },
    { number: "4.9/5", label: "Customer Rating", icon: "⭐" },
  ];

  const trendingDestinations = [
    {
      name: "Ella Rock Hike",
      location: "Central Highlands",
      badge: "🔥 Popular",
      difficulty: "Moderate",
    },
    {
      name: "Adam's Peak",
      location: "Ratnapura",
      badge: "🌅 Sunrise",
      difficulty: "Challenging",
    },
    {
      name: "Knuckles Range",
      location: "Matale",
      badge: "🌿 Scenic",
      difficulty: "Moderate",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-[75px] overflow-hidden py-2 scroll-smooth">
      {/* Content Container */}
      <div className="relative w-full max-w-8xl mx-auto my-8 lg:my-5">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Content - Text & CTA */}
          <div className="xl:col-span-7 text-center lg:text-left space-y-8">
            {/* Main Headline */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-7xl font-black text-white leading-tight"
              >
                <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                  Gear Up for Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#8DC53E] to-[#7db434] bg-clip-text text-transparent">
                  Next Adventure
                </span>
                <br />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-lg text-gray-200 leading-relaxed max-w-3xl mx-auto lg:mx-0 font-light"
              >
                Discover premium outdoor equipment for exploring Sri Lanka's
                breathtaking landscapes. From misty mountains to tropical
                forests—experience the pearl of the Indian Ocean with gear
                trusted by local adventurers and travelers.
              </motion.p>
            </div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="text-3xl font-black text-[#8DC53E] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white text-sm font-medium flex items-center gap-2">
                    <span>{stat.icon}</span>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/shop"
                className="group relative bg-gradient-to-r from-[#8DC53E] to-[#7db434] text-white font-bold py-4 px-6 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 min-w-[150px] text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                  Shop Adventure Gear
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300" />
              </Link>

              <button
                className="group bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white font-bold py-3.5 px-8 rounded-2xl hover:border-[#8DC53E] hover:bg-[#8DC53E]/10 transition-all duration-500 transform hover:scale-105 min-w-[180px]"
                onClick={() => (window.location.href = "#hot-this-week")}
              >
                <span className="flex items-center justify-center gap-2 text-base">
                  Explore Now
                  <span className="text-[#8DC53E] group-hover:scale-110 transition-transform duration-300">
                    🏝️
                  </span>
                </span>
              </button>
            </motion.div>
          </div>

          {/* Right Content - Tourism Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="xl:col-span-5 relative"
          >
            {/* Main Destination Card */}
            <div className="relative space-y-6">
              {/* Featured Destination Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-[#8DC53E] text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                        🌄 Must-Visit
                      </div>
                      <h3 className="text-xl font-black text-white mb-1">
                        Horton Plains
                      </h3>
                      <p className="text-gray-300 text-sm">
                        World's End & Baker's Falls
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#8DC53E]">
                        2,100m
                      </div>
                      <div className="text-gray-300 text-xs">Elevation</div>
                    </div>
                  </div>

                  <div className="relative h-48 rounded-xl overflow-hidden border-2 border-white/20">
                    <img
                      src="/horton-plains.jpg" // Change to your Horton Plains image
                      alt="Horton Plains National Park - World's End viewpoint"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Quick Action */}
                    <div className="absolute bottom-3 right-3">
                      <button className="bg-[#8DC53E] text-white p-2 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg">
                        <span className="text-sm">📍</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Trending Destinations Grid */}
              <div className="grid grid-cols-3 gap-3">
                {trendingDestinations.map((destination, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/15 hover:border-[#8DC53E]/40 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#8DC53E] bg-[#8DC53E]/20 px-1 py-0.5 rounded-full">
                        {destination.badge}
                      </span>
                    </div>
                    <div className="text-white font-semibold text-xs mb-1 line-clamp-2">
                      {destination.name}
                    </div>
                    <div className="text-[#8DC53E] font-black text-sm">
                      {destination.location}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {destination.difficulty}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/15"
              >
                <div className="flex items-center gap-2">
                  <div className="flex text-[#8DC53E] text-xs">
                    {"⭐".repeat(5)}
                  </div>
                  <span className="text-white font-bold text-xs">4.9/5</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="text-gray-300 text-xs">
                  Trusted by{" "}
                  <span className="text-[#8DC53E] font-bold">10K+</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
