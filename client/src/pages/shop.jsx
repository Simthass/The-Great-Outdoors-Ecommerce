import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import ScrollToTop from "../components/ScrollToTop";

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9); // Changed to 9 for better 3x3 grid
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category");
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [sortBy, setSortBy] = useState("featured");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  // Sample categories and brands (replace with your actual data)
  const categories = [
    "Backpacks",
    "Climbing",
    "Camping",
    "Fishing",
    "Hiking",
    "Hunting",
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
    window.scrollTo(0, 0, { behavior: "smooth" }); // Scroll to top when component mounts
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0, { behavior: "smooth" }); // Scroll to top when search params change
  }, [location.search]);

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

  const handleAddToCart = async (productId) => {
    try {
      // Check if user is logged in
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

      // Prevent duplicate clicks
      if (addedItems.includes(productId)) return;

      // Optimistically update UI
      setAddedItems([...addedItems, productId]);

      const response = await axios.post(
        `${API_URL}/cart/add`,
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          withCredentials: true,
        }
      );

      console.log("Added to cart:", response.data);

      // Reset the button state after 2 seconds
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
    // Category filter
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category?.categoryName);

    // Brand filter
    const brandMatch =
      selectedBrands.length === 0 || selectedBrands.includes(product.brand);

    // Price filter
    const priceMatch =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return categoryMatch && brandMatch && priceMatch;
  });

  // Apply sorting
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
        return 0; // Keep original order for featured
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Shop</p>
      </div>

      <div
        className="flex py-10"
        style={{ marginLeft: "75px", marginRight: "30px" }}
      >
        {/* Filters Sidebar */}
        <div className="w-[300px] flex-shrink-0 mr-8">
          {/* Product Categories */}
          <div className="mb-6">
            <hr className="mb-4" />
            <div
              className="flex justify-between items-center cursor-pointer mb-4"
              onClick={() => setCategoryOpen(!categoryOpen)}
            >
              <h3 className="text-lg font-semibold text-black">
                Product Categories
              </h3>
              {categoryOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {categoryOpen && (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`cat-${category}`}
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                    />
                    <label
                      htmlFor={`cat-${category}`}
                      className="text-black text-sm cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter by Brands */}
          <div className="mb-6">
            <hr className="mb-4" />
            <div
              className="flex justify-between items-center cursor-pointer mb-4"
              onClick={() => setBrandOpen(!brandOpen)}
            >
              <h3 className="text-lg font-semibold text-black">
                Filter by Brands
              </h3>
              {brandOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {brandOpen && (
              <div className="space-y-3">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="text-black text-sm cursor-pointer"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <hr className="mb-4" />
            <h3 className="text-lg font-semibold mb-4 text-black">
              Price Range
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Rs. {priceRange[0]}</span>
              <span className="text-sm text-gray-600">Rs. {priceRange[1]}</span>
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

        {/* Products Section */}
        <div className="flex-1">
          {/* Results Count and Sort */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600 text-sm">
              Showing {indexOfFirstProduct + 1}-
              {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </p>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2 text-sm">Sort by:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
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

          {/* Products Grid - Updated width */}
          <div className="grid grid-cols-3 gap-0">
            {currentProducts.map((product) => (
              <div
                key={product._id}
                className="pl-[30px] pr-[30px] border-l-[0.2px] border-r-[0.2px] border-black border-t-0 border-b-0 hover:border-t-[0.2px] hover:border-b-[0.2px] w-[340px] h-[440px] mb-8 flex flex-col"
              >
                <div
                  style={{ width: "300px", height: "205px" }}
                  className="flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={
                      product.imageUrl
                        ? `${API_URL.replace("/api", "")}${product.imageUrl}`
                        : "/products/placeholder.jpg"
                    }
                    alt={product.productName}
                    className="h-full w-auto object-cover pt-[20px] hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Updated Product Name with 2-line truncation */}
                <div className="mt-[30px] h-[48px] overflow-hidden">
                  <p
                    className="text-[15px] text-left leading-relaxed line-clamp-2 cursor-pointer hover:text-green-600 transition-colors"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.productName}
                  </p>
                </div>

                <div className="flex mt-[15px]">
                  {Array(5)
                    .fill()
                    .map((_, i) => (
                      <svg
                        key={i}
                        className="w-[15px] h-[15px] text-yellow-500 mr-[2px]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                      </svg>
                    ))}
                </div>

                {/* This div will push the content below to the bottom */}
                <div className="mt-5"></div>

                <hr className="my-[15px]" />

                <div className="flex justify-between items-center text-[15px] mt-3">
                  <span className="font-bold text-left text-[16px]">
                    Rs. {product.price}
                  </span>
                  <span
                    className={`font-bold w-[110px] h-[30px] flex items-center justify-center rounded-[5px] transition-all text-[16px] cursor-pointer ${
                      addedItems.includes(product._id)
                        ? "bg-[#195E29] text-[#ffffff] cursor-not-allowed"
                        : "hover:bg-[#195E29] hover:w-30 hover:text-[#ffffff] "
                    }`}
                    onClick={() => handleAddToCart(product._id)}
                  >
                    {addedItems.includes(product._id)
                      ? "Added ✓"
                      : "+ Add to Cart"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 border-t border-b border-gray-300 ${
                        currentPage === number
                          ? "bg-[#195E29] text-white border-[#195E29]"
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
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #195e29;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #195e29;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default Shop;
