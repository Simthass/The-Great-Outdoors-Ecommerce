import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Package,
  Settings,
  Mountain,
  Tent,
  Waves,
  Wind,
  Shield as ShieldIcon,
  ArrowUpRight,
} from "lucide-react";
import { logout } from "../store/slices/authSlice";
import SearchModal from "./SearchModal";
import TopBar from "./TopBar";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isHome = location.pathname === "/";
  const profileMenuRef = useRef(null);
  const shopRef = useRef(null);
  const lastScrollY = useRef(0);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop", hasDropdown: true },
    { name: "About", path: "/aboutUs" },
    { name: "Events", path: "/events" },
    { name: "Contact", path: "/contactus" },
  ];

  const shopCategories = [
    {
      name: "Hiking Gear",
      desc: "Boots, poles & packs",
      icon: Mountain,
      col: "#8DC53E",
    },
    {
      name: "Camping Equipment",
      desc: "Tents, sleeping bags",
      icon: Tent,
      col: "#34d399",
    },
    {
      name: "Water Sports",
      desc: "Kayaks & snorkeling",
      icon: Waves,
      col: "#38bdf8",
    },
    {
      name: "Climbing Essentials",
      desc: "Harnesses & ropes",
      icon: Wind,
      col: "#fb923c",
    },
    {
      name: "Outdoor Apparel",
      desc: "Technical clothing",
      icon: ShieldIcon,
      col: "#a78bfa",
    },
    {
      name: "Adventure Accessories",
      desc: "Knives, lights & more",
      icon: ArrowUpRight,
      col: "#f472b6",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);
      if (currentScrollY > lastScrollY.current && currentScrollY > 100)
        setShowTopBar(false);
      else setShowTopBar(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setIsProfileMenuOpen(false);
      if (shopRef.current && !shopRef.current.contains(e.target))
        setIsShopOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchModalOpen(false);
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsShopOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isTransparent = isHome && !isScrolled;

  const ProfileAvatar = ({ size = "w-9 h-9", text = "text-[10px]" }) => (
    <div
      className={`${size} rounded-full bg-gradient-to-tr from-[#8DC53E] to-[#5a9e1a] flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-inner`}
    >
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt="User"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`${text} font-black text-white tracking-tighter`}>
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </span>
      )}
    </div>
  );

  return (
    <>
      <style>{` 
        .hdr-nav-link {
          position: relative;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          padding: 10px 18px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .hdr-nav-link::after {
          content: '';
          position: absolute;
          bottom: 4px; left: 18px; right: 18px;
          height: 1.5px;
          background: #8DC53E;
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .hdr-nav-link:hover::after,
        .hdr-nav-link.active::after { transform: scaleX(1); }
 
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hdr-dropdown { animation: dropdown-in 0.22s cubic-bezier(0.34,1.2,0.64,1) both; }
 
        @keyframes mobile-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .mobile-menu-panel { animation: mobile-in 0.35s cubic-bezier(0.34,1.1,0.64,1) both; }
 
        .hdr-search-box {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 14px 7px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          cursor: pointer;
          transition: all 0.25s ease;
        }
 
        .hdr-icon-btn {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }
      `}</style>

      <TopBar isVisible={showTopBar} />

      <header
        className={`fixed left-0 right-0 z-50 w-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          showTopBar ? "top-[44px]" : "top-0"
        }`}
      >
        <div
          className={`w-full transition-all duration-500 ${
            isScrolled
              ? "bg-white/96 backdrop-blur-3xl shadow-[0_2px_32px_rgba(0,0,0,0.07)] border-b border-black/[0.04] py-3"
              : isHome
                ? "bg-transparent border-b border-white/[0.08] py-5"
                : "bg-white border-b border-black/[0.05] py-4"
          }`}
        >
          <div
            className="max-w-[1920px] mx-auto flex items-center justify-between"
            style={{ paddingLeft: "75px", paddingRight: "75px" }}
          >
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-4 group shrink-0">
              <img
                src="/TGO-Logo.png"
                alt="TGO"
                className={`h-11 w-auto transition-all duration-500 group-hover:scale-105 ${isTransparent ? "brightness-0 invert" : ""}`}
              />
              <div
                className={`h-7 w-px hidden xl:block transition-colors duration-500 ${isTransparent ? "bg-white/15" : "bg-black/8"}`}
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav
              className="hidden lg:flex items-center gap-0.5 relative"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {navLinks.map((link, idx) => (
                <div
                  key={link.name}
                  className="relative"
                  ref={link.hasDropdown ? shopRef : null}
                  onMouseEnter={() => {
                    setHoveredIndex(idx);
                    if (link.hasDropdown) setIsShopOpen(true);
                  }}
                >
                  <Link
                    to={link.path}
                    onClick={
                      link.hasDropdown ? (e) => e.preventDefault() : undefined
                    }
                    className={`hdr-nav-link flex items-center gap-1.5 ${
                      location.pathname === link.path
                        ? "active text-[#8DC53E]"
                        : isTransparent
                          ? "text-white/75 hover:text-white"
                          : "text-black/60 hover:text-black"
                    }`}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-400 ${isShopOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </Link>

                  {/* MEGA DROPDOWN */}
                  <AnimatePresence>
                    {link.hasDropdown && isShopOpen && (
                      <div
                        className="hdr-dropdown absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
                        onMouseLeave={() => setIsShopOpen(false)}
                        style={{ width: "560px" }}
                      >
                        <div className="bg-white rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.14)] border border-black/[0.04] overflow-hidden">
                          {/* Dropdown header */}
                          <div className="flex items-center justify-between px-7 py-5 border-b border-black/[0.04]">
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#8DC53E]">
                                Collections
                              </p>
                              <p className="text-[13px] font-black text-black mt-0.5">
                                Shop by Category
                              </p>
                            </div>
                            <Link
                              to="/shop"
                              onClick={() => setIsShopOpen(false)}
                              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-[#8DC53E] transition-colors"
                            >
                              View All <ArrowUpRight size={11} />
                            </Link>
                          </div>

                          {/* Categories grid */}
                          <div className="grid grid-cols-2 gap-0 p-3">
                            {shopCategories.map((cat) => (
                              <Link
                                key={cat.name}
                                to={`/shop?category=${cat.name}`}
                                onClick={() => setIsShopOpen(false)}
                                className="group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl hover:bg-gray-50/80 transition-all duration-200"
                              >
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
                                  style={{ background: `${cat.col}15` }}
                                >
                                  <cat.icon
                                    size={16}
                                    style={{ color: cat.col }}
                                  />
                                </div>
                                <div>
                                  <p className="text-[12px] font-black text-black/80 group-hover:text-black transition-colors">
                                    {cat.name}
                                  </p>
                                  <p className="text-[10px] text-black/35 font-medium">
                                    {cat.desc}
                                  </p>
                                </div>
                                <ChevronRight
                                  size={12}
                                  className="ml-auto text-black/15 opacity-0 group-hover:opacity-100 group-hover:text-[#8DC53E] transition-all"
                                />
                              </Link>
                            ))}
                          </div>

                          {/* Dropdown footer CTA */}
                          <div className="px-4 pb-4">
                            <Link
                              to="/shop"
                              onClick={() => setIsShopOpen(false)}
                              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:scale-[1.01]"
                              style={{
                                background:
                                  "linear-gradient(135deg, #8DC53E 0%, #5a9e1a 100%)",
                                boxShadow: "0 8px 24px rgba(141,197,62,0.3)",
                              }}
                            >
                              Browse All Products <ArrowUpRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Animated underline indicator */}
              {hoveredIndex !== null && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 h-[1.5px] bg-[#8DC53E]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  style={{
                    left: `${(100 / navLinks.length) * hoveredIndex + 1.5}%`,
                    width: `${100 / navLinks.length - 3}%`,
                  }}
                />
              )}
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className={`hdr-search-box ${
                  isTransparent
                    ? "border-white/[0.12] text-white/60 hover:border-white/25 hover:text-white hover:bg-white/[0.06]"
                    : "border-black/[0.06] text-black/45 hover:border-[#8DC53E]/30 hover:text-black hover:bg-black/[0.02]"
                }`}
                title="Search (Ctrl+K)"
              >
                <Search size={15} strokeWidth={2.5} />
                <span className="hidden xl:block text-current">Search</span>
                <span
                  className={`hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-mono ${isTransparent ? "bg-white/10 text-white/30" : "bg-black/5 text-black/30"}`}
                >
                  ⌘K
                </span>
              </button>

              {/* Cart */}
              <Link to="/cart">
                <div
                  className={`hdr-icon-btn ${
                    isTransparent
                      ? "border-white/[0.12] text-white hover:bg-white/[0.08] hover:border-white/25"
                      : "border-black/[0.06] text-black hover:bg-black/[0.03] hover:border-[#8DC53E]/30"
                  }`}
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  <span
                    className="absolute -top-1 -right-1 bg-[#8DC53E] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md border border-white/30"
                    style={{
                      minWidth: "18px",
                      height: "18px",
                      fontSize: "9px",
                    }}
                  >
                    3
                  </span>
                </div>
              </Link>

              {/* Profile / Join */}
              <div className="relative ml-1" ref={profileMenuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-2xl border transition-all duration-300 ${
                      isTransparent
                        ? "border-white/15 bg-white/[0.06] hover:bg-white/12"
                        : "border-black/[0.06] bg-black/[0.02] hover:bg-black/[0.04]"
                    }`}
                  >
                    <ProfileAvatar />
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-400 ${isProfileMenuOpen ? "rotate-180" : ""} ${isTransparent ? "text-white/60" : "text-black/40"}`}
                    />
                  </button>
                ) : (
                  <Link
                    to="/register"
                    className={`flex items-center gap-1.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 ${
                      isTransparent
                        ? "bg-white text-black hover:bg-[#8DC53E] hover:text-white shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
                        : "bg-black text-white hover:bg-[#8DC53E]"
                    }`}
                    style={{
                      boxShadow: isTransparent
                        ? undefined
                        : "0 4px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    Join
                  </Link>
                )}

                {/* PROFILE DROPDOWN */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{
                        duration: 0.18,
                        ease: [0.34, 1.2, 0.64, 1],
                      }}
                      className="absolute right-0 mt-3 w-64 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] border border-black/[0.04] rounded-[24px] overflow-hidden p-2"
                    >
                      <div
                        className="px-5 py-4 mb-1.5 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(141,197,62,0.08), transparent)",
                        }}
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8DC53E]/70 mb-0.5">
                          Signed In
                        </p>
                        <p className="text-[13px] font-black text-black">
                          {user?.firstName} {user?.lastName}
                        </p>
                      </div>
                      {[
                        {
                          icon: User,
                          label: "My Profile",
                          path: "/userProfile",
                        },
                        { icon: Package, label: "My Orders", path: "/orders" },
                        {
                          icon: Settings,
                          label: "Settings",
                          path: "/settings",
                        },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] text-black/55 hover:bg-[#8DC53E]/8 hover:text-[#5a9e1a] transition-all duration-200"
                        >
                          <item.icon size={15} /> {item.label}
                        </Link>
                      ))}
                      <div className="mx-2 my-1.5 h-px bg-black/[0.04]" />
                      <button
                        onClick={() => {
                          dispatch(logout());
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut size={15} /> End Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden hdr-icon-btn ml-1 ${
                  isTransparent
                    ? "border-white/15 text-white hover:bg-white/10"
                    : "border-black/[0.06] text-black hover:bg-black/[0.03]"
                }`}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
              className="mobile-menu-panel fixed top-0 right-0 bottom-0 z-[100] lg:hidden flex flex-col bg-[#0a0a0a]"
              style={{ width: "min(360px, 100vw)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-6 border-b border-white/[0.06]">
                <img
                  src="/TGO-Logo.png"
                  alt="TGO"
                  className="h-8 w-auto brightness-0 invert"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/12 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User strip */}
              {isAuthenticated && user ? (
                <div className="px-7 py-5 border-b border-white/[0.06] flex items-center gap-3">
                  <ProfileAvatar size="w-10 h-10" text="text-xs" />
                  <div>
                    <p className="text-[13px] font-black text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[10px] text-white/35 font-medium uppercase tracking-wider">
                      Member
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-7 py-5 border-b border-white/[0.06] flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1"
                  >
                    <button className="w-full py-3 rounded-xl border border-white/[0.12] text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.06] transition-all">
                      Login
                    </button>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1"
                  >
                    <button
                      className="w-full py-3 rounded-xl text-white text-[11px] font-black uppercase tracking-widest transition-all"
                      style={{
                        background: "linear-gradient(135deg, #8DC53E, #5a9e1a)",
                      }}
                    >
                      Join
                    </button>
                  </Link>
                </div>
              )}

              {/* Nav */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 px-3 mb-3">
                  Navigation
                </p>
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      to={link.path}
                      onClick={
                        link.hasDropdown
                          ? undefined
                          : () => setIsMobileMenuOpen(false)
                      }
                      className={`flex items-center justify-between px-3 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-200 mb-0.5 ${
                        location.pathname === link.path
                          ? "text-[#8DC53E] bg-[#8DC53E]/[0.08]"
                          : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                      }`}
                      {...(link.hasDropdown && {
                        onClick: () => setMobileShopOpen((p) => !p),
                      })}
                    >
                      {link.name}
                      {link.hasDropdown && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${mobileShopOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </Link>
                    {link.hasDropdown && mobileShopOpen && (
                      <div className="mb-2 pl-3">
                        {shopCategories.map((cat) => (
                          <Link
                            key={cat.name}
                            to={`/shop?category=${cat.name}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
                          >
                            <cat.icon size={13} style={{ color: cat.col }} />
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isAuthenticated && (
                  <>
                    <div className="h-px bg-white/[0.06] my-4 mx-3" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 px-3 mb-3">
                      Account
                    </p>
                    {[
                      { icon: User, label: "Profile", path: "/userProfile" },
                      { icon: Package, label: "Orders", path: "/orders" },
                      { icon: Settings, label: "Settings", path: "/settings" },
                    ].map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] text-white/45 hover:text-white hover:bg-white/[0.04] transition-all mb-0.5"
                      >
                        <item.icon size={15} className="text-[#8DC53E]" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        dispatch(logout());
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-all mt-1"
                    >
                      <LogOut size={15} /> End Session
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Spacer */}
      <div
        className={`transition-all duration-700 ${showTopBar ? "h-[100px]" : "h-[68px]"}`}
      />
    </>
  );
};

export default Header;
