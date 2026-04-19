import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { homeContentService } from "../../services/homeContent.service";

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const [heroSlides, setHeroSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const STATIC_BASE_URL =
    import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  const currentLanguage = i18n.language || "en";

  useEffect(() => {
    try {
      const categoriesArray = t("categories", { returnObjects: true });

      if (Array.isArray(categoriesArray) && categoriesArray.length > 0) {
        setCategories(categoriesArray);
      } else {
        // Fallback to default categories if translation returns empty
        setCategories(getDefaultCategories());
      }
    } catch (error) {
      console.error("Error loading categories from translations:", error);
      setCategories(getDefaultCategories());
    }
  }, [currentLanguage, t]);

  // Default fallback categories
  const getDefaultCategories = () => [
    {
      id: "boa-fabric",
      name: "BOA FABRIC",
      iconUrl: "/categories/fabric.png",
      link: "/products?category=boa-fabric",
      color: "from-[#973C49] to-[#B54C5C]",
    },
    {
      id: "toys",
      name: "TOYS",
      iconUrl: "/categories/toys.png",
      link: "/products?category=toys",
      color: "from-[#2C5282] to-[#4299E1]",
    },
    {
      id: "buttons",
      name: "BUTTONS",
      iconUrl: "/categories/button.png",
      link: "/products?category=buttons",
      color: "from-[#805AD5] to-[#9F7AEA]",
    },
    {
      id: "accessories",
      name: "ACCESSORIES",
      iconUrl: "/categories/accessories.png",
      link: "/products?category=accessories",
      color: "from-[#D69E2E] to-[#ECC94B]",
    },
    {
      id: "wholesale",
      name: "WHOLESALE",
      iconUrl: "/categories/wholesale.png",
      link: "/wholesale",
      color: "from-[#276749] to-[#48BB78]",
    },
  ];

  // Fetch hero slides with language parameter
  const fetchHeroContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await homeContentService.getHeroSlides(currentLanguage);

      if (response.success) {
        const slides = response.data.slides || [];
        setHeroSlides(slides);
      } else {
        console.log("Using fallback hero slides");
        setHeroSlides(getStaticSlides());
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
      setError("Failed to load hero content");
      setHeroSlides(getStaticSlides());
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    fetchHeroContent();
  }, [fetchHeroContent]);

  // Static data fallback
  const getStaticSlides = () => [
    {
      _id: "1",
      title: "Professional Grade Fabrics",
      subtitle: "Trusted by experts, chosen for quality.",
      buttonText: "Explore Collection",
      imageUrl: "/HeroN7.jpg",
      isActive: true,
      order: 0,
    },
  ];

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxOTIwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE5MjAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjFGNUY5Ii8+Cjx0ZXh0IHg9Ijk2MCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `${STATIC_BASE_URL}${imageUrl}`;
    }

    return `${STATIC_BASE_URL}/uploads/hero/${imageUrl}`;
  };

  const goToNextSlide = useCallback(() => {
    if (heroSlides.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsTransitioning(false);
    }, 500);
  }, [heroSlides.length]);

  // Auto slide
  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      goToNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length, goToNextSlide]);

  // Format title with line breaks
  const formatText = (text) => {
    if (!text) return "";
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Create language-aware link
  const createLanguageLink = (path) => {
    return `/${currentLanguage}${path}`;
  };

  if (loading) {
    return (
      <div className="relative w-full h-96 bg-gray-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#973C49]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchHeroContent}
            className="mt-4 bg-[#973C49] text-white px-4 py-2 rounded hover:bg-[#7A2F3A]"
          >
            {t("common.retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (heroSlides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full">
      <div className="relative">
        {/* Slides Container */}
        <div className="relative h-96 md:h-125 lg:h-150 overflow-hidden">
          {heroSlides.map((slide, index) => {
            const imageUrl = getImageUrl(slide.imageUrl);

            return (
              <div
                key={slide._id || index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "-translate-x-full opacity-0"
                    : "translate-x-full opacity-0"
                }`}
              >
                <div className="absolute inset-0">
                  <img
                    src={imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load hero image:`, {
                        attemptedUrl: imageUrl,
                        slide: slide,
                        error: e,
                      });
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxOTIwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE5MjAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjFGNUY5Ii8+Cjx0ZXh0IHg9Ijk2MCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4=";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/20 to-transparent"></div>
                </div>

                <div className="absolute inset-0 flex items-center z-10">
                  <div className="w-full">
                    <div className="pl-6 md:pl-12 lg:pl-20 pr-4 max-w-3xl">
                      <h1
                        className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl transition-all duration-700 ${
                          index === currentSlide && !isTransitioning
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                      >
                        {formatText(slide.title)}
                      </h1>

                      <h2
                        className={`text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight mb-8 drop-shadow-xl transition-all duration-700 delay-150 ${
                          index === currentSlide && !isTransitioning
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                      >
                        {formatText(slide.subtitle)}
                      </h2>

                      <div
                        className={`transition-all duration-700 delay-300 ${
                          index === currentSlide && !isTransitioning
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                      >
                        <Link
                          to={createLanguageLink("/products")}
                          className="inline-flex items-center gap-2 bg-[#973C49] hover:bg-[#7A2F3A] text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg group"
                        >
                          {slide.buttonText || "Shop Now"}
                          <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows */}
          {heroSlides.length > 1 && (
            <>
              <button
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentSlide((prev) =>
                      prev === 0 ? heroSlides.length - 1 : prev - 1
                    );
                    setIsTransitioning(false);
                  }, 500);
                }}
                className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label={t("common.previous") || "Previous slide"}
              >
                <svg
                  className="w-6 h-6"
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
                onClick={goToNextSlide}
                className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                aria-label={t("common.next") || "Next slide"}
              >
                <svg
                  className="w-6 h-6"
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

          {/* Slide Indicators */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index === currentSlide) return;
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsTransitioning(false);
                    }, 500);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`${t("common.goToSlide") || "Go to slide"} ${
                    index + 1
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="relative z-20 -mt-16">
          <div className="flex justify-center items-center flex-wrap gap-6 md:gap-10 lg:gap-12">
            {categories.map((category, index) => (
              <Link
                key={category.id || index}
                to={createLanguageLink(category.link)}
                className="group flex flex-col items-center transition-all duration-500 hover:scale-110"
              >
                <div className="relative">
                  <div className="absolute -inset-3 bg-linear-to-r from-white/30 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32">
                    <div className="absolute inset-0 bg-white rounded-full shadow-xl group-hover:shadow-2xl transition-shadow duration-300"></div>

                    <div
                      className={`absolute inset-0 rounded-full p-1 bg-linear-to-r ${category.color}`}
                    >
                      <div className="w-full h-full bg-white rounded-full"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center p-5 md:p-6 lg:p-7">
                      <img
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-500"
                        onError={(e) => {
                          console.error(
                            `Failed to load icon: ${category.iconUrl}`
                          );
                          e.target.onerror = null;
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjFGNUY5Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPjwvdGV4dD4KPC9zdmc+";
                        }}
                      />
                    </div>

                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <div className="w-8 h-1.5 rounded-full bg-linear-to-r from-[#973C49] to-[#B54C5C] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>

                <span className="mt-4 text-sm md:text-base font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#973C49] transition-colors duration-300 whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-white to-transparent pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;