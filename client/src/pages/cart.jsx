import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import { motion, useInView, AnimatePresence } from "framer-motion";
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
  ArrowRight,
} from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";

axios.defaults.withCredentials = true;

// ── Scroll-triggered reveal wrapper ──────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 24, className = "" }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(5px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.55, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Cart Page ─────────────────────────────────────────────────────────────────
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

  ScrollToTop();

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

  const handleAddAddress = () => navigate("/settings");
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
  const shipping = itemPrice > 5000 ? 0 : 500;
  const totalCost = itemPrice + shipping;

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#8DC53E]/20 border-t-[#8DC53E] rounded-full animate-spin" />
            <p className="text-gray-400 text-xs font-medium">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── NOT AUTHENTICATED ──
  if (!isAuthenticated || !getAuthToken()) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative bg-gray-900 overflow-hidden">
          <div className={`relative ${SECTION_PY} ${PX}`}>
            <FadeIn>
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-8 h-px bg-[#8DC53E]" />
                  Authentication Required
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                  Shopping
                  <br />
                  <span className="text-[#8DC53E]">Cart</span>
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                  Please log in to view your shopping cart and continue with your purchase.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <div className={`${SECTION_PY} bg-white ${PX}`}>
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-500 text-sm mb-8">
              Please sign in to access your shopping cart and checkout.
            </p>
            <button
              onClick={() => navigate("/login", { state: { from: "/cart" } })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
            >
              Login to Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ──
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative bg-gray-900 overflow-hidden">
          <div className={`relative ${SECTION_PY} ${PX}`}>
            <FadeIn>
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-8 h-px bg-[#8DC53E]" />
                  Your Cart
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                  Shopping
                  <br />
                  <span className="text-[#8DC53E]">Cart</span>
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                  Review your items before proceeding to checkout.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <div className={`${SECTION_PY} bg-white ${PX}`}>
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
            >
              Start Shopping <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CART WITH ITEMS ──
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Cart-hero.jpg"
            alt="Cart background"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Your Cart
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                Shopping
                <br />
                <span className="text-[#8DC53E]">Cart</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                Review your items before proceeding to checkout.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${PX} pt-6`}
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Cart Items ({cart.items.length})</h2>
        <button
          onClick={() => navigate("/shop")}
          className="text-xs text-[#8DC53E] font-medium hover:underline"
        >
          Add More Items
        </button>
      </div>

              <div className="space-y-4">
                {cart.items.map((item, idx) => (
                  <FadeIn key={item._id} delay={idx * 0.05}>
                    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                          <img
                            src={
                              item.product.imageUrl
                                ? `${BASE_URL}${item.product.imageUrl}`
                                : "/products/placeholder.jpg"
                            }
                            alt={item.product.productName}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = "/products/placeholder.jpg"; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm mb-1">
                            {item.product.productName}
                          </h3>
                          {item.product.brand && (
                            <p className="text-xs text-gray-400 mb-2">{item.product.brand}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingQuantity === item._id}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#8DC53E] hover:bg-[#8DC53E]/5 transition-all disabled:opacity-40"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={updatingQuantity === item._id}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#8DC53E] hover:bg-[#8DC53E]/5 transition-all"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#8DC53E]">
                                Rs. {(item.product.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                Rs. {item.product.price.toLocaleString()} each
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={removingItem === item._id}
                          className="self-start text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {removingItem === item._id ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-1">
              <FadeIn delay={0.1}>
                <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-[#8DC53E]" />
                    Order Summary
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">Rs. {itemPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Truck size={14} /> Shipping
                      </span>
                      <span className="font-medium text-gray-900">
                        {shipping === 0 ? "Free" : `Rs. ${shipping.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-[#8DC53E]">
                          Rs. {totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={12} /> Shipping Address
                      </h4>
                      <button
                        onClick={handleChangeAddressClick}
                        className="text-[10px] text-[#8DC53E] font-medium hover:underline flex items-center gap-1"
                      >
                        <Edit size={10} /> {selectedAddress ? "Change" : "Select"}
                      </button>
                    </div>

                    {addressLoading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw size={20} className="animate-spin text-[#8DC53E]" />
                      </div>
                    ) : selectedAddress ? (
                      <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                        <p className="font-medium text-gray-900">{selectedAddress.addressLine1}</p>
                        {selectedAddress.addressLine2 && <p className="text-gray-500 text-xs">{selectedAddress.addressLine2}</p>}
                        <p className="text-gray-500 text-xs">
                          {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}
                        </p>
                        <p className="text-gray-500 text-xs">{selectedAddress.country}</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddAddress}
                        className="w-full py-3 text-center border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-[#8DC53E] hover:text-[#8DC53E] transition-colors"
                      >
                        + Add Address
                      </button>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedAddress}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedAddress
                        ? "bg-[#8DC53E] text-white hover:bg-[#7ab535]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Lock size={14} />
                    Proceed to Checkout
                  </button>

                  <p className="text-center text-[10px] text-gray-400 mt-4">
                    Secure payment powered by TGO
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Address Selection Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => e.target === e.currentTarget && setShowAddressModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Select Address</h3>
                <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-4">No saved addresses</p>
                    <button
                      onClick={handleAddAddress}
                      className="text-[#8DC53E] text-sm font-medium"
                    >
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        onClick={() => handleAddressSelect(address)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedAddress?._id === address._id
                            ? "border-[#8DC53E] bg-[#8DC53E]/5"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{address.addressLine1}</p>
                            {address.addressLine2 && <p className="text-gray-500 text-xs">{address.addressLine2}</p>}
                            <p className="text-gray-500 text-xs">
                              {address.city}, {address.province} {address.postalCode}
                            </p>
                            <p className="text-gray-500 text-xs">{address.country}</p>
                          </div>
                          {selectedAddress?._id === address._id && (
                            <Check size={16} className="text-[#8DC53E]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  className="flex-1 py-2 rounded-lg bg-[#8DC53E] text-white text-sm font-medium hover:bg-[#7ab535]"
                >
                  Add New
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;