import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Phone,
  AlertCircle,
  ChevronRight,
  User,
  FileText,
  DollarSign,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrderDetails();
  }, [id, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/orders/${order._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        fetchOrderDetails();
        alert("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC53E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-[#8DC53E] text-white px-6 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-[#8DC53E] text-white px-6 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const grandTotal = order.totalAmount + order.shippingCost - order.discount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat">
        <div className="h-full bg-black/40 flex items-center">
          <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
            <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
              Order Details
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex flex-col xl:flex-row min-h-screen ml-16 mr-16">
        {/* Left Sidebar - Order Summary */}
        <div className="xl:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100  mt-8 mb-8">
          <div className="p-8 space-y-8">
            {/* Quick Order Info */}
            <div className="text-center pb-8 border-b border-gray-100">
              <div className="w-20 h-20 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-[#8DC53E]" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  #{order.orderId}
                </h2>
                <button
                  onClick={copyOrderId}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy Order ID"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                {copySuccess && (
                  <span className="text-sm text-green-600 font-medium">
                    Copied!
                  </span>
                )}
              </div>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {getStatusIcon(order.orderStatus)}
                <span className="ml-2">{order.orderStatus}</span>
              </div>
            </div>

            {/* Order Totals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-[#8DC53E]" />
                Order Summary
              </h3>
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    Rs. {order.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {order.shippingCost === 0
                      ? "FREE"
                      : `Rs. ${order.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -Rs. {order.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-[#8DC53E]">
                      Rs. {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#8DC53E]" />
                Order Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 mr-2">Placed:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 mr-2">Payment:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 mr-2">Status:</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === "Paid"
                        ? "text-green-600"
                        : order.paymentStatus === "Failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-gray-100 space-y-3">
              {order.orderStatus === "Pending" && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
                >
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => navigate("/orders")}
                className="w-full bg-[#8DC53E] text-white py-3 rounded-lg font-medium hover:bg-[#7AB32E] transition-colors"
              >
                Back to All Orders
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="xl:w-2/3 bg-gray-50">
          <div className="p-8 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Items Ordered
                  </h3>
                  <span className="bg-[#8DC53E]/10 text-[#8DC53E] px-3 py-1 rounded-full text-sm font-medium">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm border">
                          <img
                            src={
                              item.image
                                ? `http://localhost:5000${item.image}`
                                : "/products/placeholder.jpg"
                            }
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/products/placeholder.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {item.productName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center bg-white px-3 py-1 rounded-full border">
                              <span className="font-medium">Quantity:</span>
                              <span className="ml-1 font-bold text-gray-900">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span>
                                Unit Price: Rs. {item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {item.sku && (
                            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#8DC53E]">
                            Rs. {item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <MapPin className="w-6 h-6 text-[#8DC53E] mr-2" />
                    Delivery Address
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <div className="space-y-2">
                      <p className="font-bold text-gray-900 text-lg">
                        {order.shippingAddress.addressLine1}
                      </p>
                      {order.shippingAddress.addressLine2 && (
                        <p className="text-gray-700">
                          {order.shippingAddress.addressLine2}
                        </p>
                      )}
                      <p className="text-gray-700">
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.province}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-700 font-semibold">
                        {order.shippingAddress.country}
                      </p>
                      {order.shippingAddress.phoneNumber && (
                        <div className="flex items-center pt-3 mt-3 border-t border-blue-200">
                          <Phone className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-gray-700 font-medium">
                            {order.shippingAddress.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Truck className="w-6 h-6 text-[#8DC53E] mr-2" />
                    Shipping Details
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {order.trackingNumber && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center mb-2">
                        <Package className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-sm font-bold text-purple-900">
                          Tracking Number
                        </span>
                      </div>
                      <p className="text-purple-800 font-mono bg-purple-100 px-3 py-2 rounded text-sm">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}

                  {order.estimatedDelivery && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-bold text-green-900">
                          Estimated Delivery
                        </span>
                      </div>
                      <p className="text-black font-semibold">
                        {new Date(order.estimatedDelivery).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  )}

                  {!order.trackingNumber && !order.estimatedDelivery && (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Shipping details will be updated soon</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <AlertCircle className="w-6 h-6 text-[#8DC53E] mr-2" />
                    Special Instructions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-100">
                    <p className="text-gray-800 leading-relaxed font-medium">
                      {order.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Continue Shopping */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="max-w-md mx-auto">
                <Package className="w-16 h-16 text-[#8DC53E] mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Thank you for your order!
                </h3>
                <p className="text-gray-600 mb-6">
                  Continue shopping to discover more amazing products.
                </p>
                <button
                  onClick={() => navigate("/shop")}
                  className="bg-[#8DC53E] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#7AB32E] transition-colors inline-flex items-center"
                >
                  Continue Shopping
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
