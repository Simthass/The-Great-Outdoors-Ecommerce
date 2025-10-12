// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Award,
  Truck,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BannerSlider from "../components/BannerSlider";
import EventSubscriptionForm from "../components/EventSubscriptionForm";
import ScrollToTop from "../components/ScrollToTop";

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
            "Please log in to add items to cart. Would you like to log in now?"
          )
        ) {
          navigate("/login");
        }
        return;
      }

      if (addedItems.includes(productId)) return;

      setAddedItems((prev) => [...prev, productId]);

      const response = await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true,
        }
      );

      setTimeout(() => {
        setAddedItems((prev) => prev.filter((id) => id !== productId));
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedItems((prev) => prev.filter((id) => id !== productId));

      if (error.response?.status === 401) {
        alert("Please log in to add items to cart");
        navigate("/login");
      } else {
        alert("Failed to add item to cart. Please try again.");
      }
    }
  };

  // Scroll functions for manual control only
  const scrollLeft = (ref) => {
    const container = ref.current;
    if (!container) return;

    const cardWidth = 320;
    const gap = 24;
    const totalCardWidth = cardWidth + gap;

    let newScrollLeft = container.scrollLeft - totalCardWidth;

    // If we're at the start and scrolling left, jump to the end
    if (newScrollLeft <= 0) {
      newScrollLeft = container.scrollWidth - container.clientWidth;
    }

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const scrollRight = (ref) => {
    const container = ref.current;
    if (!container) return;

    const cardWidth = 320;
    const gap = 24;
    const totalCardWidth = cardWidth + gap;

    let newScrollLeft = container.scrollLeft + totalCardWidth;

    // If we're at the end and scrolling right, jump to the start
    if (newScrollLeft >= container.scrollWidth - container.clientWidth) {
      newScrollLeft = 0;
    }

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const categories = [
    {
      name: "Sports Shooting",
      image: "/Shop-hunting.jpg",
      description: "Precision gear for shooting sports enthusiasts",
      color: "from-blue-500/10 to-blue-600/10",
      borderColor: "hover:border-blue-400",
    },
    {
      name: "Camping",
      image: "/Shop-camping.jpg",
      description: "Everything for your outdoor camping adventures",
      color: "from-green-500/10 to-green-600/10",
      borderColor: "hover:border-green-400",
    },
    {
      name: "Fishing",
      image: "/Shop-fishing.jpg",
      description: "Premium fishing equipment and accessories",
      color: "from-cyan-500/10 to-cyan-600/10",
      borderColor: "hover:border-cyan-400",
    },
    {
      name: "Climbing",
      image: "/Shop-climbing.jpg",
      description: "Gear for climbing and mountaineering",
      color: "from-orange-500/10 to-orange-600/10",
      borderColor: "hover:border-orange-400",
    },
  ];

  const hotProducts = products.filter((product) => product.isHotThisWeek);
  const featuredProducts = products.filter((product) => product.isFeatured);

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-64"
        data-testid="home-loading"
      >
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div data-testid="home-page" className="bg-gray-50/30">
      {/* Category Tiles */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-3">
              <span className="text-xs font-bold tracking-[0.2em] text-[#8DC53E] uppercase">
                Explore Our Collections
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Discover premium gear tailored for every outdoor adventure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(`/shop?category=${category.name}`)}
                className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 transform group-hover:translate-y-[-4px] transition-transform duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/90 mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {category.description}
                    </p>

                    {/* CTA Button */}
                    <div className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#8DC53E] hover:text-white">
                      <span>Explore Collection</span>
                      <ArrowRight
                        size={16}
                        className="transform group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#8DC53E] rounded-2xl transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot This Week - Manual Scroll Only */}
      <section
        id="hot-this-week"
        className="py-16 lg:py-20 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-[#8DC53E]/10 text-[#8DC53E] px-6 py-2 rounded-full text-sm font-semibold mb-4">
              <div className="w-2 h-2 bg-[#8DC53E] rounded-full animate-pulse" />
              🔥 Trending Now
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Hot This <span className="text-[#8DC53E]">Week</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover this week's most popular outdoor gear and accessories
            </p>
          </motion.div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            {hotProducts.length > 4 && (
              <>
                <button
                  onClick={() => scrollLeft(hotProductsRef)}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hidden lg:flex items-center justify-center"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <button
                  onClick={() => scrollRight(hotProductsRef)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hidden lg:flex items-center justify-center"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
              </>
            )}

            <div
              ref={hotProductsRef}
              className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              data-testid="hot-grid"
            >
              {hotProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-80" // 320px width for 4 products per row
                >
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

      {/* Banner Slider */}
      <section className="py-6 lg:py-10 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm"
            data-testid="banner-slider"
          >
            <BannerSlider />
          </motion.div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="py-10 lg:py-10 bg-gray-900 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Award,
                title: "Best Price Guarantee",
                description: "100% authentic products with price match",
                color: "text-blue-400",
              },
              {
                icon: Truck,
                title: "Free Shipping",
                description: "On all orders over Rs. 5,000",
                color: "text-green-400",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "SSL encrypted checkout process",
                color: "text-purple-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <feature.icon size={24} className={feature.color} />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#8DC53E] to-[#7db434]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            data-testid="subscription-section"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image Side */}
              <div className="relative h-64 lg:h-auto">
                <img
                  src="/Subs-Home.jpg"
                  alt="Outdoor Adventure Community"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 bg-[#8DC53E] text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/20">
                  🏔️ Join 10,000+ Adventurers
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent lg:bg-gradient-to-t" />
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12">
                <div className="inline-flex items-center gap-2 bg-[#8DC53E]/10 text-[#8DC53E] px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  📧 Stay Updated
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
                  Never Miss an{" "}
                  <span className="text-[#8DC53E]">Adventure</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Be the first to know about hiking trips, camping adventures,
                  climbing expeditions, fishing tours, and outdoor workshops.
                  Join our community of outdoor enthusiasts!
                </p>

                <div data-testid="subscription-form">
                  <EventSubscriptionForm />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products - Manual Scroll Only */}
      <section className="py-16 lg:py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-[#8DC53E]/10 text-[#8DC53E] px-6 py-2 rounded-full text-sm font-semibold mb-4">
              ⭐ Featured Selection
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Featured <span className="text-[#8DC53E]">Products</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of our finest outdoor equipment and gear
            </p>
          </motion.div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            {featuredProducts.length > 4 && (
              <>
                <button
                  onClick={() => scrollLeft(featuredProductsRef)}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hidden lg:flex items-center justify-center"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <button
                  onClick={() => scrollRight(featuredProductsRef)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hidden lg:flex items-center justify-center"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
              </>
            )}

            <div
              ref={featuredProductsRef}
              className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              data-testid="featured-grid"
            >
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-80" // 320px width for 4 products per row
                >
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

      {/* Customer Reviews */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/Review-BG.png')] bg-cover bg-center opacity-80" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-[#8DC53E]/20 text-[#8DC53E] px-6 py-2 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-[#8DC53E]/30">
              💬 Customer Voices
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              What Our <span className="text-[#FFA81D]">Customers Say</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join thousands of satisfied adventurers who trust our gear
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {homeReviews.slice(0, 3).map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-[#FFA81D]/30 transition-all duration-300 group"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <img
                      src={
                        review.customerImage
                          ? `${API_URL.replace("/api", "")}${
                              review.customerImage
                            }`
                          : "/default-avatar.png"
                      }
                      alt={review.customerName}
                      className="h-20 w-20 rounded-full border-4 border-white/20 group-hover:border-[#FFA81D] transition-all duration-300 object-cover mx-auto"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FFA81D] rounded-full border-2 border-white flex items-center justify-center">
                      <Star size={12} className="text-white fill-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2">
                    {review.customerName}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {review.customerTitle}
                  </p>

                  <div className="flex justify-center mb-6">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={`mr-1 ${
                            i < review.rating
                              ? "text-[#FFA81D] fill-[#FFA81D]"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                  </div>

                  <p className="text-gray-200 leading-relaxed text-sm">
                    {review.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add custom scrollbar hiding styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Product Card Component - Removed image carousel animation
const ProductCard = ({
  product,
  addedItems,
  handleAddToCart,
  navigate,
  API_URL,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate average rating and review count
  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviewCount
      : 0;

  const isOutOfStock =
    product.stockStatus === "out_of_stock" ||
    (product.inventory && product.inventory.quantity === 0);
  const isAdded = addedItems.includes(product._id);

  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      return `${API_URL.replace("/api", "")}${product.images[0]}`;
    }
    if (product.imageUrl) {
      return `${API_URL.replace("/api", "")}${product.imageUrl}`;
    }
    return "/products/placeholder.jpg";
  };

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`prod-card-${product._id}`}
    >
      {/* Image Container - Single static image */}
      <div
        className="relative aspect-square overflow-hidden bg-white"
        onClick={() => navigate(`/product/${product._id}`)}
        data-testid={`prod-img-wrap-${product._id}`}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={getImageUrl()}
            alt={product.productName}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            data-testid={`prod-img-${product._id}`}
          />
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
            <span className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold text-gray-900">
              Out of Stock
            </span>
          </div>
        )}

        {/* Add to Cart Button - Shows on Hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 md:p-4 transition-all duration-300 ${
            isHovered && !isOutOfStock
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <button
            onClick={(e) => handleAddToCart(product._id, e)}
            disabled={isAdded || isOutOfStock}
            className={`w-full py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 shadow-lg ${
              isAdded
                ? "bg-green-600 text-white"
                : "bg-[#8DC53E] text-white hover:bg-[#7AB535]"
            }`}
            data-testid={`prod-add-${product._id}`}
          >
            {isAdded ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 flex flex-col flex-grow">
        {/* Product Name */}
        <h3
          className="text-xs md:text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8DC53E] transition-colors min-h-[2rem] md:min-h-[2.5rem]"
          onClick={() => navigate(`/product/${product._id}`)}
          data-testid={`prod-name-${product._id}`}
        >
          {product.productName}
        </h3>

        {/* Rating and Reviews */}
        <div
          className="flex items-center gap-2 mb-2 md:mb-3"
          data-testid={`prod-stars-${product._id}`}
        >
          <div className="flex items-center gap-0.5">
            {Array(5)
              .fill()
              .map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  data-testid={`prod-star-${product._id}-${i + 1}`}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <p
            className="text-base md:text-lg lg:text-xl font-bold text-gray-900"
            data-testid={`prod-price-${product._id}`}
          >
            Rs. {product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
