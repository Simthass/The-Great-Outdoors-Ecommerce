import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Users,
  Package,
  Award,
  Shield,
  Leaf,
  Compass,
  TrendingUp,
  Star,
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

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, icon: Icon, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-[#8DC53E]/10 flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-[#8DC53E]" />
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  </FadeIn>
);

// ── Value Card ───────────────────────────────────────────────────────────────
const ValueCard = ({ title, description, icon: Icon, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#8DC53E]/20 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-[#8DC53E]/10 flex items-center justify-center mb-4 group-hover:bg-[#8DC53E] transition-colors duration-300">
        <Icon size={22} className="text-[#8DC53E] group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  </FadeIn>
);

// ── Review Card ──────────────────────────────────────────────────────────────
const ReviewCard = ({ name, location, role, text, rating, image, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border-2 border-[#8DC53E]/20"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8DC53E&color=fff`;
          }}
        />
        <div>
          <h4 className="text-sm font-bold text-gray-900">{name}</h4>
          <p className="text-xs text-gray-400">{role}</p>
          <p className="text-[10px] text-[#8DC53E] font-medium mt-0.5">{location}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-3">
        {Array(rating).fill().map((_, i) => (
          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">"{text}"</p>
    </div>
  </FadeIn>
);

// ── Main About Page ──────────────────────────────────────────────────────────
const About = () => {
  const navigate = useNavigate();
  ScrollToTop();

  const stats = [
    { value: "10K+", label: "Happy Adventurers", icon: Users },
    { value: "200+", label: "Premium Products", icon: Package },
    { value: "15", label: "Years Experience", icon: Award },
    { value: "100%", label: "Satisfaction", icon: Shield },
  ];

  const values = [
    {
      title: "Quality First",
      description: "Every product is tested in real conditions before it reaches our shelves.",
      icon: Shield,
    },
    {
      title: "Sustainability",
      description: "Committed to eco-friendly materials and ethical manufacturing.",
      icon: Leaf,
    },
    {
      title: "Expert Knowledge",
      description: "Our team lives and breathes outdoor adventure every day.",
      icon: Compass,
    },
    {
      title: "Community Driven",
      description: "Built by explorers, for explorers. Your feedback shapes our gear.",
      icon: TrendingUp,
    },
  ];

  // Mix of Sri Lankan and international adventurers
  const reviews = [
    {
      name: "Nuwan Perera",
      location: "Kandy, Sri Lanka",
      role: "Mountain Guide",
      text: "The gear from TGO has been my trusted companion on every Knuckles hike. Durable, comfortable, and built for our tropical terrain.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Sarah Chen",
      location: "Singapore",
      role: "Trail Runner",
      text: "I discovered TGO during my Sri Lanka trip. Their equipment quality rivals top international brands at better prices.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      name: "Dilani Fernando",
      location: "Colombo, Sri Lanka",
      role: "Camping Enthusiast",
      text: "The camping gear is fantastic! Spent a week in Yala and everything held up perfectly. Highly recommend!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Marcus Rodriguez",
      location: "Spain",
      role: "Wildlife Photographer",
      text: "Lightweight yet incredibly sturdy. Perfect for long expeditions where every gram counts. TGO never disappoints.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      name: "Amal Wickramasinghe",
      location: "Nuwara Eliya, Sri Lanka",
      role: "Adventure Club Lead",
      text: "We've outfitted our entire adventure club with TGO gear. Exceptional value and outstanding customer service.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    {
      name: "Elena Volkov",
      location: "Russia",
      role: "Arctic Explorer",
      text: "I've tested gear in extreme cold conditions. TGO's thermal technology is impressive and reliable.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/89.jpg",
    },
  ];

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section - Updated with Climbing Photo */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
        </div>
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Our Story
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                Fueling Adventures
                <br />
                <span className="text-[#8DC53E]">Since 2010</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                We're passionate explorers on a mission to equip every adventurer with reliable, 
                sustainable gear that enhances their connection with nature.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Mission Statement */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8DC53E]/8 border border-[#8DC53E]/15 text-[#4a8a14] text-[9px] font-black uppercase tracking-[0.22em] mb-4">
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-6">
                To inspire and equip{" "}
                <span className="text-[#8DC53E]">every outdoor journey</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
                Founded by passionate outdoor enthusiasts, we set out to redefine adventure gear. 
                Every product is designed with attention to detail, tested in real conditions, 
                and backed by our commitment to quality and sustainability.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className={PX}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          <SectionHead
            eyebrow="What We Believe"
            title="Our Core"
            accent="Values"
            sub="The principles that guide everything we do"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <ValueCard key={value.title} {...value} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Image Section - Climbing Photo */}
      <section className="relative overflow-hidden">
        <div className="relative h-[400px] md:h-[500px]">
          <img
            src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1600&h=500&fit=crop"
            alt="Rock climber on mountain cliff"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 text-center pb-12">
            <FadeIn>
              <p className="text-white/80 text-sm tracking-wider mb-2">EXPERIENCE THE DIFFERENCE</p>
              <p className="text-white text-xl md:text-2xl font-medium max-w-2xl mx-auto px-4">
                "Gear designed for the wild, tested by the boldest explorers"
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Customer Reviews (Sri Lankan + International) */}
      <section className={`${SECTION_PY} bg-gray-50`}>
        <div className={PX}>
          <SectionHead
            eyebrow="Testimonials"
            title="What Adventurers"
            accent="Say"
            sub="Join thousands of satisfied explorers from Sri Lanka and around the world who trust our gear"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ReviewCard key={review.name} {...review} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#8DC53E]">
        <div className={PX}>
          <FadeIn className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-white/80 text-base max-w-md mx-auto mb-6">
              Join our community of explorers and experience the difference
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/shop")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#8DC53E] text-xs font-bold uppercase tracking-wide hover:bg-gray-100 transition-all"
              >
                Shop Now <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate("/contactus")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white text-xs font-bold uppercase tracking-wide hover:bg-white/10 transition-all"
              >
                Contact Us
              </button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default About;