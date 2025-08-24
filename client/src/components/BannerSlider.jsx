// components/BannerSlider.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="w-full h-90 bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
        <div className="text-lg text-gray-500">Loading banners...</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-lg text-gray-500">No banners available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
      {/* Banner Images Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner._id} className="w-full flex-shrink-0 relative">
            <img
              src={`${API_URL.replace("/api", "")}${banner.imageUrl}`}
              alt={banner.title || `Banner ${index + 1}`}
              className="w-full h-auto object-cover block"
              style={{
                maxHeight: "700px", // Set maximum height to prevent extremely tall images
                minHeight: "300px", // Set minimum height for consistency
              }}
            />

            {/* Optional overlay with title and description */}
            {(banner.title || banner.description) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-start p-8">
                <div className="text-left text-white max-w-2xl">
                  {banner.title && (
                    <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                      {banner.title}
                    </h2>
                  )}
                  {banner.description && (
                    <p className="text-sm md:text-lg drop-shadow-lg opacity-90">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/60 hover:bg-white/80 hover:scale-110"
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{
            width:
              banners.length > 1
                ? `${((currentSlide + 1) / banners.length) * 100}%`
                : "100%",
          }}
        />
      </div>
    </div>
  );
};

export default BannerSlider;
