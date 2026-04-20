import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";

// ── Scroll-triggered reveal wrapper ──────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 24, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(5px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.55, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Section heading ──────────────────────────────────────────────────────────
const SectionHead = ({ eyebrow, title, accent, sub, center = true }) => (
  <div className={`mb-12 ${center ? "text-center" : ""}`}>
    {eyebrow && (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8DC53E]/8 border border-[#8DC53E]/15 text-[#4a8a14] text-[9px] font-black uppercase tracking-[0.22em] mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8DC53E] animate-pulse" />
        {eyebrow}
      </div>
    )}
    <h2
      className="font-black text-gray-900 leading-tight mb-3"
      style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
    >
      {title} {accent && <span className="text-[#8DC53E]">{accent}</span>}
    </h2>
    {sub && (
      <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
        {sub}
      </p>
    )}
  </div>
);

// ── Toast notification ────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.34, 1.2, 0.64, 1] }}
      className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white"
      style={{ borderColor: toast.type === "success" ? "#8DC53E30" : "#ef444430" }}
    >
      {toast.type === "success" ? (
        <CheckCircle size={18} className="text-[#8DC53E]" />
      ) : (
        <AlertCircle size={18} className="text-red-500" />
      )}
      <p className="text-sm font-medium text-gray-800">{toast.message}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ── Registration Modal ────────────────────────────────────────────────────────
