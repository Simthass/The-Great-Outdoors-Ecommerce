import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Star,
  ShoppingCart,
  Eye,
  ArrowUp,
  Sparkles,
  Package,
  Truck,
  Shield,
  Zap,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const categories = [
    "Backpacks",
    "Climbing",
    "Camping",
    "Fishing",
    "Hiking",
    "Sports Shooting",
    "Outfitting",
    "Hydration",
    "Knives & Multitools",
  ];

  const brands = [
    "Adidas Five",
    "Adidas Terrex",
    "Altra Arborwear",
    "Ariat",
    "Danner",
    "Dockers",
    "Columbia",
    "The North Face",
  ];

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

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
        ) {
          navigate("/login");
        }
        return;
      }
      if (addedItems.includes(productId)) return;

      setAddedItems((p) => [...p, productId]);

      await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true,
        },
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

  let filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category?.categoryName);
    const brandMatch =
      selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const priceMatch =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    return categoryMatch && brandMatch && priceMatch;
  });

  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      default:
        return 0;
    }
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCurrentPage(1);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 100000]);
    setCurrentPage(1);
  };

  const FilterSection = () => (
    <div className="space-y-7">
      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#8DC53E]/5 to-transparent p-5 rounded-2xl border border-[#8DC53E]/15"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
              Active Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-700 shadow-sm"
              >
                {cat}
                <X
                  size={12}
                  className="cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => toggleCategory(cat)}
                />
              </span>
            ))}
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-700 shadow-sm"
              >
                {brand}
                <X
                  size={12}
                  className="cursor-pointer hover:text-red-500 transition-colors"
                  onClick={() => toggleBrand(brand)}
                />
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Categories */}
      <div className="border-b border-gray-100 pb-6">
        <button
          className="flex justify-between items-center w-full text-left group"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 group-hover:text-[#8DC53E] transition-colors">
            Categories
          </h3>
          {categoryOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>
        <AnimatePresence>
          {categoryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-5 space-y-3">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-gray-300 text-[#8DC53E] focus:ring-[#8DC53E] focus:ring-offset-0 transition"
                    />
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brands */}
      <div className="border-b border-gray-100 pb-6">
        <button
          className="flex justify-between items-center w-full text-left group"
          onClick={() => setBrandOpen(!brandOpen)}
        >
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 group-hover:text-[#8DC53E] transition-colors">
            Brands
          </h3>
          {brandOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>
        <AnimatePresence>
          {brandOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-5 space-y-3">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 rounded border-gray-300 text-[#8DC53E] focus:ring-[#8DC53E] focus:ring-offset-0 transition"
                    />
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range */}
      <div className="pb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-5">
          Price Range
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-700">
            Rs. {priceRange[0].toLocaleString()}
          </span>
          <span className="text-sm font-bold text-gray-700">
            Rs. {priceRange[1].toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100000"
          step="1000"
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], parseInt(e.target.value)])
          }
          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#8DC53E]/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8DC53E] animate-spin" />
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }

        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #8DC53E;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(141, 197, 62, 0.3);
          transition: all 0.2s;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          background: #6aab28;
          transform: scale(1.15);
        }
        .slider-thumb::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #8DC53E;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(141, 197, 62, 0.3);
        }

        .product-card {
          transition: all 0.35s cubic-bezier(0.33, 1, 0.68, 1);
        }
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Hero Banner */}
      <div className="relative w-full h-56 md:h-72 bg-gradient-to-br from-[#0d1117] via-[#1a1f2a] to-[#0d1117] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#8DC53E]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#6aab28]/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#8DC53E]/15 text-[#a8e050] border border-[#8DC53E]/25 text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4">
              <Sparkles size={12} /> Premium Outdoor Gear
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-outfit text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight"
          >
            Shop <span className="text-[#8DC53E]">Adventure</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/50 text-sm md:text-base font-jakarta max-w-md mx-auto"
          >
            Discover premium equipment for every outdoor pursuit
          </motion.p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8DC53E]/40 to-transparent" />
      </div>

      <div className="max-w-[1800px] mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all font-jakarta font-medium"
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                <span className="bg-[#8DC53E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {selectedCategories.length + selectedBrands.length}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Filters Sidebar - FIXED: No hover expansion */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-24 border border-gray-100 shadow-sm">
              <FilterSection />
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30 }}
                  className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-outfit text-xl font-black text-gray-900">
                        Filters
                      </h2>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <FilterSection />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-7">
              <div>
                <p className="text-sm text-gray-500 font-jakarta">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {indexOfFirstProduct + 1}-
                    {Math.min(indexOfLastProduct, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-jakarta">
                  Sort by:
                </span>
                <select
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#8DC53E]/20 focus:border-[#8DC53E] transition font-jakarta"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid - 4 per row */}
            {currentProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-gray-50/50 rounded-3xl border border-gray-100"
              >
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-jakarta mb-4">
                  No products found
                </p>
                <button
                  onClick={clearFilters}
                  className="text-[#8DC53E] hover:text-[#6aab28] font-bold text-sm uppercase tracking-wider"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      addedItems={addedItems}
                      handleAddToCart={handleAddToCart}
                      navigate={navigate}
                      API_URL={API_URL}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-14">
                <nav className="inline-flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronDown size={18} className="rotate-90" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-jakarta font-medium text-sm transition-all ${
                          currentPage === pageNum
                            ? "bg-[#8DC53E] text-white shadow-md shadow-[#8DC53E]/30"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-jakarta font-medium text-sm transition-all"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronDown size={18} className="-rotate-90" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Strip */}
      <div className="border-t border-gray-100 mt-8">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "Orders over Rs. 5,000",
              },
              { icon: Shield, title: "Secure Payment", desc: "100% protected" },
              { icon: Zap, title: "Fast Delivery", desc: "2-3 business days" },
              {
                icon: TrendingUp,
                title: "Best Prices",
                desc: "Price match guarantee",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8DC53E]/10 flex items-center justify-center">
                  <item.icon size={18} className="text-[#8DC53E]" />
                </div>
                <div>
                  <p className="font-outfit font-bold text-sm text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 font-jakarta">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-[#8DC53E] text-white rounded-full shadow-lg shadow-[#8DC53E]/30 flex items-center justify-center hover:bg-[#6aab28] transition-all hover:scale-110"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Product Card with Image Slider on Hover
const ProductCard = ({
  product,
  addedItems,
  handleAddToCart,
  navigate,
  API_URL,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

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

  // Auto-slide images on hover
  useEffect(() => {
    let interval;
    if (isHovered && hasMultipleImages) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          if (prev >= images.length - 1) {
            return 0; // Loop back to first image
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, hasMultipleImages, images.length]);

  const getImageUrl = (index) => {
    if (images.length > 0 && images[index]) {
      return `${API_URL.replace("/api", "")}${images[index]}`;
    }
    if (product.imageUrl) {
      return `${API_URL.replace("/api", "")}${product.imageUrl}`;
    }
    return "/products/placeholder.jpg";
  };

  return (
    <div
      className="product-card group bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Image Container with Slider */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div
          className="w-full h-full flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {hasMultipleImages ? (
            images.map((img, idx) => (
              <div
                key={idx}
                className="w-full h-full flex-shrink-0 flex items-center justify-center p-5"
              >
                <img
                  src={getImageUrl(idx)}
                  alt={`${product.productName} - ${idx + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => idx === 0 && setImageLoaded(true)}
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-5">
              <img
                src={getImageUrl(0)}
                alt={product.productName}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-[#8DC53E]/30 border-t-[#8DC53E] animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image Indicators */}
        {hasMultipleImages && isHovered && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? "w-6 bg-[#8DC53E]"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          className={`absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          }`}
        >
          <Eye size={14} className="text-gray-700" />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8DC53E] mb-1 font-jakarta">
          {product.brand || product.category?.categoryName || "Premium Gear"}
        </p>

        <h3
          className="font-outfit font-bold text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8DC53E] transition-colors leading-snug min-h-[2.5rem]"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.productName}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {Array(5)
              .fill()
              .map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200"
                  }
                />
              ))}
          </div>
          <span className="text-[10px] text-gray-400 font-jakarta">
            ({reviewCount})
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="font-outfit font-black text-gray-900 text-lg leading-tight">
              Rs. {product.price.toLocaleString()}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-gray-400 line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          {!isOutOfStock && (
            <button
              onClick={(e) => handleAddToCart(product._id, e)}
              disabled={isAdded}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isAdded
                  ? "bg-green-500 text-white"
                  : "bg-[#8DC53E]/10 text-[#8DC53E] hover:bg-[#8DC53E] hover:text-white"
              }`}
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
