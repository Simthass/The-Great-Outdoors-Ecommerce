// Checkout.jsx - TESTABLE VERSION
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
        className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 data-testid="success-title" className="text-2xl font-bold mb-2">
            Order Placed Successfully!
          </h1>
          {orderData && (
            <div data-testid="success-order-details" className="bg-gray-50 p-4 mb-6 text-left">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span>{orderData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>Rs. {orderData.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
          <button
            data-testid="view-orders-btn"
            onClick={() => navigate("/orders")}
            className="w-full bg-[#8DC53E] text-white py-3 rounded-lg mb-2"
          >
            View My Orders
          </button>
          <button
            data-testid="continue-shopping-btn"
            onClick={() => navigate("/")}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="checkout-page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover flex items-center">
        <div className="container mx-auto px-4">
          <button
            data-testid="back-to-cart-btn"
            onClick={() => navigate("/cart")}
            className="flex items-center text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div data-testid="error-alert" className="mb-6 bg-red-50 p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            <div
              data-testid="payment-method-section"
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              {["Cash On Delivery", "Credit Card", "Debit Card"].map((method) => (
                <label key={method}>
                  <input
                    data-testid={`payment-option-${method.replace(/\s+/g, "-").toLowerCase()}`}
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  {method}
                </label>
              ))}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
              <textarea
                data-testid="order-notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div data-testid="order-summary" className="lg:col-span-1 bg-white rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span data-testid="subtotal">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (13%):</span>
                <span data-testid="tax">Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span data-testid="shipping">
                  {shipping === 0 ? "FREE" : `Rs. ${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span data-testid="grand-total">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              data-testid="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading || cart.items.length === 0}
              className="w-full bg-[#8DC53E] text-white py-4 rounded-lg"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

