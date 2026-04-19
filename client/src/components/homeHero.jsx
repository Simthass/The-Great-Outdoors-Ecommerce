import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, Package, Star } from "lucide-react";

const HomeHero = () => {
  const stats = [
    { number: "10K+", label: "Happy Customers", icon: Users },
    { number: "500+", label: "Premium Products", icon: Package },
    { number: "4.9/5", label: "Customer Rating", icon: Star },
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

  const ease = [0.33, 1, 0.68, 1];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        paddingLeft: "75px",
        paddingRight: "75px",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');
 
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes hero-float-b {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(141,197,62,0.35); }
          50%       { box-shadow: 0 0 0 10px rgba(141,197,62,0); }
        }
        @keyframes stat-in {
          from { opacity: 0; transform: translateY(20px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes ping-green {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
 
        .hero-float  { animation: hero-float  5s ease-in-out infinite; }
        .hero-float-b { animation: hero-float-b 6s ease-in-out infinite; animation-delay: -3s; }
        .badge-glow  { animation: badge-glow  3s ease-in-out infinite; }
 
        .stat-in-1 { animation: stat-in 0.6s 0.9s ease-out both; }
        .stat-in-2 { animation: stat-in 0.6s 1.05s ease-out both; }
        .stat-in-3 { animation: stat-in 0.6s 1.2s ease-out both; }
 
        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -0.03em;
        }
 
        .glass {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .glass-hover:hover {
          background: rgba(255,255,255,0.11);
          border-color: rgba(141,197,62,0.4);
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(141,197,62,0.15);
        }
        .cta-main {
          background: linear-gradient(135deg, #8DC53E 0%, #5a9e1a 100%);
          box-shadow: 0 4px 28px rgba(141,197,62,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 0.35s cubic-bezier(0.34,1.5,0.64,1);
        }
        .cta-main:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 40px rgba(141,197,62,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .cta-ghost {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.16);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        .cta-ghost:hover {
          background: rgba(255,255,255,0.13);
          border-color: rgba(141,197,62,0.45);
          transform: translateY(-2px);
        }
        .dest-card {
          transition: all 0.3s cubic-bezier(0.34,1.2,0.64,1);
        }
        .dest-card:hover {
          transform: translateY(-6px) scale(1.03);
        }
        .scroll-hint {
          animation: hero-float-b 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative w-full max-w-[1920px] mx-auto z-10">
        <div className="grid lg:grid-cols-2 xl:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* ═══ LEFT — Main content ═══ */}
          <div className="xl:col-span-7 text-center lg:text-left">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="flex justify-center lg:justify-start mb-7"
            >
              <div
                className="badge-glow inline-flex items-center gap-2.5 rounded-full px-5 py-2 border"
                style={{
                  background: "rgba(141,197,62,0.1)",
                  borderColor: "rgba(141,197,62,0.25)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-[ping-green_1.5s_ease-in-out_infinite] absolute inline-flex h-full w-full rounded-full bg-[#8DC53E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8DC53E]" />
                </span>
                <span className="text-[#8DC53E] text-[10px] font-black uppercase tracking-[0.22em]">
                  Sri Lanka's #1 Outdoor Outfitter
                </span>
              </div>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease }}
              className="hero-title mb-7"
              style={{ fontSize: "clamp(3.4rem, 6.5vw, 6.2rem)" }}
            >
              <span className="block text-white mb-1">Gear Up for</span>
              <span
                className="block mb-1"
                style={{
                  background:
                    "linear-gradient(135deg, #8DC53E 0%, #c8f058 60%, #8DC53E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Your Next
              </span>
              <span className="block text-white">Adventure.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.4, ease }}
              className="text-base lg:text-lg text-white/55 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light mb-10"
            >
              Premium outdoor equipment for exploring Sri Lanka's breathtaking
              landscapes. From misty peaks to tropical forests — trusted by
              local adventurers since day one.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease }}
              className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mb-12"
            >
              <Link to="/shop">
                <button className="cta-main group text-white font-black text-[11px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 w-full sm:w-auto">
                  Shop Adventure Gear
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </button>
              </Link>
              <button
                className="cta-ghost text-white/75 font-black text-[11px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl w-full sm:w-auto"
                onClick={() =>
                  document
                    .getElementById("hot-this-week")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Collections
              </button>
            </motion.div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 lg:gap-10">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className={`text-center lg:text-left stat-in-${i + 1}`}
                >
                  <p
                    className="font-black text-white leading-none mb-1.5"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    }}
                  >
                    {stat.number}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ RIGHT — Cards Showcase ═══ */}
          <motion.div
            className="xl:col-span-5 flex flex-col gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease }}
          >
            {/* FEATURED DESTINATION CARD */}
            <div className="glass rounded-3xl p-5 hero-float">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-2.5"
                    style={{
                      background: "linear-gradient(135deg, #8DC53E, #5a9e1a)",
                    }}
                  >
                    🌄 Featured Destination
                  </span>
                  <h3
                    className="text-xl font-black text-white mb-0.5"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Horton Plains
                  </h3>
                  <p className="text-white/45 text-xs font-medium">
                    World's End & Baker's Falls
                  </p>
                </div>
                <div
                  className="text-right px-4 py-3 rounded-2xl border"
                  style={{
                    background: "rgba(141,197,62,0.1)",
                    borderColor: "rgba(141,197,62,0.2)",
                  }}
                >
                  <p
                    className="font-black text-[#8DC53E] text-2xl leading-none"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    2,100m
                  </p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                    Elevation
                  </p>
                </div>
              </div>
              <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src="/horton-plains.jpg"
                  alt="Horton Plains"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
                  }}
                />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className="text-amber-400 text-xs">
                          ★
                        </span>
                      ))}
                    <span className="text-white text-[11px] font-bold ml-1">
                      4.9
                    </span>
                  </div>
                  <button
                    className="text-[10px] font-black text-white px-3.5 py-1.5 rounded-full uppercase tracking-wider hover:opacity-90 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #8DC53E, #5a9e1a)",
                    }}
                  >
                    View Gear
                  </button>
                </div>
              </div>
            </div>

            {/* TRENDING DESTINATIONS */}
            <div className="grid grid-cols-3 gap-3">
              {trendingDestinations.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.1, ease }}
                  className="dest-card glass glass-hover rounded-2xl p-3.5 cursor-pointer"
                >
                  <span className="text-[10px] font-black text-[#8DC53E] bg-[#8DC53E]/12 px-2 py-0.5 rounded-full block w-fit mb-2">
                    {d.badge}
                  </span>
                  <p
                    className="text-white font-black text-xs mb-0.5 leading-tight"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {d.name}
                  </p>
                  <p className="text-white/35 text-[10px] font-medium">
                    {d.difficulty}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* TRUST STRIP */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.1, ease }}
              className="glass hero-float-b rounded-2xl px-5 py-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(141,197,62,0.12)" }}
                >
                  <TrendingUp size={14} className="text-[#8DC53E]" />
                </div>
                <div>
                  <p className="text-white text-[11px] font-black">
                    Trending This Week
                  </p>
                  <p className="text-white/35 text-[10px]">
                    Fresh arrivals just dropped
                  </p>
                </div>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="w-6 h-6 rounded-full border-2 border-white/10 flex items-center justify-center text-white text-[9px] font-black"
                    style={{
                      background: "linear-gradient(135deg, #8DC53E, #3a7a10)",
                    }}
                  >
                    {n}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-white/10 bg-white/10 flex items-center justify-center text-white/50 text-[9px] font-bold">
                  +
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
        <div className="scroll-hint w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div
            className="w-1 h-2 rounded-full bg-[#8DC53E]"
            style={{ animation: "hero-float-b 1.5s ease-in-out infinite" }}
          />
        </div>
        <span className="text-white/25 text-[9px] font-black uppercase tracking-[0.3em]">
          Scroll
        </span>
      </div>
    </section>
  );
};

export default HomeHero;
