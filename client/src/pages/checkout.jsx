import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import {
  CheckCircle,
  Package,
  CreditCard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  Truck,
  Star,
  Percent,
  XCircle,
  Tag,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronRight,
} from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";

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

// ── Payment Method Card ──────────────────────────────────────────────────────
const PaymentMethodCard = ({ method, icon: Icon, description, selected, onSelect }) => (
  <div
    onClick={() => onSelect(method)}
    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      selected === method
        ? "border-[#8DC53E] bg-[#8DC53E]/5"
        : "border-gray-200 hover:border-gray-300"
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      selected === method ? "bg-[#8DC53E]/20" : "bg-gray-100"
    }`}>
      <Icon size={18} className={selected === method ? "text-[#8DC53E]" : "text-gray-500"} />
    </div>
    <div className="flex-1">
      <h3 className={`font-bold text-sm ${selected === method ? "text-[#8DC53E]" : "text-gray-900"}`}>
        {method}
      </h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
      selected === method ? "border-[#8DC53E] bg-[#8DC53E]" : "border-gray-300"
    }`}>
      {selected === method && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  </div>
);

// ── Order Success Component ─────────────────────────────────────────────────
const OrderSuccess = ({ orderData, onViewOrders, onContinueShopping }) => (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <div className="max-w-lg w-full text-center">
      <div className="w-20 h-20 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-[#8DC53E]" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-500 text-sm mb-6">
        Thank you for your purchase. Your order has been confirmed.
      </p>

      {orderData && (
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">Order ID</span>
            <span className="text-sm font-bold text-gray-900">{orderData.orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Total Amount</span>
            <span className="text-xl font-bold text-[#8DC53E]">Rs.{orderData.grandTotal?.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onViewOrders}
          className="w-full py-3 rounded-xl bg-[#8DC53E] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
        >
          View My Orders
        </button>
        <button
          onClick={onContinueShopping}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold uppercase tracking-wide hover:bg-gray-50 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
);

// ── Main Checkout Page ──────────────────────────────────────────────────────
const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [cart, setCart] = useState({ items: [] });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  ScrollToTop();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load cart data");
      }
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/settings/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const addressList = Array.isArray(response.data) ? response.data : response.data.data || [];
      setAddresses(addressList);
      const defaultAddress = addressList.find((a) => a.isDefault);
      if (defaultAddress) setSelectedAddress(defaultAddress);
      else if (addressList.length > 0) setSelectedAddress(addressList[0]);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const token = getAuthToken();
      const subtotal = cart.items.reduce(
        (t, item) => t + item.product.price * item.quantity,
        0
      );

      const response = await axios.post(
        `${API_URL}/coupons/validate`,
        { code: couponCode, orderAmount: subtotal },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (response.data.success) {
        setAppliedCoupon(response.data.data);
        setCouponError("");
      } else {
        setCouponError(response.data.message);
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }
    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/orders/checkout`,
        {
          paymentMethod,
          notes,
          couponCode: appliedCoupon ? appliedCoupon.code : "",
          shippingAddressId: selectedAddress._id,
        },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (response.data.success) {
        setOrderData(response.data.data.order);
        setOrderSuccess(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.items.reduce((t, item) => t + item.product.price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shipping = subtotal > 5000 ? 0 : 500;
  const grandTotal = subtotal - discount + shipping;

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  if (orderSuccess) {
    return (
      <OrderSuccess
        orderData={orderData}
        onViewOrders={() => navigate("/orders")}
        onContinueShopping={() => navigate("/shop")}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Checkout-hero.jpg"
            alt="Checkout background"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Secure Checkout
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                Complete Your
                <br />
                <span className="text-[#8DC53E]">Purchase</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                Review your order and complete your purchase securely.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main Content */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          {/* Back Button */}
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#8DC53E] text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Cart
          </button>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                  <XCircle size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address Section */}
              <FadeIn delay={0.05}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-[#8DC53E]" />
                    Shipping Address
                  </h2>

                  {addressLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 size={24} className="animate-spin text-[#8DC53E]" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm mb-3">No saved addresses</p>
                      <button
                        onClick={() => navigate("/settings")}
                        className="text-[#8DC53E] text-sm font-medium hover:underline"
                      >
                        Add Address in Settings →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => setSelectedAddress(address)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddress?._id === address._id
                              ? "border-[#8DC53E] bg-[#8DC53E]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 text-sm">
                                  {address.addressType}
                                </span>
                                {address.isDefault && (
                                  <span className="text-[10px] bg-[#8DC53E] text-white px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{address.addressLine1}</p>
                              {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.province} {address.postalCode}
                              </p>
                              <p className="text-sm text-gray-600">{address.country}</p>
                              {address.phoneNumber && (
                                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                  <Phone size={12} /> {address.phoneNumber}
                                </p>
                              )}
                            </div>
                            {selectedAddress?._id === address._id && (
                              <CheckCircle size={18} className="text-[#8DC53E]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Coupon Section */}
              <FadeIn delay={0.1}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag size={18} className="text-[#8DC53E]" />
                    Apply Coupon
                  </h2>

                  {!appliedCoupon ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] outline-none transition-all"
                        disabled={applyingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="px-5 py-3 rounded-lg bg-[#8DC53E] text-white text-sm font-bold hover:bg-[#7ab535] transition-all disabled:opacity-50"
                      >
                        {applyingCoupon ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={18} className="text-green-600" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue}% off`
                              : `Rs.${appliedCoupon.discountValue.toLocaleString()} off`}
                          </p>
                        </div>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                </div>
              </FadeIn>

              {/* Payment Method Section */}
              <FadeIn delay={0.15}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#8DC53E]" />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <PaymentMethodCard
                      method="Cash on Delivery"
                      icon={Package}
                      description="Pay when you receive your order"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                    />
                    <PaymentMethodCard
                      method="Credit Card"
                      icon={CreditCard}
                      description="Secure payment with credit card"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                    />
                    <PaymentMethodCard
                      method="Bank Transfer"
                      icon={Shield}
                      description="Direct bank transfer payment"
                      selected={paymentMethod}
                      onSelect={setPaymentMethod}
                    />
                  </div>
                </div>
              </FadeIn>

              {/* Order Notes Section */}
              <FadeIn delay={0.2}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={18} className="text-[#8DC53E]" />
                    Order Notes (Optional)
                  </h2>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions, delivery preferences, or any other notes..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] outline-none transition-all resize-none"
                    rows={3}
                  />
                </div>
              </FadeIn>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <FadeIn delay={0.05}>
                <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

                  {/* Items Preview */}
                  <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                    {cart.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex gap-3 py-2 border-b border-gray-200 last:border-0">
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.imageUrl ? `${BASE_URL}${item.product.imageUrl}` : "/products/placeholder.jpg"}
                            alt={item.product.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "/products/placeholder.jpg"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{item.product.productName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-xs font-bold text-[#8DC53E]">Rs.{(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {cart.items.length > 3 && (
                      <p className="text-xs text-gray-400 text-center pt-1">+{cart.items.length - 3} more items</p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-900">Rs.{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Percent size={12} /> Discount
                        </span>
                        <span className="font-medium text-green-600">-Rs.{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Truck size={12} /> Shipping
                      </span>
                      <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-gray-900"}`}>
                        {shipping === 0 ? "Free" : `Rs.${shipping.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-[#8DC53E]">Rs.{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Free Shipping Notice */}
                  {subtotal < 5000 && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">
                        Add Rs.{(5000 - subtotal).toLocaleString()} more for free shipping!
                      </p>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || cart.items.length === 0 || !selectedAddress}
                    className="w-full mt-6 py-3 rounded-xl bg-[#8DC53E] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {loading ? "Processing..." : "Place Order"}
                  </button>

                  {/* Trust Badges */}
                  <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Shield size={12} /> Secure Checkout
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} /> Fast Delivery
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star size={12} /> Best Prices
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;