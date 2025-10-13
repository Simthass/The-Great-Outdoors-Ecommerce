import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems] = useState([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

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
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q") || "";
    setSearchQuery(query);

    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }

    window.scrollTo(0, 0);
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search/products`, {
        params: { q: query },
      });

      if (response.data.success) {
        setProducts(response.data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands, priceRange, sortBy]);

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

      setAddedItems((p) => [...p, productId]);

      const response = await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true,
        }
      );

      console.log("Added to cart:", response.data);

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

  // Filter and sort products
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
      case "featured":
      default:
        return 0;
    }
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 100000]);
    setCurrentPage(1);
  };

  const truncateSearchQuery = (query, maxLength = 30) => {
    if (query.length <= maxLength) return query;
    return query.substring(0, maxLength) + "...";
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Active Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700"
              >
                {cat}
                <X
                  size={14}
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => toggleCategory(cat)}
                />
              </span>
            ))}
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700"
              >
                {brand}
                <X
                  size={14}
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => toggleBrand(brand)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Product Categories */}
      <div className="border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Categories
          </h3>
          {categoryOpen ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </button>
        {categoryOpen && (
          <div className="mt-4 space-y-3">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4 text-[#8DC53E] focus:ring-2 focus:ring-[#8DC53E] border-gray-300 rounded transition"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition">
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter by Brands */}
      <div className="border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => setBrandOpen(!brandOpen)}
        >
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Brands
          </h3>
          {brandOpen ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </button>
        {brandOpen && (
          <div className="mt-4 space-y-3">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 text-[#8DC53E] focus:ring-2 focus:ring-[#8DC53E] border-gray-300 rounded transition"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="pb-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Price Range
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Rs. {priceRange[0].toLocaleString()}
          </span>
          <span className="text-sm font-medium text-gray-700">
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
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC53E] mx-auto mb-4"></div>
          <p className="text-gray-600">Searching products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url(/page-name.png)] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
            {searchQuery
              ? `Search: "${truncateSearchQuery(searchQuery)}"`
              : "Search Results"}
          </h1>
          <p className="text-gray-200 text-sm md:text-base">
            {filteredProducts.length} products found
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <SlidersHorizontal size={18} />
              <span className="font-medium">Filters</span>
              {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                <span className="bg-[#8DC53E] text-white text-xs px-2 py-1 rounded-full">
                  {selectedCategories.length + selectedBrands.length}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <FilterSection />
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setMobileFiltersOpen(false)}
              ></div>
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <FilterSection />
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="flex-1">
            {/* Results Count and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent transition"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-24 w-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? `No products found for "${searchQuery}". Try adjusting your search or filters.`
                    : "Start searching to find products."}
                </p>
                {(selectedCategories.length > 0 ||
                  selectedBrands.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[#8DC53E] hover:text-[#7AB535] font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 md:gap-6">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    addedItems={addedItems}
                    handleAddToCart={handleAddToCart}
                    navigate={navigate}
                    API_URL={API_URL}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="inline-flex rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-300 transition ${
                          currentPage === number
                            ? "bg-[#8DC53E] text-white border-[#8DC53E] hover:bg-[#7AB535]"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8dc53e;
          cursor: pointer;
          transition: all 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          background: #7ab535;
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8dc53e;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .slider::-moz-range-thumb:hover {
          background: #7ab535;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

// Product Card Component (same as Shop page)
const ProductCard = ({
  product,
  addedItems,
  handleAddToCart,
  navigate,
  API_URL,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviewCount
      : 0;

  useEffect(() => {
    let interval;
    if (isHovered && hasMultipleImages) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          if (prev >= images.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, hasMultipleImages, images.length]);

  const isOutOfStock =
    product.stockStatus === "out_of_stock" ||
    (product.inventory && product.inventory.quantity === 0);
  const isAdded = addedItems.includes(product._id);

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
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-white"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {/* Image Slider */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
          }}
        >
          {hasMultipleImages ? (
            images.map((img, idx) => (
              <div
                key={idx}
                className="w-full h-full flex-shrink-0 flex items-center justify-center p-4"
              >
                <img
                  src={getImageUrl(idx)}
                  alt={`${product.productName} - ${idx + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex-shrink-0 flex items-center justify-center p-4">
              <img
                src={getImageUrl(0)}
                alt={product.productName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
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
          >
            {isAdded ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>

        {/* Image Indicators */}
        {hasMultipleImages && isHovered && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? "w-6 bg-[#8DC53E]"
                    : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 flex flex-col flex-grow">
        {/* Product Name */}
        <h3
          className="text-xs md:text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8DC53E] transition-colors min-h-[2rem] md:min-h-[2.5rem]"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.productName}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-2 md:mb-3">
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
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <p className="text-base md:text-lg lg:text-xl font-bold text-gray-900">
            Rs. {product.price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
