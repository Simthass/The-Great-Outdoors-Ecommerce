import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Star,
  Award,
  Truck,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Eye,
} from "lucide-react";
import BannerSlider from "../components/BannerSlider";
import EventSubscriptionForm from "../components/EventSubscriptionForm";
import ScrollToTop from "../components/ScrollToTop";

// ── Scroll-triggered reveal wrapper ──────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 32, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(5px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.65, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Section heading component ─────────────────────────────────────────────────
const SectionHead = ({
  eyebrow,
  title,
  accent,
  sub,
  light = false,
  center = true,
}) => (
  <div className={`mb-14 ${center ? "text-center" : ""}`}>
    {eyebrow && (
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.22em] mb-4 border ${
          light
            ? "bg-[#8DC53E]/10 border-[#8DC53E]/25 text-[#8DC53E]"
            : "bg-[#8DC53E]/8 border-[#8DC53E]/15 text-[#4a8a14]"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {eyebrow}
      </div>
    )}
    <h2
      className={`font-black leading-tight mb-3 ${light ? "text-white" : "text-gray-900"}`}
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: "clamp(1.85rem, 3.8vw, 2.9rem)",
      }}
    >
      {title} <span className="text-[#8DC53E]">{accent}</span>
    </h2>
    {sub && (
      <p
        className={`text-base leading-relaxed max-w-2xl ${center ? "mx-auto" : ""} ${light ? "text-white/50" : "text-gray-400"}`}
      >
        {sub}
      </p>
    )}
  </div>
);

