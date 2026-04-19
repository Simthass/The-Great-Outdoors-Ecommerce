import React, { useState, useEffect } from "react";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";

const TopBar = ({ isVisible }) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  const promos = [
    "🏔️  Free Shipping on all orders over Rs. 5,000",
    "⚡  New Season Expedition Gear — Just Dropped",
    "🎯  Authentic gear. Unbeatable prices. Always.",
    "🌿  Sri Lanka's #1 Trusted Outdoor Outfitter",
  ];

  useEffect(() => {
    const t = setInterval(
      () => setTickerIndex((p) => (p + 1) % promos.length),
      4000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes tb-in {
          0%   { opacity: 0; transform: translateY(8px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
        .tb-ticker { animation: tb-in 4s ease-in-out both; }
        @keyframes tb-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
        .tb-dot-pulse { animation: tb-dot 2s ease-in-out infinite; }
        @keyframes tb-shimmer {
          from { transform: translateX(-200%); }
          to   { transform: translateX(600%); }
        }
        .tb-shimmer-line {
          position: absolute; top: 0; left: 0;
          width: 15%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(141,197,62,0.06), transparent);
          animation: tb-shimmer 6s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div
        className={`fixed top-0 left-0 right-0 z-[60] w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          height: "44px",
          background: "#080808",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="tb-shimmer-line" />

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(141,197,62,0.5) 40%, rgba(141,197,62,0.8) 50%, rgba(141,197,62,0.5) 60%, transparent)",
          }}
        />

        <div
          className="max-w-[1920px] mx-auto h-full flex items-center justify-between"
          style={{ paddingLeft: "75px", paddingRight: "75px" }}
        >
          {/* LEFT */}
          <div className="flex items-center gap-5">
            <a
              href="tel:+94764078448"
              className="group flex items-center gap-1.5"
            >
              <Phone size={10} className="text-[#8DC53E]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 group-hover:text-white/75 transition-colors duration-300">
                +94 764078448
              </span>
            </a>
            <div className="w-px h-3 bg-white/[0.06]" />
            <a
              href="mailto:Tgo@tgolk.com"
              className="group hidden md:flex items-center gap-1.5"
            >
              <Mail size={10} className="text-[#8DC53E]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 group-hover:text-white/75 transition-colors duration-300">
                Tgo@tgolk.com
              </span>
            </a>
          </div>

          {/* CENTER ticker */}
          <div className="hidden lg:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
            <span className="tb-dot-pulse w-[5px] h-[5px] rounded-full bg-[#8DC53E] shrink-0" />
            <div
              className="relative overflow-hidden"
              style={{ height: "44px", minWidth: "360px" }}
            >
              <div className="flex items-center justify-center h-full">
                <span
                  key={tickerIndex}
                  className="tb-ticker absolute text-[10px] font-black uppercase tracking-[0.3em] text-white/50 whitespace-nowrap"
                >
                  {promos[tickerIndex]}
                </span>
              </div>
            </div>
            <span
              className="tb-dot-pulse w-[5px] h-[5px] rounded-full bg-[#8DC53E] shrink-0"
              style={{ animationDelay: "1s" }}
            />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 pr-4 border-r border-white/[0.06]">
              <a
                href="https://www.facebook.com/tgolk.outfitter/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook
                  size={11}
                  className="text-white/25 hover:text-white transition-colors cursor-pointer"
                />
              </a>
              <a
                href="https://www.instagram.com/tgo.srilanka/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram
                  size={11}
                  className="text-white/25 hover:text-white transition-colors cursor-pointer"
                />
              </a>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <a
                href="https://wa.link/soj1pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30 hover:text-[#8DC53E] transition-colors duration-300"
              >
                Chat
              </a>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30 hover:text-[#8DC53E] transition-colors duration-300 cursor-pointer">
                Stores
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;
