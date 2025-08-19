import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createPortal } from "react-dom";

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState({ products: [], brands: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      loadRecentSearches();
    }
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setShowSuggestions(true);
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setSuggestions({ products: [], brands: [] });
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(recent.slice(0, 5));
  };

  const saveToRecentSearches = (query) => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const updated = [query, ...recent.filter((item) => item !== query)].slice(
      0,
      10
    );
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const debouncedSearch = (query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      await performSearch(query);
    }, 300);
  };

  const performSearch = async (query) => {
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    try {
      const [searchResponse, suggestionsResponse] = await Promise.all([
        axios.get(`${API_URL}/search/products`, {
          params: { q: query, limit: 6 },
        }),
        axios.get(`${API_URL}/search/suggestions`, {
          params: { q: query, limit: 5 },
        }),
      ]);

      if (searchResponse.data.success) {
        setSearchResults(searchResponse.data.results);
      }

      if (suggestionsResponse.data.success) {
        setSuggestions(suggestionsResponse.data.suggestions);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSuggestions({ products: [], brands: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    saveToRecentSearches(searchQuery);
    onClose();
    navigate(`/product/${product._id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery.trim());
      onClose();
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-16 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-200">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center space-x-4"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </form>
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          {searchQuery.length < 2 ? (
            /* Recent Searches and Popular */
            <div className="p-6 space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Clock size={18} className="mr-2" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp size={18} className="mr-2" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Backpacks",
                    "Camping",
                    "Hiking",
                    "Climbing",
                    "Fishing",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleRecentSearchClick(term)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="p-6">
              {searchResults.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Products
                    </h3>
                    {searchResults.length >= 6 && (
                      <button
                        onClick={handleSearchSubmit}
                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
                      >
                        View all results
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
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
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {product.productName}
                          </h4>
                          <p className="text-gray-500 text-xs">
                            {product.category?.categoryName}
                          </p>
                          <p className="font-semibold text-green-600 text-sm">
                            Rs. {product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.brands.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Brands
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          onClose();
                          navigate(`/search?q=${encodeURIComponent(brand)}`);
                        }}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-sm text-blue-700 transition-colors"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery.length >= 2 &&
                searchResults.length === 0 &&
                !loading && (
                  <div className="text-center py-8">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                      No products found
                    </p>
                    <p className="text-gray-400 text-sm">
                      Try searching with different keywords
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Search Footer */}
        {searchQuery.trim() && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSearchSubmit}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Search for "{searchQuery}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
  return createPortal(modalContent, document.getElementById("modal-root"));
};

export default SearchModal;
