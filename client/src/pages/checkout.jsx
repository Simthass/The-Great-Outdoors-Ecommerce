// Checkout.jsx - MODERN UI VERSION
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
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
} from "lucide-react";

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [cart, setCart] = useState({ items: [] });
  const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");
  const [notes, setNotes] = useState("");

  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchCart();
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

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/orders/checkout`,
        { paymentMethod, notes },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (response.data.success) {
        setOrderData(response.data.data.order);
        setOrderSuccess(true);
        setTimeout(() => navigate("/"), 5000);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to process order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Totals
  const subtotal = cart.items.reduce(
    (t, item) => t + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.13;
  const shipping = subtotal > 100 ? 0 : 15;
  const grandTotal = subtotal + tax + shipping;

  if (orderSuccess) {
    return (
      <div
        data-testid="checkout-success-page"
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4"
      >
        <div className="max-w-lg w-full">
          {/* Success Animation Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-[#8DC53E] to-emerald-400 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-[#8DC53E] to-emerald-400 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-8 pt-8 pb-6 text-center">
              <h1
                data-testid="success-title"
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                Order Placed Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order is being processed.
              </p>

              {orderData && (
                <div
                  data-testid="success-order-details"
                  className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 mb-6 border border-gray-100"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-left">
                      <span className="text-gray-500 block">Order ID</span>
                      <span className="font-semibold text-gray-900">
                        {orderData.orderId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block">Total Amount</span>
                      <span
                        className="font-bold text-lg"
                        style={{ color: "#8DC53E" }}
                      >
                        Rs. {orderData.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 pb-8 space-y-3">
              <button
                data-testid="view-orders-btn"
                onClick={() => navigate("/orders")}
                className="w-full bg-gradient-to-r text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                style={{
                  background: "linear-gradient(to right, #8DC53E, #10b981)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(to right, #7AB82D, #059669)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(to right, #8DC53E, #10b981)";
                }}
              >
                View My Orders
              </button>
              <button
                data-testid="continue-shopping-btn"
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center items-center space-x-6 mt-8 text-gray-400 text-sm">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>Secure</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Fast</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span>Trusted</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="checkout-page"
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50"
    >
      {/* Modern Header with Gradient */}

      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Checkout</p>
      </div>

      <div className="container mx-auto px-20 py-12">
        {error && (
          <div
            data-testid="error-alert"
            className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Payment & Notes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Method Section */}
            <div
              data-testid="payment-method-section"
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-green-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(141, 197, 62, 0.2)" }}
                  >
                    <CreditCard
                      className="w-5 h-5"
                      style={{ color: "#8DC53E" }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Payment Method
                  </h2>
                </div>
                <p className="text-gray-600 mt-2">
                  Choose how you'd like to pay for your order
                </p>
              </div>

              <div className="p-8">
                <div className="grid gap-4">
                  {[
                    {
                      value: "Cash On Delivery",
                      icon: Package,
                      desc: "Pay when you receive your order",
                    },
                    {
                      value: "Credit Card",
                      icon: CreditCard,
                      desc: "Secure payment with your credit card",
                    },
                    {
                      value: "Debit Card",
                      icon: CreditCard,
                      desc: "Pay directly from your bank account",
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`relative flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        paymentMethod === method.value
                          ? "shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{
                        borderColor:
                          paymentMethod === method.value ? "#8DC53E" : "",
                        backgroundColor:
                          paymentMethod === method.value
                            ? "rgba(141, 197, 62, 0.05)"
                            : "",
                      }}
                    >
                      <input
                        data-testid={`payment-option-${method.value
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4`}
                        style={{
                          backgroundColor:
                            paymentMethod === method.value
                              ? "rgba(141, 197, 62, 0.2)"
                              : "#f3f4f6",
                        }}
                      >
                        <method.icon
                          className={`w-6 h-6`}
                          style={{
                            color:
                              paymentMethod === method.value
                                ? "#8DC53E"
                                : "#6b7280",
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`font-semibold`}
                            style={{
                              color:
                                paymentMethod === method.value
                                  ? "#8DC53E"
                                  : "#111827",
                            }}
                          >
                            {method.value}
                          </h3>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
                            style={{
                              borderColor:
                                paymentMethod === method.value
                                  ? "#8DC53E"
                                  : "#d1d5db",
                              backgroundColor:
                                paymentMethod === method.value
                                  ? "#8DC53E"
                                  : "transparent",
                            }}
                          >
                            {paymentMethod === method.value && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {method.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Notes Section */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-green-50 px-8 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Notes
                </h2>
                <p className="text-gray-600 mt-2">
                  Add special instructions for your order (optional)
                </p>
              </div>
              <div className="p-8">
                <textarea
                  data-testid="order-notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, delivery preferences, or any other notes..."
                  className="w-full p-6 border-2 border-gray-200 rounded-2xl resize-none transition-colors duration-200 focus:outline-none focus:ring-0"
                  style={{
                    borderColor: notes ? "#8DC53E" : "#e5e7eb",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8DC53E";
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.style.borderColor = "#e5e7eb";
                    }
                  }}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div
                data-testid="order-summary"
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
              >
                <div
                  className="px-8 py-6"
                  style={{
                    background: "linear-gradient(to right, #8DC53E, #10b981)",
                  }}
                >
                  <h2 className="text-2xl font-bold text-white">
                    Order Summary
                  </h2>
                  <p className="text-white opacity-80 mt-1">
                    {cart.items.length} item{cart.items.length !== 1 ? "s" : ""}{" "}
                    in your cart
                  </p>
                </div>

                <div className="p-8">
                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span data-testid="subtotal" className="font-semibold">
                        Rs. {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (13%)</span>
                      <span data-testid="tax" className="font-semibold">
                        Rs. {tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="flex items-center">
                        <Truck className="w-4 h-4 mr-1" />
                        Shipping
                      </span>
                      <span
                        data-testid="shipping"
                        className={`font-semibold ${shipping === 0 ? "" : ""}`}
                        style={{
                          color: shipping === 0 ? "#8DC53E" : "#374151",
                        }}
                      >
                        {shipping === 0 ? "FREE" : `Rs. ${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span
                          data-testid="grand-total"
                          style={{ color: "#8DC53E" }}
                        >
                          Rs. {grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-3 gap-2 mb-8 text-center">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Shield
                        className="w-5 h-5 mx-auto mb-1"
                        style={{ color: "#8DC53E" }}
                      />
                      <span className="text-xs text-gray-600">Secure</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Truck className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <span className="text-xs text-gray-600">Fast</span>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                      <span className="text-xs text-gray-600">Trusted</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    data-testid="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || cart.items.length === 0}
                    className="w-full text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed"
                    style={{
                      background:
                        loading || cart.items.length === 0
                          ? "linear-gradient(to right, #d1d5db, #9ca3af)"
                          : "linear-gradient(to right, #8DC53E, #10b981)",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && cart.items.length > 0) {
                        e.target.style.background =
                          "linear-gradient(to right, #7AB82D, #059669)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && cart.items.length > 0) {
                        e.target.style.background =
                          "linear-gradient(to right, #8DC53E, #10b981)";
                      }
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing Order...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Place Order
                      </div>
                    )}
                  </button>

                  {subtotal > 100 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold">
                          You qualify for free shipping!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
