// Home.jsx
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
      console.log("Fetched products:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
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

      setAddedItems([...addedItems, productId]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-[50px] mb-[50px]">
        <div className="flex flex-wrap items-center justify-between ml-[75px] mr-[75px]">
          <div
            onClick={() => navigate(`/shop?category=Hunting`)}
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

          <div
            onClick={() => navigate(`/shop?category=Camping`)}
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

          <div
            onClick={() => navigate(`/shop?category=Fishing`)}
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

          <div
            onClick={() => navigate(`/shop?category=Climbing`)}
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
      <div id="hot-this-week" className="text-center ml-[75px] mr-[75px]">
        <p className="text-[30px] font-bold mb-[50px]">Hot This Week</p>
        <div className="flex flex-wrap items-center justify-between mb-7">
          {products
            .filter((product) => product.isHotThisWeek)
            .slice(0, 4)
            .map((product) => (
              <div
                key={product._id}
                className="pl-[20px] pr-[20px] border-l-[0.2px] border-r-[0.2px] border-black border-t-0 border-b-0 hover:border-t-[0.2px] hover:border-b-[0.2px] w-[310px] h-[440px]"
              >
                <div
                  style={{ width: "280px", height: "205px" }}
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

                <hr className="mt-[25px] mb-[20px]" />

                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-bold text-left">
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
      </div>
      <div>
        <div className="ml-[75px] mr-[75px] mb-[70px] mt-[30px] overflow-hidden">
          <BannerSlider />
        </div>
      </div>
      <div className="">
        <hr className="mr-[75px] ml-[75px]" />
        <div className="flex flex-wrap justify-between items-center ml-[150px] mr-[150px] pt-[20px] pb-[20px]">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <img
                src="/Award.svg"
                alt=""
                className="width=[28px] height-[51px] mr-[20px]"
              />
            </div>
            <div>
              <p className="text-[18px] mb-1 font-bold">BEST PRICE GUARANTEE</p>
              <p className="text-[16px] text-black">100% Authentic Products</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <img
                src="/Shipping.svg"
                alt=""
                className="width=[28px] height-[51px] mr-[20px]"
              />
            </div>
            <div>
              <p className="text-[18px] mb-1 font-bold">FREE SHIPPING</p>
              <p className="text-[16px]">On Orders Over Rs. 5000</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <img
                src="/card.svg"
                alt=""
                className="width=[28px] height-[51px] mr-[20px]"
              />
            </div>
            <div>
              <p className="text-[18px] mb-1 font-bold">SECURE PAYMENTS</p>
              <p className="text-[16px]">Secure Checkout verified</p>
            </div>
          </div>
        </div>
        <hr className="mr-[75px] ml-[75px]" />
      </div>
      <div className="mt-[70px] mb-[30px] bg-[#195E29]/80 w-auto h-[590px] relative">
        <div className="w-[1205px] h-[610px] flex items-center justify-between absolute top-[80px] left-1/2 -translate-x-1/2 bg-[#ffffff] rounded-2xl shadow-2xl overflow-hidden">
          {/* Image Container */}
          <div className="w-[585px] h-fit relative">
            <img
              src="/Subs-Home.jpg"
              alt="Outdoor"
              className="w-full h-full object-cover"
            />
            {/* Simple badge */}
            <div className="absolute top-6 left-6 bg-[#8DC53E] text-white px-4 py-2 rounded-full text-sm font-semibold">
              🏔️ Join 10,000+ Adventurers
            </div>
          </div>

          <div className="pr-[110px] pl-[10px]">
            <p className="text-[20px] mb-[10px] text-[#797979] font-bold">
              Never Miss an Adventure
            </p>
            <p className="text-4xl font-bold leading-12 mb-4">
              Get Notified About New <br /> Outdoor Events
            </p>
            <p className="text-[16px] leading-8 mb-8 mt-3">
              Be the first to know about hiking trips, camping adventures,{" "}
              <br />
              climbing expeditions, fishing tours, and outdoor workshops. <br />
              Join our community of outdoor enthusiasts!
            </p>

            {/* Updated EventSubscriptionForm with modern checkboxes */}
            <EventSubscriptionForm />
          </div>
        </div>
      </div>
      <div className="w-auto h-[690px] mt-[120px] mb-[30px] bg-[url('/Review-BG.png')] bg-no-repeat bg-center bg-contain">
        <p className="text-[20px] text-center pt-[75px] text-[#ffffff] mb-[10px]">
          OUR CLIENT WORDS
        </p>
        <p className="text-[40px] text-[#FFA81D] text-center font-bold mb-[40px]">
          CUSTOMER SAYS
        </p>
        <div className="flex flex-wrap items-start justify-between pl-[100px] pr-[100px] text-center">
          <div className="text-[#ffffff] flex flex-col items-center">
            <img
              src="/AK.jpg"
              alt=""
              className="h-[105px] w-[105px] rounded-full border-[5px] hover:border-[#FFA81D] transition mb-[20px]"
            />
            <p className="text-[25px] font-bold mb-[5px]">Ajith Kumar</p>
            <p className="text-[20px] mb-[20px]">CAR RACER</p>
            <div className="flex justify-center mb-[20px]">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <svg
                    key={i}
                    className="w-[18px] h-[18px] mr-[2px]"
                    fill="#FFA81D"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                  </svg>
                ))}
            </div>
            <p className="text-[15px] leading-[2.2] text-[#D9D7D7]">
              "Absolutely thrilled with the quality!" <br />I bought my hiking
              gear from here for a trip <br />
              through the Knuckles Range—everything held <br />
              up beautifully. Lightweight, durable, and weatherproof.
            </p>
          </div>

          <div className="text-[#ffffff] flex flex-col items-center">
            <img
              src="prabhas.jpg"
              alt=""
              className="w-[105px] h-[105px] rounded-full border-[5px] hover:border-[#FFA81D] transition mb-[20px]"
            />
            <p className="text-[25px] font-bold mb-[5px]">Prabhas</p>
            <p className="text-[20px] mb-[20px]">ACTOR</p>
            <div className="flex justify-center mb-[20px]">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <svg
                    key={i}
                    className="w-[18px] h-[18px] mr-[2px]"
                    fill="#FFA81D"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                  </svg>
                ))}
            </div>
            <p className="text-[15px] leading-[2.2] text-[#D9D7D7]">
              "Fast delivery & top-notch customer service."
              <br />
              Ordered last-minute before a weekend trek and my package <br />
              arrived early! Plus, the team was super responsive when <br /> I
              had questions. Will definitely shop again!
            </p>
          </div>

          <div className="text-[#ffffff] flex flex-col items-center">
            <img
              src="vijay.png"
              alt=""
              className="w-[105px] h-[105px] rounded-full border-[5px] hover:border-[#FFA81D] transition mb-[20px]"
            />
            <p className="text-[25px] font-bold mb-[5px]">Joseph Vijay</p>
            <p className="text-[20px] mb-[20px]">POLITICIAN</p>
            <div className="flex justify-center mb-[20px]">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <svg
                    key={i}
                    className="w-[18px] h-[18px] mr-[2px]"
                    fill="#FFA81D"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.178 3.63a1 1 0 00.95.69h3.813c.969 0 1.371 1.24.588 1.81l-3.084 2.24a1 1 0 00-.364 1.118l1.178 3.63c.3.921-.755 1.688-1.54 1.118l-3.084-2.24a1 1 0 00-1.176 0l-3.084 2.24c-.784.57-1.838-.197-1.54-1.118l1.178-3.63a1 1 0 00-.364-1.118L2.33 9.057c-.783-.57-.38-1.81.588-1.81h3.813a1 1 0 00.95-.69l1.178-3.63z" />
                  </svg>
                ))}
            </div>
            <p className="text-[15px] leading-[2.2] text-[#D9D7D7]">
              "More than gear—this is adventure made easy." <br /> From browsing
              to checkout, the whole experience felt tailored <br /> for
              explorers like me. Everything I ordered was just as <br />
              described and made my trip smooth and unforgettable.
            </p>
          </div>
        </div>
      </div>
      <div className="text-center ml-[75px] mr-[75px]">
        <p className="text-[30px] mb-[50px]" style={{ fontWeight: "bold" }}>
          FEATURED PRODUCTS
        </p>
        <div className="flex flex-wrap items-center justify-between mb-7">
          {products
            .filter((product) => product.isFeatured)
            .slice(0, 4)
            .map((product) => (
              <div
                key={product._id}
                className="pl-[20px] pr-[20px] border-l-[0.2px] border-r-[0.2px] border-black border-t-0 border-b-0 hover:border-t-[0.2px] hover:border-b-[0.2px] w-[310px] h-[440px]"
              >
                <div
                  style={{ width: "280px", height: "205px" }}
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

                <hr className="mt-[25px] mb-[20px]" />

                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-bold text-left">
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
      </div>
    </div>
  );
};

export default Home;
