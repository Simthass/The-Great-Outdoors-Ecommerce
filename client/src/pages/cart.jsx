// src/pages/Cart.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Package,
  AlertCircle,
  Truck,
  ChevronRight,
  Lock,
  RefreshCw,
  X,
  Check,
  Edit,
} from "lucide-react";

axios.defaults.withCredentials = true;

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (!isAuthenticated || !getAuthToken()) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => axios.interceptors.request.eject(requestInterceptor);
  }, []);

  const fetchCart = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate("/login", { state: { from: "/cart" } });
        return;
      }
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const cartData = response.data || { items: [] };
      const processedItems = (cartData.items || []).map((item) => ({
        ...item,
        product: item.product || {
          _id: item.product?._id || "unknown",
          productName: item.product?.productName || "Unknown Product",
          price: item.product?.price || 0,
          imageUrl: item.product?.imageUrl || "/products/placeholder.jpg",
          brand: item.product?.brand || "",
        },
      }));

      setCart({ ...cartData, items: processedItems });
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        setError("Failed to load cart. Please try again.");
      }
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate("/login", { state: { from: "/cart" } });
        return;
      }
      setAddressLoading(true);
      const response = await axios.get(`${API_URL}/settings/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const addressList = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setAddresses(addressList);

      const def = addressList.find((a) => a.isDefault);
      if (def) setSelectedAddress(def);
      else if (addressList.length > 0) setSelectedAddress(addressList[0]);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        setError("Failed to load addresses. Please try again.");
      }
    } finally {
      setAddressLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingQuantity(itemId);
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/cart/update/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setCart(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        alert("Failed to update quantity. Please try again.");
      }
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setRemovingItem(itemId);
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCart(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        alert("Failed to remove item. Please try again.");
      }
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated || !getAuthToken()) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }
    navigate("/checkout");
  };

  const handleChangeAddressClick = () => {
    if (!isAuthenticated || !getAuthToken()) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    setShowAddressModal(true);
  };

  const handleAddAddress = () => navigate("/Settings");
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };
  const handleRefreshAddresses = async () => fetchAddresses();

  // Calculate totals
  const itemPrice = cart.items.reduce(
    (t, item) => t + item.product.price * item.quantity,
    0
  );
  const shipping = 500.0;
  const totalCost = itemPrice + shipping;
  const savings = 0; // Can be calculated based on discounts

  // ---------- LOADING STATE ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full h-32 md:h-40 bg-gradient-to-r from-[#8DC53E] to-[#7AB32E] flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Shopping Cart
          </h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8DC53E]"></div>
            <p className="text-lg text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- NOT AUTHENTICATED ----------
  if (!isAuthenticated || !getAuthToken()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full h-32 md:h-40 bg-gradient-to-r from-[#8DC53E] to-[#7AB32E] flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Shopping Cart
          </h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-12 space-y-6">
            <Lock size={64} className="text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Authentication Required
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              Please log in to view your shopping cart and continue with your
              purchase.
            </p>
            <button
              onClick={() => navigate("/login", { state: { from: "/cart" } })}
              className="bg-[#8DC53E] text-white px-8 py-3 rounded-lg hover:bg-[#7AB32E] transition-colors duration-200 font-semibold flex items-center gap-2"
            >
              <Lock size={20} />
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- EMPTY CART ----------
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full h-32 md:h-40 bg-gradient-to-r from-[#8DC53E] to-[#7AB32E] flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Shopping Cart
          </h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-12 space-y-6">
            <div className="relative">
              <ShoppingCart size={80} className="text-gray-300" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                0
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Your cart is empty
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              Looks like you haven't added anything to your cart yet. Start
              shopping to fill it up!
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-[#8DC53E] text-white px-8 py-3 rounded-lg hover:bg-[#7AB32E] transition-colors duration-200 font-semibold flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- CART WITH ITEMS ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden"
        data-testid="cart-hero"
      >
        <div className="absolute inset-0 bg-[url(/page-name.png)] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-2"
            data-testid="cart-title"
          >
            Shopping Cart
          </h1>
          <p className="text-gray-200 text-sm md:text-base">
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-white rounded-lg p-4 font-semibold text-gray-700 text-sm border border-gray-200">
              <div className="col-span-6">PRODUCT</div>
              <div className="col-span-2 text-center">QUANTITY</div>
              <div className="col-span-3 text-center">PRICE</div>
              <div className="col-span-1 text-center">REMOVE</div>
            </div>

            {/* Cart Items */}
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200"
              >
                {/* Mobile Layout */}
                <div className="md:hidden p-4 space-y-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={
                          item.product.imageUrl
                            ? `${BASE_URL}${item.product.imageUrl}`
                            : "/products/placeholder.jpg"
                        }
                        alt={item.product.productName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = "/products/placeholder.jpg";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.product.productName}
                      </h3>
                      {item.product.brand && (
                        <p className="text-xs text-gray-500 mb-2">
                          {item.product.brand}
                        </p>
                      )}
                      <p className="text-lg font-bold text-[#8DC53E]">
                        Rs. {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rs. {item.product.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        className={`w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all ${
                          item.quantity <= 1
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-gray-100 hover:border-[#8DC53E] active:scale-95"
                        }`}
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                        disabled={
                          item.quantity <= 1 || updatingQuantity === item._id
                        }
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>

                      <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>

                      <button
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-[#8DC53E] transition-all active:scale-95"
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                        disabled={updatingQuantity === item._id}
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>

                    <button
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={removingItem === item._id}
                    >
                      {removingItem === item._id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                  {/* Product Info */}
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={
                          item.product.imageUrl
                            ? `${BASE_URL}${item.product.imageUrl}`
                            : "/products/placeholder.jpg"
                        }
                        alt={item.product.productName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = "/products/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.product.productName}
                      </h3>
                      {item.product.brand && (
                        <p className="text-sm text-gray-500">
                          {item.product.brand}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      className={`w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all ${
                        item.quantity <= 1
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-gray-100 hover:border-[#8DC53E] active:scale-95"
                      }`}
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1)
                      }
                      disabled={
                        item.quantity <= 1 || updatingQuantity === item._id
                      }
                    >
                      <Minus size={16} className="text-gray-600" />
                    </button>

                    <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>

                    <button
                      className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-[#8DC53E] transition-all active:scale-95"
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1)
                      }
                      disabled={updatingQuantity === item._id}
                    >
                      <Plus size={16} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="col-span-3 text-center">
                    <p className="text-xl font-bold text-[#8DC53E]">
                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rs. {item.product.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={removingItem === item._id}
                      title="Remove item"
                    >
                      {removingItem === item._id ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping Button - Mobile */}
            <button
              onClick={() => navigate("/shop")}
              className="w-full md:hidden bg-white border-2 border-[#8DC53E] text-[#8DC53E] px-6 py-3 rounded-lg hover:bg-[#8DC53E] hover:text-white transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Continue Shopping
            </button>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-4">
              {/* Summary Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package size={24} className="text-[#8DC53E]" />
                  Order Summary
                </h2>
              </div>

              {/* Price Breakdown */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-sm">
                    Subtotal ({cart.items.length}{" "}
                    {cart.items.length === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold">
                    Rs. {itemPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-sm flex items-center gap-1">
                    <Truck size={16} className="text-[#8DC53E]" />
                    Shipping
                  </span>
                  <span className="font-semibold">
                    Rs. {shipping.toFixed(2)}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Savings</span>
                    <span className="font-semibold">
                      - Rs. {savings.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-[#8DC53E]">
                      Rs. {totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin size={18} className="text-[#8DC53E]" />
                    Shipping Address
                  </h3>
                  <button
                    onClick={handleChangeAddressClick}
                    className="text-[#8DC53E] hover:text-[#7AB32E] text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <Edit size={14} />
                    {selectedAddress ? "Change" : "Select"}
                  </button>
                </div>

                {addressLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw
                      size={24}
                      className="animate-spin text-[#8DC53E]"
                    />
                  </div>
                ) : selectedAddress ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {selectedAddress.addressType}
                      </span>
                      {selectedAddress.isDefault && (
                        <span className="bg-[#8DC53E] text-white text-xs px-2 py-1 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{selectedAddress.addressLine1}</p>
                      {selectedAddress.addressLine2 && (
                        <p>{selectedAddress.addressLine2}</p>
                      )}
                      <p>
                        {selectedAddress.city}, {selectedAddress.province}{" "}
                        {selectedAddress.postalCode}
                      </p>
                      <p className="font-medium">{selectedAddress.country}</p>
                      {selectedAddress.phoneNumber && (
                        <p className="pt-2 border-t border-gray-300">
                          📞 {selectedAddress.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm mb-3">
                      No address selected
                    </p>
                    <button
                      onClick={handleAddAddress}
                      className="text-[#8DC53E] hover:text-[#7AB32E] font-medium text-sm transition-colors"
                    >
                      + Add Address
                    </button>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={handleCheckout}
                  disabled={!selectedAddress}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedAddress
                      ? "bg-[#8DC53E] text-white hover:bg-[#7AB32E] hover:shadow-lg active:scale-[0.98]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Lock size={20} />
                  {selectedAddress
                    ? "Proceed to Checkout"
                    : "Select Address to Continue"}
                  {selectedAddress && <ChevronRight size={20} />}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock size={12} />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>

            {/* Continue Shopping - Desktop */}
            <button
              onClick={() => navigate("/shop")}
              className="hidden md:flex w-full mt-4 bg-white border-2 border-[#8DC53E] text-[#8DC53E] px-6 py-3 rounded-lg hover:bg-[#8DC53E] hover:text-white transition-colors duration-200 font-semibold items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#8DC53E] to-[#7AB32E]">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin size={24} />
                Select Delivery Address
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleRefreshAddresses}
                disabled={addressLoading}
                className="flex items-center gap-2 text-[#8DC53E] hover:text-[#7AB32E] font-medium text-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={addressLoading ? "animate-spin" : ""}
                />
                {addressLoading ? "Refreshing..." : "Refresh Addresses"}
              </button>

              <button
                onClick={handleAddAddress}
                className="bg-[#8DC53E] text-white px-4 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors font-medium text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Plus size={16} />
                Add New Address
              </button>
            </div>

            {/* Address List */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {addressLoading && addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <RefreshCw
                    size={48}
                    className="animate-spin text-[#8DC53E]"
                  />
                  <p className="text-gray-600">Loading addresses...</p>
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => handleAddressSelect(address)}
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedAddress && selectedAddress._id === address._id
                          ? "border-[#8DC53E] bg-green-50 shadow-md ring-2 ring-[#8DC53E]/20"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                      }`}
                    >
                      {/* Selection Indicator */}
                      {selectedAddress &&
                        selectedAddress._id === address._id && (
                          <div className="absolute top-3 right-3 bg-[#8DC53E] text-white rounded-full p-1">
                            <Check size={16} />
                          </div>
                        )}

                      {/* Address Content */}
                      <div className="pr-8">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin
                            size={18}
                            className={
                              selectedAddress &&
                              selectedAddress._id === address._id
                                ? "text-[#8DC53E]"
                                : "text-gray-400"
                            }
                          />
                          <span className="font-semibold text-gray-900">
                            {address.addressType}
                          </span>
                          {address.isDefault && (
                            <span className="bg-[#8DC53E] text-white text-xs px-2 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-gray-700 ml-6">
                          <p className="font-medium">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p>{address.addressLine2}</p>
                          )}
                          <p>
                            {address.city}, {address.province}{" "}
                            {address.postalCode}
                          </p>
                          <p className="text-gray-900 font-medium">
                            {address.country}
                          </p>
                          {address.phoneNumber && (
                            <p className="pt-2 border-t border-gray-200 mt-2">
                              📞 {address.phoneNumber}
                            </p>
                          )}
                          {address.instructions && (
                            <p className="text-gray-500 italic text-xs pt-1">
                              Note: {address.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="bg-gray-100 rounded-full p-6">
                    <MapPin size={48} className="text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">
                    No Addresses Found
                  </h4>
                  <p className="text-gray-600 text-center max-w-md text-sm">
                    You haven't added any delivery addresses yet. Add your first
                    address to continue with checkout.
                  </p>
                  <button
                    onClick={handleAddAddress}
                    className="bg-[#8DC53E] text-white px-6 py-3 rounded-lg hover:bg-[#7AB32E] transition-colors font-semibold flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                {addresses.length > 0 &&
                  `${addresses.length} address${
                    addresses.length === 1 ? "" : "es"
                  } available`}
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                {selectedAddress && (
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 sm:flex-none bg-[#8DC53E] text-white px-6 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors font-medium flex items-center gap-2 justify-center"
                  >
                    <Check size={16} />
                    Confirm
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        /* Smooth scrollbar for address list */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #8dc53e;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #7ab32e;
        }

        /* Line clamp utilities */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Hover scale effect */
        .hover-scale:hover {
          transform: scale(1.02);
        }

        /* Responsive text */
        @media (max-width: 640px) {
          .text-responsive {
            font-size: 0.875rem;
          }
        }

        /* Focus visible styles for accessibility */
        button:focus-visible {
          outline: 2px solid #8dc53e;
          outline-offset: 2px;
        }

        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Loading skeleton animation */
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Mobile touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