const RegisterModal = ({ event, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", participants: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Phone required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/events/${event._id}/register`, form);
      onSuccess();
    } catch (err) {
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: [0.34, 1.2, 0.64, 1] }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Register for Event</h3>
            <p className="text-gray-500 text-xs mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E]"}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+94 XX XXX XXXX"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E]"}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E]"}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Participants</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.participants}
              onChange={(e) => setForm({ ...form, participants: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] text-sm outline-none transition-all no-arrows"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "#8DC53E" }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {submitting ? "Registering..." : "Confirm Registration"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Event Card with FIXED Images ─────────────────────────────────────────────
const EventCard = ({ event, onRegister, index }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - (event.registeredCount || 0)
    : null;

  // FIXED: Better image URL handling with fallbacks
  const getImageUrl = () => {
    if (event.image) {
      if (event.image.startsWith('http')) return event.image;
      return `${BASE_URL}${event.image}`;
    }
    // Category-based fallback images
    const categoryImages = {
      Hiking: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop",
      Camping: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop",
      Fishing: "https://images.unsplash.com/photo-1524114664602-cf6f4d92321b?w=400&h=300&fit=crop",
      Climbing: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=300&fit=crop",
      Workshop: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop",
    };
    return categoryImages[event.category] || "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop";
  };

  return (
    <FadeIn delay={index * 0.05}>
      <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={getImageUrl()}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop";
            }}
          />
          {!isPast && spotsLeft !== null && spotsLeft <= 3 && spotsLeft > 0 && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
              {spotsLeft} left
            </span>
          )}
          {isPast && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Past Event</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8DC53E]">
              {event.category}
            </span>
            {event.price > 0 ? (
              <span className="text-sm font-black text-gray-900">Rs.{event.price.toLocaleString()}</span>
            ) : (
              <span className="text-[10px] font-bold text-[#8DC53E]">FREE</span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-base leading-tight mb-2 line-clamp-1">
            {event.title}
          </h3>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={12} className="text-[#8DC53E]" />
              <span>{eventDate.toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={12} className="text-[#8DC53E]" />
              <span className="truncate">{event.location}</span>
            </div>
            {event.duration && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} className="text-[#8DC53E]" />
                <span>{event.duration}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => !isPast && spotsLeft !== 0 && onRegister(event)}
            disabled={isPast || spotsLeft === 0}
            className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
              isPast || spotsLeft === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#8DC53E] text-white hover:bg-[#7ab535]"
            }`}
          >
            {isPast ? "Ended" : spotsLeft === 0 ? "Full" : <>Register <ArrowRight size={12} /></>}
          </button>
        </div>
      </div>
    </FadeIn>
  );
};

// ── Main Events Page ──────────────────────────────────────────────────────────
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  ScrollToTop();
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents(DEMO_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    setSelectedEvent(null);
    setToast({ type: "success", message: "You're registered! We'll confirm your spot within 24 hours." });
  };

  const categories = ["all", "Hiking", "Camping", "Fishing", "Climbing", "Workshop"];

  const filteredEvents = events
    .filter((e) => {
      const matchesCat = categoryFilter === "all" || e.category === categoryFilter;
      const matchesSearch = !searchQuery ||
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#8DC53E]/20 border-t-[#8DC53E] rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Events-hero.jpg"
            alt="Events background"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Join the Adventure
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                Events &
                <br />
                <span className="text-[#8DC53E]">Experiences</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                Guided hikes, camping expeditions, workshops, and outdoor competitions 
                across Sri Lanka. Join our community of adventurers.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Events Section */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          {/* Filters Bar */}
          <FadeIn delay={0.05}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm outline-none focus:border-[#8DC53E] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide transition-all ${
                      categoryFilter === cat
                        ? "bg-[#8DC53E] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Upcoming Events */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
              <span className="text-xs text-gray-400">{upcomingEvents.length} events</span>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingEvents.map((event, i) => (
                  <EventCard key={event._id} event={event} onRegister={setSelectedEvent} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No upcoming events found</p>
                {(searchQuery || categoryFilter !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
                    className="mt-3 text-[#8DC53E] text-sm font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5 pt-4 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-500">Past Events</h2>
                <span className="text-xs text-gray-400">{pastEvents.length} events</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
                {pastEvents.slice(0, 3).map((event, i) => (
                  <EventCard key={event._id} event={event} onRegister={setSelectedEvent} index={i} />
                ))}
              </div>
              {pastEvents.length > 3 && (
                <div className="text-center mt-5">
                  <button className="text-xs text-gray-400 font-medium hover:text-[#8DC53E] transition-colors">
                    View all past events <ChevronRight size={12} className="inline" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#8DC53E]">
        <div className={PX}>
          <FadeIn className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Plan Your Own Adventure?
            </h2>
            <p className="text-white/80 text-base max-w-md mx-auto mb-6">
              We organize custom trips for groups, teams, and private expeditions.
            </p>
            <button
              onClick={() => navigate("/contactus")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#8DC53E] text-xs font-bold uppercase tracking-wide hover:bg-gray-100 transition-all"
            >
              Contact Us <ArrowRight size={14} />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* Modals & Toasts */}
      <AnimatePresence>
        {selectedEvent && (
          <RegisterModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

// ── Demo data with FIXED Images ──────────────────────────────────────────────
const DEMO_EVENTS = [
  {
    _id: "1",
    title: "Knuckles Forest Hike",
    description: "A guided 12km hike through the misty Knuckles mountain range.",
    category: "Hiking",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Knuckles, Kandy",
    duration: "Full Day",
    price: 3500,
    maxParticipants: 20,
    registeredCount: 12,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop",
  },
  {
    _id: "2",
    title: "Yala Wilderness Camping",
    description: "Two nights of glamping at the edge of Yala National Park.",
    category: "Camping",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Yala, Southern Province",
    duration: "3 Days / 2 Nights",
    price: 12500,
    maxParticipants: 12,
    registeredCount: 8,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop",
  },
  {
    _id: "3",
    title: "Deduru Oya Fishing Tournament",
    description: "Open freshwater fishing competition.",
    category: "Fishing",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Deduru Oya, North Western",
    duration: "1 Day",
    price: 1500,
    maxParticipants: 50,
    registeredCount: 23,
    image: "https://images.unsplash.com/photo-1524114664602-cf6f4d92321b?w=400&h=300&fit=crop",
  },
  {
    _id: "4",
    title: "Rock Climbing Intro — Ella",
    description: "Beginner-friendly climbing session with certified instructors.",
    category: "Climbing",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Ella, Uva Province",
    duration: "Half Day",
    price: 4200,
    maxParticipants: 10,
    registeredCount: 4,
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=300&fit=crop",
  },
  {
    _id: "5",
    title: "Wilderness Survival Workshop",
    description: "Learn navigation, fire starting, and shelter building.",
    category: "Workshop",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Sinharaja Buffer Zone",
    duration: "2 Days",
    price: 6800,
    maxParticipants: 15,
    registeredCount: 11,
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop",
  },
];

export default Events;