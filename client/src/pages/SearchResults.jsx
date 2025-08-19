import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import axios from "axios";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [addedItems, setAddedItems] = useState([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Sample categories and brands (you can fetch these from API)
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
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q") || "";
    setSearchQuery(query);

    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const params = {
        q: query,
        limit: 100, // Get more results for pagination
        sort: sortBy,
      };

      if (selectedCategories.length > 0) {
        params.category = selectedCategories[0]; // For simplicity, use first category
      }

      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 100000) params.maxPrice = priceRange[1];

      const response = await axios.get(`${API_URL}/search/products`, {
        params,
      });

      if (response.data.success) {
        let results = response.data.results;

        // Client-side filtering for brands since we don't have it in API
        if (selectedBrands.length > 0) {
          results = results.filter((product) =>
            selectedBrands.includes(product.brand)
          );
        }

        setProducts(results);
        setTotalResults(results.length);
      }
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
      setCurrentPage(1);
    }
  }, [selectedCategories, selectedBrands, priceRange, sortBy]);

  const handleAddToCart = async (productId) => {
    try {
      if (addedItems.includes(productId)) return;
      setAddedItems([...addedItems, productId]);

      await axios.post(`${API_URL}/cart/add`, {
        productId,
        quantity: 1,
      });

      setTimeout(() => {
        setAddedItems(addedItems.filter((id) => id !== productId));
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedItems(addedItems.filter((id) => id !== productId));
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 100000]);
    setSortBy("relevance");
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Search Products"}
          </h1>
          {totalResults > 0 && (
            <p className="text-gray-600 mt-1">
              {totalResults} {totalResults === 1 ? "product" : "products"} found
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <Filter size={18} className="mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp size={18} className="ml-2" />
              ) : (
                <ChevronDown size={18} className="ml-2" />
              )}
            </button>
          </div>

          {/* Filters Sidebar */}
          <div
            className={`w-80 flex-shrink-0 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs. {priceRange[0]}</span>
                    <span>Rs. {priceRange[1]}</span>
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstProduct + 1}-
                {Math.min(indexOfLastProduct, products.length)} of{" "}
                {products.length} results
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="name-az">Name: A to Z</option>
                  <option value="name-za">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div
                      className="aspect-square bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <img
                        src={
                          product.imageUrl
                            ? `${API_URL.replace("/api", "")}${
                                product.imageUrl
                              }`
                            : "/products/placeholder.jpg"
                        }
                        alt={product.productName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    <div className="p-4">
                      <h3
                        className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-green-600 transition-colors"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.productName}
                      </h3>

                      <p className="text-sm text-gray-500 mb-2">
                        {product.category?.categoryName}
                      </p>

                      <div className="flex items-center mb-3">
                        {Array(5)
                          .fill()
                          .map((_, i) => (
                            <svg
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                            </svg>
                          ))}
                        <span className="text-xs text-gray-500 ml-1">
                          (5.0)
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          Rs. {product.price}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            addedItems.includes(product._id)
                              ? "bg-green-100 text-green-800"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {addedItems.includes(product._id)
                            ? "Added ✓"
                            : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
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
                <button
                  onClick={clearFilters}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-2 rounded-md border ${
                          currentPage === pageNumber
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      paginate(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
