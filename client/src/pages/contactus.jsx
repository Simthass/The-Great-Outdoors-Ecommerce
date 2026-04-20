import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
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

// ── Contact Info Card ────────────────────────────────────────────────────────
const ContactInfoCard = ({ icon: Icon, title, children, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="w-11 h-11 rounded-xl bg-[#8DC53E]/10 flex items-center justify-center shrink-0 group-hover:bg-[#8DC53E] transition-colors duration-300">
        <Icon size={20} className="text-[#8DC53E] group-hover:text-white transition-colors duration-300" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
        <div className="text-gray-500 text-sm">{children}</div>
      </div>
    </div>
  </FadeIn>
);

// ── Input Field ──────────────────────────────────────────────────────────────
const InputField = ({ label, name, type = "text", placeholder, required, multiline = false, value, onChange, onBlur, error, touched }) => {
  const showError = touched && error;
  
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
        {label} {required && <span className="text-[#8DC53E]">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white resize-none ${
            showError
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E]"
          }`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white ${
            showError
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E]"
          }`}
        />
      )}
      {showError && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

// ── Main Contact Page ────────────────────────────────────────────────────────
const Contact = () => {
  const navigate = useNavigate();
  ScrollToTop();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Valid email is required";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        return "";
      case "subject":
        if (!value.trim()) return "Subject is required";
        if (value.trim().length < 3) return "Subject must be at least 3 characters";
        return "";
      case "message":
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 10) return "Message must be at least 10 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
    
    if (toast) setToast(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);
    
    // Validate all
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setToast({ type: "error", message: "Please fix the errors above" });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setToast({ type: "success", message: "Message sent successfully! We'll get back to you soon." });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTouched({});
      setErrors({});
    } catch (error) {
      setToast({ type: "error", message: "Failed to send message. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: "Visit Us", content: "35T, 1st Floor, Liberty Plaza, Colombo-03" },
    { icon: Phone, title: "Call Us", content: "+94 764078448" },
    { icon: Mail, title: "Email Us", content: "tgo@tgolk.com" },
    { icon: Clock, title: "Opening Hours", content: "Mon - Sat: 10am - 7pm" },
  ];

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero Section (matching About page) ── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Contact-hero.jpg"
            alt="Contact background"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Get In Touch
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                Let's Start a
                <br />
                <span className="text-[#8DC53E]">Conversation</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                Have questions about our products, your order, or planning your next adventure? 
                Our team is here to help you gear up for your journey.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <FadeIn delay={0.1}>
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8DC53E]/8 border border-[#8DC53E]/15 text-[#4a8a14] text-[9px] font-black uppercase tracking-[0.22em] mb-4">
                    Send a Message
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">We'd Love to Hear From You</h2>
                  <p className="text-gray-400 text-sm mt-2">Fill out the form and we'll respond within 24 hours.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="Full Name"
                      name="name"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.name}
                      touched={touched.name}
                    />
                    <InputField
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.email}
                      touched={touched.email}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      placeholder="+94 XX XXX XXXX"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.phone}
                      touched={touched.phone}
                    />
                    <InputField
                      label="Subject"
                      name="subject"
                      placeholder="How can we help?"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.subject}
                      touched={touched.subject}
                    />
                  </div>

                  <InputField
                    label="Message"
                    name="message"
                    placeholder="Tell us about your inquiry..."
                    required
                    multiline
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.message}
                    touched={touched.message}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#7ab535] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </FadeIn>

            {/* Contact Information */}
            <div>
              <FadeIn delay={0.2}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8DC53E]/8 border border-[#8DC53E]/15 text-[#4a8a14] text-[9px] font-black uppercase tracking-[0.22em] mb-4">
                  Contact Info
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Get in Touch</h2>
                <p className="text-gray-400 text-sm mb-8">
                  Come visit or connect with us! We're always excited to meet fellow adventurers.
                </p>
              </FadeIn>

              <div className="space-y-3">
                {contactInfo.map((info, i) => (
                  <ContactInfoCard key={info.title} {...info} delay={0.3 + i * 0.1}>
                    {info.content}
                  </ContactInfoCard>
                ))}
              </div>

              {/* Quick Response Card */}
              <FadeIn delay={0.7}>
                <div className="mt-8 p-5 rounded-xl bg-[#8DC53E]/5 border border-[#8DC53E]/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8DC53E]/10 flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-[#8DC53E]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Quick Response</h3>
                      <p className="text-gray-500 text-sm">
                        We typically respond to all inquiries within 2-4 hours during business days.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Map Section */}
              <FadeIn delay={0.8}>
                <div className="mt-8">
                  <div className="rounded-xl overflow-hidden border border-gray-100 h-48">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.945612345678!2d79.86123456789012!3d6.912345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2591234567890%3A0x1234567890abcdef!2sLiberty%20Plaza!5e0!3m2!1sen!2slk!4v1234567890123!5m2!1sen!2slk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title="Store Location"
                    />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white"
            style={{ borderColor: toast.type === "success" ? "#8DC53E30" : "#ef444430" }}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="text-[#8DC53E]" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
            <p className="text-sm font-medium text-gray-800">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;