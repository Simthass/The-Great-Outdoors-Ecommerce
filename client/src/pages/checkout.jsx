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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        {
          paymentMethod,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setOrderData(response.data.data.order);
        setOrderSuccess(true);

        // Auto redirect after 5 seconds
        setTimeout(() => {
          navigate("/");
        }, 5000);
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

  // Calculate totals
  const subtotal = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.13; // 13% tax
  const shipping = subtotal > 100 ? 0 : 15;
  const grandTotal = subtotal + tax + shipping;

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {orderData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Order ID:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {orderData.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Total Amount:
                </span>
                <span className="text-sm font-bold text-green-600">
                  Rs. {orderData.grandTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Status:
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {orderData.orderStatus}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-[#8DC53E] text-white py-3 rounded-lg font-medium hover:bg-[#7AB32E] transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Redirecting to home page in 5 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex items-center">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center text-white mb-2 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-5 h-5 text-[#8DC53E] mr-2" />
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {["Cash On Delivery", "Credit Card", "Debit Card"].map(
                    (method) => (
                      <label
                        key={method}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-[#8DC53E] focus:ring-[#8DC53E]"
                        />
                        <span className="ml-3 text-gray-700">{method}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">
                  Order Notes (Optional)
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for delivery..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-4">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={`http://localhost:5000${item.product.imageUrl}`}
                          alt={item.product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Rs. {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-200 mb-4" />

                {/* Price Breakdown */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      Rs. {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (13%):</span>
                    <span className="font-medium">Rs. {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shipping === 0 ? "FREE" : `Rs. ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-[#8DC53E]">
                      Rs. {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || cart.items.length === 0}
                  className="w-full bg-[#8DC53E] text-white py-4 rounded-lg font-semibold hover:bg-[#7AB32E] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </button>

                {subtotal > 100 && (
                  <p className="text-sm text-green-600 text-center mt-2">
                    🎉 You qualify for free shipping!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
