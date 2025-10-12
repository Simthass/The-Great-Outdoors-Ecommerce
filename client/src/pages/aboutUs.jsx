import React from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  return (
    <section data-testid="about-page" className="bg-white">
      {/* Hero Section */}

      <div
        data-testid="about-hero"
        className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center "
      >
        <p
          data-testid="about-hero-title"
          className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]"
        >
          About Us
        </p>
      </div>

      {/* Mission Statement */}
      <div
        className="max-w-6xl mx-auto px-6 py-20"
        data-testid="about-tagline-block"
      >
        <div className="text-center mb-16">
          <h2
            data-testid="about-tagline"
            className="text-4xl md:text-5xl font-light text-gray-800 leading-tight mb-8"
          >
            Fueling Your Adventures with Passion{" "}
            <br className="hidden md:block" />
            and Relentless Outdoor Spirit
          </h2>
          <div className="w-20 h-1 bg-[#8DC53E] mx-auto"></div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="/About us.png"
            alt="Adventure team in nature"
            data-testid="about-hero-image"
            className="w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Inception Vision */}
            <div
              className="flex flex-col md:flex-row items-start gap-8 group"
              data-testid="about-inception-section"
            >
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 bg-[#8DC53E] rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3
                  data-testid="about-inception-title"
                  className="text-2xl font-semibold text-gray-800 mb-4"
                >
                  Our Vision
                </h3>
                <p
                  data-testid="about-inception-text"
                  className="text-gray-600 leading-relaxed text-lg"
                >
                  Founded by passionate outdoor enthusiasts, we set out to
                  redefine adventure gear. Our vision is to equip every explorer
                  with reliable, sustainable, and innovative gear that enhances
                  their connection with nature while minimizing environmental
                  impact.
                </p>
              </div>
            </div>

            {/* Commitment */}
            <div
              className="flex flex-col md:flex-row items-start gap-8 group"
              data-testid="about-commitment-section"
            >
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 bg-[#8DC53E] rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3
                  data-testid="about-commitment-title"
                  className="text-2xl font-semibold text-gray-800 mb-4"
                >
                  Our Commitment
                </h3>
                <p
                  data-testid="about-commitment-text"
                  className="text-gray-600 leading-relaxed text-lg"
                >
                  We're committed to sustainable practices, ethical
                  manufacturing, and creating gear that lasts. Every product is
                  designed with attention to detail, tested in real conditions,
                  and backed by our lifetime warranty promise.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-[#8DC53E] mb-2">10K+</div>
              <div className="text-gray-600">Happy Adventurers</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-[#8DC53E] mb-2">200+</div>
              <div className="text-gray-600">Products Available</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-[#8DC53E] mb-2">15</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-[#8DC53E] mb-2">100%</div>
              <div className="text-gray-600">Satisfaction Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="py-20 bg-white" data-testid="about-reviews">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold text-gray-800 mb-4"
              data-testid="about-reviews-title"
            >
              What Adventurers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied explorers who trust our gear for their
              most challenging adventures
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                name: "Sarah Chen",
                role: "Mountain Guide",
                image: "/AK.jpg",
                text: "The durability of this gear is unmatched. Survived the toughest Himalayan conditions with ease.",
                rating: 5,
              },
              {
                id: 2,
                name: "Marcus Rivera",
                role: "Wildlife Photographer",
                image: "/prabhas.jpg",
                text: "Lightweight yet incredibly sturdy. Perfect for long expeditions where every gram counts.",
                rating: 5,
              },
              {
                id: 3,
                name: "Elena Petrova",
                role: "Arctic Explorer",
                image: "/vijay.png",
                text: "Exceptional quality and attention to detail. This gear has never let me down in extreme conditions.",
                rating: 5,
              },
              {
                id: 4,
                name: "James Wilson",
                role: "National Geographic",
                image: "/rajini.jpg",
                text: "Sustainable materials and superior craftsmanship. Exactly what modern explorers need.",
                rating: 5,
              },
              {
                id: 5,
                name: "Lisa Zhang",
                role: "Rock Climbing Pro",
                image: "/dhanush.jpg",
                text: "Innovative designs that actually work. The comfort and functionality are game-changing.",
                rating: 5,
              },
              {
                id: 6,
                name: "David Kim",
                role: "Adventure Film Maker",
                image: "/Surya.jpg",
                text: "Reliable gear that performs when it matters most. My go-to for all major expeditions.",
                rating: 5,
              },
            ].map((review) => (
              <div
                key={review.id}
                data-testid={`review-card-${review.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={review.image}
                    alt={review.name}
                    data-testid={`review-image-${review.id}`}
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#8DC53E]/20"
                  />
                  <div className="ml-4">
                    <h4
                      data-testid={`review-name-${review.id}`}
                      className="text-xl font-semibold text-gray-800"
                    >
                      {review.name}
                    </h4>
                    <p
                      data-testid={`review-role-${review.id}`}
                      className="text-[#8DC53E] font-medium"
                    >
                      {review.role}
                    </p>
                  </div>
                </div>

                <div
                  data-testid={`review-stars-${review.id}`}
                  className="flex mb-4"
                >
                  {Array(review.rating)
                    .fill()
                    .map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-[#FFA81D] mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                      </svg>
                    ))}
                </div>

                <p
                  data-testid={`review-text-${review.id}`}
                  className="text-gray-600 leading-relaxed"
                >
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#8DC53E] to-[#7AB82E] py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our community of explorers and experience the difference with
            gear designed for the wild.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-white text-[#8DC53E] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
              onClick={() => (window.location.href = "/#hot-this-week")}
            >
              Explore Our Gear
            </button>
            <button
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors duration-300 cursor-pointer"
              onClick={() => navigate(`/contactus`)}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
