// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import BannerSlider from "../components/BannerSlider";
import EventSubscriptionForm from "../components/EventSubscriptionForm";
import ScrollToTop from "../components/ScrollToTop";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  ScrollToTop();

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleAddToCart = async (productId) => {
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

      // fake “added” visual timeout
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

  return (
    <div data-testid="home-page">
      {/* Category tiles */}
      <div className="mt-[50px] mb-[50px]" data-testid="category-tiles">
        <div className="flex flex-wrap items-center justify-between ml-[75px] mr-[75px]">
          {/* Hunting */}
          <div
            onClick={() => navigate(`/shop?category=Hunting`)}
            data-testid="tile-hunting"
            style={{
              backgroundColor: "#EFEFEF",
              width: "320px",
              height: "400px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
            className="group flex flex-col justify-between border border-transparent hover:border-[#195E29] transition cursor-pointer"
          >
            <div className="pl-[20px] pr-[20px] pt-[20px] pb-[15px]">
              <h2 className="text-2xl font-bold text-left mb-3 text-gray-800">
                Shop Hunting
              </h2>
              <p className="text-sm text-left mb-2 text-gray-600 leading-relaxed">
                🔥 Adventure-ready gear at your fingertips
              </p>
              <p className="text-sm text-left text-gray-600 leading-relaxed">
                🛍️ Click, pack, and hit the trail
              </p>
            </div>
            <img
              src="/Shop-hunting.jpg"
              alt="Shop Hunting"
              style={{ width: "100%", height: "215px", objectFit: "cover" }}
              className="w-full h-[215px] object-cover transition-transform duration-300 ease-in-out group-hover:scale-103"
            />
          </div>

          {/* Camping */}
          <div
            onClick={() => navigate(`/shop?category=Camping`)}
            data-testid="tile-camping"
            style={{
              backgroundColor: "#EFEFEF",
              width: "320px",
              height: "400px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
            className="group flex flex-col justify-between border border-transparent hover:border-[#195E29] transition cursor-pointer"
          >
            <div className="pl-[20px] pr-[20px] pt-[20px] pb-[15px]">
              <h2 className="text-2xl font-bold text-left mb-3 text-gray-800">
                Shop Camping
              </h2>
              <p className="text-sm text-left mb-2 text-gray-600 leading-relaxed">
                🔥 Adventure-ready gear at your fingertips
              </p>
              <p className="text-sm text-left text-gray-600 leading-relaxed">
                🛍️ Click, pack, and hit the trail
              </p>
            </div>
            <img
              src="/Shop-camping.jpg"
              alt="Shop Camping"
              style={{ width: "100%", height: "215px", objectFit: "cover" }}
              className="w-full h-[215px] object-cover transition-transform duration-300 ease-in-out group-hover:scale-103"
            />
          </div>

          {/* Fishing */}
          <div
            onClick={() => navigate(`/shop?category=Fishing`)}
            data-testid="tile-fishing"
            style={{
              backgroundColor: "#EFEFEF",
              width: "320px",
              height: "400px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
            className="group flex flex-col justify-between border border-transparent hover:border-[#195E29] transition cursor-pointer"
          >
            <div className="pl-[20px] pr-[20px] pt-[20px] pb-[15px]">
              <h2 className="text-2xl font-bold text-left mb-3 text-gray-800">
                Shop Fishing
              </h2>
              <p className="text-sm text-left mb-2 text-gray-600 leading-relaxed">
                🔥 Adventure-ready gear at your fingertips
              </p>
              <p className="text-sm text-left text-gray-600 leading-relaxed">
                🛍️ Click, pack, and hit the trail
              </p>
            </div>
            <img
              src="/Shop-fishing.jpg"
              alt="Shop Fishing"
              style={{ width: "100%", height: "215px", objectFit: "cover" }}
              className="w-full h-[215px] object-cover transition-transform duration-300 ease-in-out group-hover:scale-103"
            />
          </div>

          {/* Climbing */}
          <div
            onClick={() => navigate(`/shop?category=Climbing`)}
            data-testid="tile-climbing"
            style={{
              backgroundColor: "#EFEFEF",
              width: "320px",
              height: "400px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
            className="group flex flex-col justify-between border border-transparent hover:border-[#195E29] transition cursor-pointer"
          >
            <div className="pl-[20px] pr-[20px] pt-[20px] pb-[15px]">
              <h2 className="text-2xl font-bold text-left mb-3 text-gray-800">
                Shop Climbing
              </h2>
              <p className="text-sm text-left mb-2 text-gray-600 leading-relaxed">
                🔥 Adventure-ready gear at your fingertips
              </p>
              <p className="text-sm text-left text-gray-600 leading-relaxed">
                🛍️ Click, pack, and hit the trail
              </p>
            </div>
            <img
              src="/Shop-climbing.jpg"
              alt="Shop Climbing"
              style={{ width: "100%", height: "215px", objectFit: "cover" }}
              className="w-full h-[215px] object-cover transition-transform duration-300 ease-in-out group-hover:scale-103"
            />
          </div>
        </div>
      </div>

      {/* Hot This Week */}
      <div id="hot-this-week" className="text-center ml-[75px] mr-[75px]" data-testid="hot-section">
        <p className="text-[30px] font-bold mb-[50px]" data-testid="hot-title">Hot This Week</p>
        <div className="flex flex-wrap items-center justify-between mb-7" data-testid="hot-grid">
          {products
            .filter((product) => product.isHotThisWeek)
            .slice(0, 4)
            .map((product) => (
              <div
                key={product._id}
                className="pl-[20px] pr-[20px] border-l-[0.2px] border-r-[0.2px] border-black border-t-0 border-b-0 hover:border-t-[0.2px] hover:border-b-[0.2px] w-[310px] h-[440px]"
                data-testid={`hot-card-${product._id}`}
              >
                <div
                  style={{ width: "280px", height: "205px" }}
                  className="flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                  data-testid={`hot-card-image-${product._id}`}
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

                <div className="mt-[30px] h-[48px] overflow-hidden">
                  <p
                    className="text-[15px] text-left leading-relaxed line-clamp-2 cursor-pointer hover:text-green-600 transition-colors"
                    onClick={() => navigate(`/product/${product._id}`)}
                    data-testid={`hot-card-name-${product._id}`}
                  >
                    {product.productName}
                  </p>
                </div>

                <div className="flex mt-[15px]">{/* stars */}</div>

                <hr className="mt-[25px] mb-[20px]" />

                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-bold text-left" data-testid={`hot-card-price-${product._id}`}>
                    Rs. {product.price}
                  </span>
                  <span
                    className={`font-bold w-[110px] h-[30px] flex items-center justify-center rounded-[5px] transition-all text-[16px] cursor-pointer ${
                      addedItems.includes(product._id)
                        ? "bg-[#195E29] text-[#ffffff] cursor-not-allowed"
                        : "hover:bg-[#195E29] hover:w-30 hover:text-[#ffffff] "
                    }`}
                    role="button"
                    aria-disabled={addedItems.includes(product._id) ? "true" : "false"}
                    onClick={() => handleAddToCart(product._id)}
                    data-testid={`hot-card-add-${product._id}`}
                  >
                    {addedItems.includes(product._id) ? "Added ✓" : "+ Add to Cart"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Banner slider */}
      <div>
        <div className="ml-[75px] mr-[75px] mb-[70px] mt-[30px] overflow-hidden" data-testid="banner-slider">
          <BannerSlider />
        </div>
      </div>

      {/* Feature strip */}
      <div data-testid="feature-strip">
        <hr className="mr-[75px] ml-[75px]" />
        <div className="flex flex-wrap justify-between items-center ml-[150px] mr-[150px] pt-[20px] pb-[20px]">
          {/* three features ... unchanged */}
        </div>
        <hr className="mr-[75px] ml-[75px]" />
      </div>

      {/* Subscription section */}
      <div className="mt-[70px] mb-[30px] bg-[#195E29]/80 w-auto h-[590px] relative" data-testid="subscription-section">
        <div className="w-[1205px] h-[610px] flex items-center justify-between absolute top-[80px] left-1/2 -translate-x-1/2 bg-[#ffffff] rounded-2xl shadow-2xl overflow-hidden">
          <div className="w-[585px] h-fit relative">
            <img src="/Subs-Home.jpg" alt="Outdoor" className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 bg-[#8DC53E] text-white px-4 py-2 rounded-full text-sm font-semibold">
              🏔️ Join 10,000+ Adventurers
            </div>
          </div>

          <div className="pr-[110px] pl-[10px]">
            <p className="text-[20px] mb-[10px] text-[#797979] font-bold">Never Miss an Adventure</p>
            <p className="text-4xl font-bold leading-12 mb-4">
              Get Notified About New <br /> Outdoor Events
            </p>
            <p className="text-[16px] leading-8 mb-8 mt-3">
              Be the first to know about hiking trips, camping adventures, <br />
              climbing expeditions, fishing tours, and outdoor workshops. <br />
              Join our community of outdoor enthusiasts!
            </p>

            <div data-testid="subscription-form">
              <EventSubscriptionForm />
            </div>
          </div>
        </div>
      </div>

      {/* Featured products */}
      <div className="text-center ml-[75px] mr-[75px]" data-testid="featured-section">
        <p className="text-[30px] mb-[50px]" style={{ fontWeight: "bold" }} data-testid="featured-title">
          FEATURED PRODUCTS
        </p>
        <div className="flex flex-wrap items-center justify-between mb-7" data-testid="featured-grid">
          {products
            .filter((product) => product.isFeatured)
            .slice(0, 4)
            .map((product) => (
              <div
                key={product._id}
                className="pl-[20px] pr-[20px] border-l-[0.2px] border-r-[0.2px] border-black border-t-0 border-b-0 hover:border-t-[0.2px] hover:border-b-[0.2px] w-[310px] h-[440px]"
                data-testid={`feat-card-${product._id}`}
              >
                <div
                  style={{ width: "280px", height: "205px" }}
                  className="flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                  data-testid={`feat-card-image-${product._id}`}
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

                <div className="mt-[30px] h-[48px] overflow-hidden">
                  <p
                    className="text-[15px] text-left leading-relaxed line-clamp-2 cursor-pointer hover:text-green-600 transition-colors"
                    onClick={() => navigate(`/product/${product._id}`)}
                    data-testid={`feat-card-name-${product._id}`}
                  >
                    {product.productName}
                  </p>
                </div>

                <div className="flex mt-[15px]">{/* stars */}</div>

                <hr className="mt-[25px] mb-[20px]" />

                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-bold text-left" data-testid={`feat-card-price-${product._id}`}>
                    Rs. {product.price}
                  </span>
                  <span
                    className={`font-bold w-[110px] h-[30px] flex items-center justify-center rounded-[5px] transition-all text-[16px] cursor-pointer ${
                      addedItems.includes(product._id)
                        ? "bg-[#195E29] text-[#ffffff] cursor-not-allowed"
                        : "hover:bg-[#195E29] hover:w-30 hover:text-[#ffffff] "
                    }`}
                    role="button"
                    aria-disabled={addedItems.includes(product._id) ? "true" : "false"}
                    onClick={() => handleAddToCart(product._id)}
                    data-testid={`feat-card-add-${product._id}`}
                  >
                    {addedItems.includes(product._id) ? "Added ✓" : "+ Add to Cart"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