// ── Home page ─────────────────────────────────────────────────────────────────
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState([]);
  const [homeReviews, setHomeReviews] = useState([]);

  const hotProductsRef = useRef(null);
  const featuredProductsRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  ScrollToTop();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    fetchHomeReviews();
  }, []);

  const fetchHomeReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews/homepage`);
      setHomeReviews(response.data);
    } catch (error) {
      console.error("Error fetching homepage reviews:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation();
    try {
      if (!isLoggedIn()) {
        if (
          window.confirm(
            "Please log in to add items to cart. Would you like to log in now?",
          )
        )
          navigate("/login");
        return;
      }
      if (addedItems.includes(productId)) return;
      setAddedItems((prev) => [...prev, productId]);
      await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true,
        },
      );
      setTimeout(
        () => setAddedItems((prev) => prev.filter((id) => id !== productId)),
        2000,
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedItems((prev) => prev.filter((id) => id !== productId));
      if (error.response?.status === 401) {
        alert("Please log in to add items to cart");
        navigate("/login");
      } else alert("Failed to add item to cart. Please try again.");
    }
  };

  const scrollLeft = (ref) => {
    const container = ref.current;
    if (!container) return;
    const totalCardWidth = 320 + 24;
    let newScrollLeft = container.scrollLeft - totalCardWidth;
    if (newScrollLeft <= 0)
      newScrollLeft = container.scrollWidth - container.clientWidth;
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  const scrollRight = (ref) => {
    const container = ref.current;
    if (!container) return;
    const totalCardWidth = 320 + 24;
    let newScrollLeft = container.scrollLeft + totalCardWidth;
    if (newScrollLeft >= container.scrollWidth - container.clientWidth)
      newScrollLeft = 0;
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  const categories = [
    {
      name: "Sports Shooting",
      image: "/Shop-hunting.jpg",
      description: "Precision gear for shooting sports enthusiasts",
      accent: "#3B82F6",
      tag: "Pro Series",
    },
    {
      name: "Camping",
      image: "/Shop-camping.jpg",
      description: "Everything for your outdoor camping adventures",
      accent: "#8DC53E",
      tag: "Best Sellers",
    },
    {
      name: "Fishing",
      image: "/Shop-fishing.jpg",
      description: "Premium fishing equipment and accessories",
      accent: "#06B6D4",
      tag: "New Arrivals",
    },
    {
      name: "Climbing",
      image: "/Shop-climbing.jpg",
      description: "Gear for climbing and mountaineering",
      accent: "#F97316",
      tag: "Top Rated",
    },
  ];

  const hotProducts = products.filter((product) => product.isHotThisWeek);
  const featuredProducts = products.filter((product) => product.isFeatured);

  if (loading)
    return (
      <div
        className="flex justify-center items-center h-80 bg-white"
        data-testid="home-loading"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#8DC53E]/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8DC53E] animate-spin" />
          </div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.25em]">
            Loading…
          </p>
        </div>
      </div>
    );

  const PX = "px-[75px]";
  const SECTION_PY = "py-20 lg:py-28";

  return (
    <div data-testid="home-page" className="bg-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');
 
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
 
        /* Category cards */
        .cat-img { transition: transform 0.7s cubic-bezier(0.33,1,0.68,1); }
        .cat-card:hover .cat-img { transform: scale(1.09); }
        .cat-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%);
        }
        .cat-cta {
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.35s cubic-bezier(0.34,1.2,0.64,1);
        }
        .cat-card:hover .cat-cta { opacity: 1; transform: translateY(0); }
        .cat-title { transition: transform 0.35s ease; }
        .cat-card:hover .cat-title { transform: translateY(-4px); }
        .cat-accent-line {
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.5s ease;
        }
        .cat-card:hover .cat-accent-line { transform: scaleX(1); }
 
        /* Product cards */
        .prod-card {
          transition: all 0.35s cubic-bezier(0.33,1,0.68,1);
        }
        .prod-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 70px rgba(0,0,0,0.10), 0 0 0 1px rgba(141,197,62,0.12);
        }
        .prod-cart-btn {
          transform: translateY(100%);
          transition: transform 0.38s cubic-bezier(0.34,1.4,0.64,1);
        }
        .prod-card:hover .prod-cart-btn { transform: translateY(0); }
 
        /* Review cards */
        .review-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.09);
          transition: all 0.4s ease;
        }
        .review-card:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(141,197,62,0.35);
          transform: translateY(-7px);
          box-shadow: 0 28px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(141,197,62,0.12);
        }
 
        /* Feature strip cards */
        .feat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.3s ease;
        }
        .feat-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(141,197,62,0.3);
          transform: translateY(-5px);
        }
 
        /* Scroll buttons */
        .scroll-zone:hover .scroll-btn-reveal { opacity: 1; transform: scale(1); }
        .scroll-btn-reveal {
          opacity: 0; transform: scale(0.85);
          transition: all 0.25s ease;
        }
      `}</style>

      {/* ══════════════════════════════════════
          1. CATEGORIES SECTION
      ══════════════════════════════════════ */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          <FadeIn>
            <SectionHead
              eyebrow="Explore Collections"
              title="Shop by"
              accent="Category"
              sub="Premium outdoor gear crafted for every adventure Sri Lanka has to offer"
            />
          </FadeIn>

          {/* CATEGORIES GRID — redesigned layout with featured large + 3 smaller */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
            {/* Large featured card (col-span-5) */}
            <FadeIn delay={0.05} className="lg:col-span-5">
              <div
                className="cat-card group relative overflow-hidden rounded-[28px] cursor-pointer h-[480px] lg:h-full lg:min-h-[520px]"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                onClick={() => navigate(`/shop?category=${categories[0].name}`)}
              >
                <img
                  src={categories[0].image}
                  alt={categories[0].name}
                  className="cat-img absolute inset-0 w-full h-full object-cover"
                />
                <div className="cat-overlay absolute inset-0" />

                {/* Tag */}
                <div className="absolute top-5 left-5">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.22em] bg-black/35 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full">
                    {categories[0].tag}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="text-[#8DC53E] text-[10px] font-black uppercase tracking-[0.25em] mb-2">
                    Category
                  </p>
                  <h3
                    className="cat-title text-white font-black text-3xl mb-2 leading-tight"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {categories[0].name}
                  </h3>
                  <p className="text-white/55 text-sm mb-5 leading-relaxed">
                    {categories[0].description}
                  </p>
                  <div className="cat-cta inline-flex items-center gap-2 bg-[#8DC53E] text-white text-[11px] font-black uppercase tracking-[0.18em] px-5 py-2.5 rounded-xl">
                    Explore <ArrowRight size={13} />
                  </div>
                </div>

                {/* Accent line */}
                <div
                  className="cat-accent-line absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{
                    background: `linear-gradient(90deg, ${categories[0].accent}, #8DC53E)`,
                  }}
                />
              </div>
            </FadeIn>

            {/* Right column — 3 stacked cards */}
            <div className="lg:col-span-7 grid grid-cols-1 gap-4 lg:gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                {categories.slice(1, 3).map((cat, i) => (
                  <FadeIn key={cat.name} delay={0.1 + i * 0.07}>
                    <div
                      className="cat-card group relative overflow-hidden rounded-[24px] cursor-pointer h-[260px]"
                      style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.09)" }}
                      onClick={() => navigate(`/shop?category=${cat.name}`)}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="cat-img absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="cat-overlay absolute inset-0" />

                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.18em] bg-black/35 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full">
                          {cat.tag}
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3
                          className="cat-title text-white font-black text-xl mb-1.5 leading-tight"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {cat.name}
                        </h3>
                        <div className="cat-cta inline-flex items-center gap-1.5 text-white/80 text-[10px] font-black uppercase tracking-[0.18em]">
                          Shop Now <ArrowRight size={11} />
                        </div>
                      </div>

                      <div
                        className="cat-accent-line absolute bottom-0 left-0 right-0 h-[2.5px]"
                        style={{
                          background: `linear-gradient(90deg, ${cat.accent}, #8DC53E)`,
                        }}
                      />
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* Wide card at bottom right */}
              <FadeIn delay={0.22}>
                <div
                  className="cat-card group relative overflow-hidden rounded-[24px] cursor-pointer"
                  style={{
                    height: "220px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.09)",
                  }}
                  onClick={() =>
                    navigate(`/shop?category=${categories[3].name}`)
                  }
                >
                  <img
                    src={categories[3].image}
                    alt={categories[3].name}
                    className="cat-img absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="cat-overlay absolute inset-0" />

                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.18em] bg-black/35 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full">
                      {categories[3].tag}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                    <div>
                      <h3
                        className="cat-title text-white font-black text-2xl mb-1 leading-tight"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {categories[3].name}
                      </h3>
                      <p className="text-white/50 text-xs">
                        {categories[3].description}
                      </p>
                    </div>
                    <div className="cat-cta flex items-center gap-2 bg-white/12 backdrop-blur-md border border-white/15 text-white text-[10px] font-black uppercase tracking-[0.18em] px-4 py-2.5 rounded-xl">
                      Explore <ArrowRight size={12} />
                    </div>
                  </div>

                  <div
                    className="cat-accent-line absolute bottom-0 left-0 right-0 h-[2.5px]"
                    style={{
                      background: `linear-gradient(90deg, ${categories[3].accent}, #8DC53E)`,
                    }}
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          2. HOT THIS WEEK
      ══════════════════════════════════════ */}
      <section id="hot-this-week" className={`${SECTION_PY} bg-gray-50/60`}>
        <div className={PX}>
          <FadeIn>
            <SectionHead
              eyebrow="🔥 Trending Now"
              title="Hot This"
              accent="Week"
              sub="This week's most popular outdoor gear — flying off the shelves"
            />
          </FadeIn>

          <div className="scroll-zone relative">
            {hotProducts.length > 4 && (
              <>
                <button
                  onClick={() => scrollLeft(hotProductsRef)}
                  className="scroll-btn-reveal absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 items-center justify-center hover:bg-[#8DC53E] hover:text-white hover:border-[#8DC53E] transition-all duration-300 hidden lg:flex"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => scrollRight(hotProductsRef)}
                  className="scroll-btn-reveal absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 items-center justify-center hover:bg-[#8DC53E] hover:text-white hover:border-[#8DC53E] transition-all duration-300 hidden lg:flex"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
            <div
              ref={hotProductsRef}
              className="flex overflow-x-auto gap-5 pb-3 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              data-testid="hot-grid"
            >
              {hotProducts.map((product) => (
                <div key={product._id} className="flex-shrink-0 w-72 sm:w-80">
                  <ProductCard
                    product={product}
                    addedItems={addedItems}
                    handleAddToCart={handleAddToCart}
                    navigate={navigate}
                    API_URL={API_URL}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. BANNER SLIDER
      ══════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className={PX}>
          <FadeIn>
            <div
              className="rounded-[28px] overflow-hidden shadow-2xl"
              data-testid="banner-slider"
            >
              <BannerSlider />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. FEATURE STRIP
      ══════════════════════════════════════ */}
      <section className="py-14 bg-[#080808]">
        <div className={PX}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Award,
                title: "Best Price Guarantee",
                desc: "100% authentic products. If you find it cheaper, we match it.",
                grad: "from-blue-500 to-blue-700",
                glow: "rgba(59,130,246,0.28)",
              },
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "Free delivery island-wide on all orders over Rs. 5,000.",
                grad: "from-[#8DC53E] to-[#4a8a14]",
                glow: "rgba(141,197,62,0.28)",
              },
              {
                icon: Shield,
                title: "Secure Checkout",
                desc: "256-bit SSL encrypted payments for complete peace of mind.",
                grad: "from-violet-500 to-violet-700",
                glow: "rgba(139,92,246,0.28)",
              },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.09}>
                <div className="feat-card rounded-2xl p-6 flex items-start gap-4 cursor-default">
                  <div
                    className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${f.grad} flex items-center justify-center`}
                    style={{ boxShadow: `0 8px 24px ${f.glow}` }}
                  >
                    <f.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-white font-black text-sm mb-1.5"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. SUBSCRIPTION SECTION
      ══════════════════════════════════════ */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          <FadeIn>
            <div
              className="overflow-hidden rounded-[32px] relative"
              style={{
                background:
                  "linear-gradient(135deg, #f0fde4 0%, #fefffe 50%, #f0fde4 100%)",
                border: "1px solid rgba(141,197,62,0.18)",
                boxShadow: "0 24px 80px rgba(141,197,62,0.10)",
              }}
              data-testid="subscription-section"
            >
              {/* Decorative orbs */}
              <div
                className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-40"
                style={{
                  background:
                    "radial-gradient(circle, rgba(141,197,62,0.25) 0%, transparent 70%)",
                  transform: "translate(35%, -35%)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none opacity-30"
                style={{
                  background:
                    "radial-gradient(circle, rgba(141,197,62,0.3) 0%, transparent 70%)",
                  transform: "translate(-35%, 35%)",
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
                {/* Image */}
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src="/Subs-Home.jpg"
                    alt="Join our adventurers"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 lg:hidden"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent 50%, rgba(240,253,228,0.95) 100%)",
                    }}
                  />
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center gap-2 bg-[#8DC53E] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                      🏔️ Join 10,000+ Adventurers
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-10 lg:p-14 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-[#8DC53E]/10 text-[#4a8a14] border border-[#8DC53E]/20 text-[10px] font-black uppercase tracking-[0.22em] px-4 py-1.5 rounded-full w-fit mb-6">
                    ✉ Stay Updated
                  </div>
                  <h2
                    className="text-gray-900 mb-4 leading-tight"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
                      fontWeight: 900,
                    }}
                  >
                    Never Miss an
                    <br />
                    <span className="text-[#8DC53E]">Adventure</span>
                  </h2>
                  <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm">
                    Hiking trips, camping expeditions, climbing adventures,
                    workshops — be the first to know.
                  </p>
                  <div data-testid="subscription-form">
                    <EventSubscriptionForm />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. FEATURED PRODUCTS
      ══════════════════════════════════════ */}
      <section className={`${SECTION_PY} bg-gray-50/50`}>
        <div className={PX}>
          <FadeIn>
            <SectionHead
              eyebrow="⭐ Featured Selection"
              title="Featured"
              accent="Products"
              sub="Handpicked selection of our finest outdoor equipment, chosen by our expert team"
            />
          </FadeIn>

          <div className="scroll-zone relative">
            {featuredProducts.length > 4 && (
              <>
                <button
                  onClick={() => scrollLeft(featuredProductsRef)}
                  className="scroll-btn-reveal absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 items-center justify-center hover:bg-[#8DC53E] hover:text-white hover:border-[#8DC53E] transition-all duration-300 hidden lg:flex"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => scrollRight(featuredProductsRef)}
                  className="scroll-btn-reveal absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 items-center justify-center hover:bg-[#8DC53E] hover:text-white hover:border-[#8DC53E] transition-all duration-300 hidden lg:flex"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
            <div
              ref={featuredProductsRef}
              className="flex overflow-x-auto gap-5 pb-3 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              data-testid="featured-grid"
            >
              {featuredProducts.map((product) => (
                <div key={product._id} className="flex-shrink-0 w-72 sm:w-80">
                  <ProductCard
                    product={product}
                    addedItems={addedItems}
                    handleAddToCart={handleAddToCart}
                    navigate={navigate}
                    API_URL={API_URL}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. CUSTOMER REVIEWS (DARK)
      ══════════════════════════════════════ */}
      <section
        className={`${SECTION_PY} relative overflow-hidden`}
        style={{ background: "#080808" }}
      >
        {/* BG texture */}
        <div className="absolute inset-0 bg-[url('/Review-BG.png')] bg-cover bg-center opacity-[0.12]" />
        {/* Glow orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(141,197,62,0.12) 0%, transparent 65%)",
            transform: "translateY(-50%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(141,197,62,0.10) 0%, transparent 65%)",
            transform: "translateY(50%)",
          }}
        />

        <div className={`relative z-10 ${PX}`}>
          <FadeIn>
            <SectionHead
              eyebrow="💬 Customer Voices"
              title="What Our"
              accent="Customers Say"
              sub="Thousands of adventurers across Sri Lanka trust TGO for their outdoor journey"
              light
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {homeReviews.slice(0, 3).map((review, index) => (
              <FadeIn key={review._id} delay={index * 0.12}>
                <div className="review-card rounded-3xl p-7 flex flex-col">
                  {/* Large quote */}
                  <div
                    className="text-6xl leading-none mb-3 select-none"
                    style={{
                      fontFamily: "Georgia, serif",
                      color: "rgba(141,197,62,0.18)",
                    }}
                  >
                    "
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1 italic">
                    {review.description}
                  </p>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-700"
                          }
                        />
                      ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                    <div className="relative shrink-0">
                      <img
                        src={
                          review.customerImage
                            ? `${API_URL.replace("/api", "")}${review.customerImage}`
                            : "/default-avatar.png"
                        }
                        alt={review.customerName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#8DC53E]/25"
                      />
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#8DC53E] rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: "#080808" }}
                      >
                        <Star size={7} className="text-white fill-white" />
                      </div>
                    </div>
                    <div>
                      <p
                        className="text-white font-black text-[13px]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {review.customerName}
                      </p>
                      <p className="text-gray-500 text-[11px] font-medium">
                        {review.customerTitle}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ── ProductCard ───────────────────────────────────────────────────────────────
const ProductCard = ({
  product,
  addedItems,
  handleAddToCart,
  navigate,
  API_URL,
}) => {
  const [hovered, setHovered] = useState(false);

  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewCount
      : 0;

  const isOutOfStock =
    product.stockStatus === "out_of_stock" || product.inventory?.quantity === 0;
  const isAdded = addedItems.includes(product._id);

  const getImageUrl = () => {
    if (product.images?.length > 0)
      return `${API_URL.replace("/api", "")}${product.images[0]}`;
    if (product.imageUrl)
      return `${API_URL.replace("/api", "")}${product.imageUrl}`;
    return "/products/placeholder.jpg";
  };

  return (
    <div
      className="prod-card group bg-white rounded-2xl overflow-hidden border border-gray-100/80 cursor-pointer flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`prod-card-${product._id}`}
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden bg-gray-50/80"
        onClick={() => navigate(`/product/${product._id}`)}
        data-testid={`prod-img-wrap-${product._id}`}
      >
        <div className="w-full h-full flex items-center justify-center p-6 transition-transform duration-600 group-hover:scale-105">
          <img
            src={getImageUrl()}
            alt={product.productName}
            className="max-w-full max-h-full object-contain"
            data-testid={`prod-img-${product._id}`}
          />
        </div>

        {/* Quick view chip */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-full transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
        >
          <Eye size={11} /> Quick View
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {!isOutOfStock && (
          <div className="prod-cart-btn absolute bottom-0 left-0 right-0 p-3">
            <button
              onClick={(e) => handleAddToCart(product._id, e)}
              disabled={isAdded}
              className={`w-full py-2.5 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 ${
                isAdded ? "bg-green-500 text-white" : "text-white"
              }`}
              style={
                !isAdded
                  ? {
                      background: "linear-gradient(135deg, #8DC53E, #5a9e1a)",
                      boxShadow: "0 6px 20px rgba(141,197,62,0.35)",
                    }
                  : {}
              }
              data-testid={`prod-add-${product._id}`}
            >
              <ShoppingCart size={13} />
              {isAdded ? "Added ✓" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#4a8a14] transition-colors duration-200 leading-snug min-h-[2.5rem]"
          onClick={() => navigate(`/product/${product._id}`)}
          data-testid={`prod-name-${product._id}`}
        >
          {product.productName}
        </h3>

        <div
          className="flex items-center gap-1.5 mb-3"
          data-testid={`prod-stars-${product._id}`}
        >
          <div className="flex gap-0.5">
            {Array(5)
              .fill()
              .map((_, i) => (
                <svg
                  key={i}
                  data-testid={`prod-star-${product._id}-${i + 1}`}
                  className={`w-3 h-3 ${i < Math.floor(avgRating) ? "text-amber-400" : "text-gray-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
          </div>
          <span className="text-[11px] text-gray-400">({reviewCount})</span>
        </div>

        <div className="mt-auto">
          <p
            className="font-black text-gray-900 text-xl"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            data-testid={`prod-price-${product._id}`}
          >
            Rs.{product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
