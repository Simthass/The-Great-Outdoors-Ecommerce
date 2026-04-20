import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Package,
  Shield,
  Star,
  Loader2,
  X,
} from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";

// ── Scroll-triggered reveal wrapper ──────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 24, className = "" }) => {
  const ref = React.useRef(null);
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

// ── Info Row Component ───────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, subValue }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-[#8DC53E]/10 flex items-center justify-center shrink-0">
      <Icon size={16} className="text-[#8DC53E]" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
    </div>
  </div>
);

// ── List Item Component ──────────────────────────────────────────────────────
const ListItem = ({ text, isChecked = false }) => (
  <div className="flex items-start gap-2">
    {isChecked ? (
      <CheckCircle size={16} className="text-[#8DC53E] shrink-0 mt-0.5" />
    ) : (
      <div className="w-1.5 h-1.5 rounded-full bg-[#8DC53E] mt-2 shrink-0" />
    )}
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

// ── Registration Modal ───────────────────────────────────────────────────────
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
    if (form.participants < 1) e.participants = "At least 1 participant";
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
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Register for Event</h3>
            <p className="text-gray-500 text-xs mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
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
              max={event.maxParticipants - event.registeredCount}
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

// ── Main Event Detail Page ───────────────────────────────────────────────────
const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [toast, setToast] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  ScrollToTop();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events/${id}`);
      setEvent(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching event:", error);
      setError(error.response?.data?.message || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    setToast({ type: "success", message: "Successfully registered for the event!" });
    fetchEvent();
    setTimeout(() => setToast(null), 4000);
  };

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#8DC53E]/20 border-t-[#8DC53E] rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative bg-gray-900 overflow-hidden">
          <div className={`relative ${SECTION_PY} ${PX}`}>
            <FadeIn>
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-8 h-px bg-[#8DC53E]" />
                  Error
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                  Event Not
                  <br />
                  <span className="text-[#8DC53E]">Found</span>
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                  {error || "The event you're looking for doesn't exist or has been removed."}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <div className={`${SECTION_PY} bg-white ${PX}`}>
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-500 text-sm mb-8">
              We couldn't find the event you're looking for.
            </p>
            <button
              onClick={() => navigate("/events")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
            >
              <ArrowLeft size={14} /> Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isFull = event.maxParticipants && event.registeredCount >= event.maxParticipants;
  const isPast = new Date(event.date) < new Date();
  const spotsLeft = event.maxParticipants ? event.maxParticipants - (event.registeredCount || 0) : null;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={event.image ? `${BASE_URL}${event.image}` : "/events-placeholder.jpg"}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "/events-placeholder.jpg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className={`absolute bottom-0 left-0 right-0 ${PX} pb-12`}>
          <FadeIn>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#8DC53E] text-white text-[10px] font-bold uppercase tracking-wider">
                {event.category}
              </span>
              {event.difficulty && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                  {event.difficulty}
                </span>
              )}
              {event.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                  <Star size={10} /> Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              {event.title}
            </h1>
            <p className="text-gray-200 text-base max-w-2xl line-clamp-2">
              {event.description}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main Content */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          {/* Back Button */}
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#8DC53E] text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Events
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <FadeIn delay={0.05}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              </FadeIn>

              {/* Requirements */}
              {event.requirements && event.requirements.length > 0 && (
                <FadeIn delay={0.1}>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield size={18} className="text-[#8DC53E]" />
                      Requirements
                    </h2>
                    <div className="space-y-2">
                      {event.requirements.map((req, idx) => (
                        <ListItem key={idx} text={req} />
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* What's Included */}
              {event.includes && event.includes.length > 0 && (
                <FadeIn delay={0.15}>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package size={18} className="text-[#8DC53E]" />
                      What's Included
                    </h2>
                    <div className="space-y-2">
                      {event.includes.map((item, idx) => (
                        <ListItem key={idx} text={item} isChecked />
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <FadeIn delay={0.05}>
                <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                  {/* Price */}
                  <div className="text-center pb-5 border-b border-gray-200">
                    <div className="text-3xl font-black text-[#8DC53E] mb-1">
                      {event.price === 0 ? "FREE" : `Rs.${event.price.toLocaleString()}`}
                    </div>
                    <p className="text-xs text-gray-500">per person</p>
                  </div>

                  {/* Event Info */}
                  <div className="py-5 space-y-4">
                    <InfoRow
                      icon={Calendar}
                      label="Date & Time"
                      value={new Date(event.date).toLocaleDateString("en-LK", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      subValue={event.time}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Location"
                      value={event.location}
                    />
                    {event.duration && (
                      <InfoRow
                        icon={Clock}
                        label="Duration"
                        value={event.duration}
                      />
                    )}
                    {event.maxParticipants && (
                      <InfoRow
                        icon={Users}
                        label="Participants"
                        value={`${event.registeredCount || 0} / ${event.maxParticipants} registered`}
                        subValue={!isFull && !isPast && spotsLeft > 0 ? `${spotsLeft} spots remaining` : undefined}
                      />
                    )}
                  </div>

                  {/* Registration Button */}
                  {!isPast && !isFull ? (
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="w-full py-3 rounded-xl bg-[#8DC53E] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
                    >
                      Register Now
                    </button>
                  ) : isPast ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-gray-300 text-gray-500 text-sm font-bold uppercase tracking-wide cursor-not-allowed"
                    >
                      Event Ended
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-gray-300 text-gray-500 text-sm font-bold uppercase tracking-wide cursor-not-allowed"
                    >
                      Event Full
                    </button>
                  ) : null}

                  {/* Organizer Info */}
                  {event.organizer && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Organizer</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User size={14} className="text-gray-400" />
                          <span className="text-gray-700">{event.organizer.name}</span>
                        </div>
                        {event.organizer.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-gray-700">{event.organizer.email}</span>
                          </div>
                        )}
                        {event.organizer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-gray-700">{event.organizer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <RegisterModal
            event={event}
            onClose={() => setShowRegisterModal(false)}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-[#8DC53E]/30"
          >
            <CheckCircle size={18} className="text-[#8DC53E]" />
            <p className="text-sm font-medium text-gray-800">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetail;