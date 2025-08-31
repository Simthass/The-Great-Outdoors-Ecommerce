import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  MoreVertical,
  ArrowRight,
  CreditCard,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, currentPage, selectedStatus, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (selectedStatus) params.append("status", selectedStatus);

      const response = await axios.get(`${API_URL}/orders/user`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination.totalPages);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        fetchOrders(); // Refresh orders
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
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "Shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "Delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Safely handle undefined/null orderId
    const orderId = order?.orderId ? order.orderId.toLowerCase() : "";
    const status = order?.orderStatus ? order.orderStatus.toLowerCase() : "";
    const search = searchTerm.toLowerCase();

    return orderId.includes(search) || status.includes(search);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC53E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full h-[150px] bg-gradient-to-r from-[#8DC53E] to-[#6DA52A] flex items-center px-4 md:px-8">
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            My Orders
          </h1>
          <p className="text-white/90 mt-2">Track and manage your orders</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-16 relative">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {orders.length}
                  </p>
                </div>
                <div className="bg-[#8DC53E]/10 p-3 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-[#8DC53E]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      orders.filter((order) => order.orderStatus === "Pending")
                        .length
                    }
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Processing</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      orders.filter(
                        (order) => order.orderStatus === "Processing"
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      orders.filter(
                        (order) => order.orderStatus === "Delivered"
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Order History
                </h2>
                <p className="text-gray-500 text-sm">
                  Manage and track your orders
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Refresh Orders"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || selectedStatus
                  ? "No orders found"
                  : "No orders yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedStatus
                  ? "Try adjusting your search or filter criteria"
                  : "Start shopping to see your orders here"}
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="bg-[#8DC53E] text-white px-6 py-3 rounded-lg hover:bg-[#7AB32E] transition-colors font-medium"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Order #{order.orderId}
                          </h3>
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            {getStatusIcon(order.orderStatus)}
                            <span className="ml-1.5">{order.orderStatus}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            Rs.{" "}
                            {(
                              order.totalAmount +
                              order.tax +
                              order.shippingCost -
                              order.discount
                            ).toFixed(2)}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1.5" />
                            {order.paymentMethod || "Credit Card"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="flex items-center px-4 py-2.5 bg-[#8DC53E] text-white rounded-lg hover:bg-[#7AB32E] transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>

                        <button
                          onClick={() => toggleOrderExpand(order._id)}
                          className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {expandedOrder === order._id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Order Details */}
                  {expandedOrder === order._id && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">
                            Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100"
                              >
                                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={
                                      item.image
                                        ? `http://localhost:5000${item.image}`
                                        : "/products/placeholder.jpg"
                                    }
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "/products/placeholder.jpg";
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {item.productName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity} × Rs.{" "}
                                    {item.price.toFixed(2)}
                                  </p>
                                </div>
                                <span className="font-medium text-gray-900">
                                  Rs. {item.total.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">
                            Order Summary
                          </h4>
                          <div className="bg-white rounded-lg border border-gray-100 p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">
                                  Rs. {order.totalAmount.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium">
                                  Rs. {order.shippingCost.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax</span>
                                <span className="font-medium">
                                  Rs. {order.tax.toFixed(2)}
                                </span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">
                                    Discount
                                  </span>
                                  <span className="font-medium text-green-600">
                                    -Rs. {order.discount.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between font-semibold">
                                  <span>Total</span>
                                  <span>
                                    Rs.{" "}
                                    {(
                                      order.totalAmount +
                                      order.tax +
                                      order.shippingCost -
                                      order.discount
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Info */}
                          {order.estimatedDelivery && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex items-center text-sm text-blue-700">
                                <Truck className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>
                                  Estimated delivery:{" "}
                                  {new Date(
                                    order.estimatedDelivery
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}

                          {order.trackingNumber && (
                            <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100">
                              <div className="flex items-center text-sm text-green-700">
                                <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>
                                  Tracking Number: {order.trackingNumber}
                                </span>
                              </div>
                            </div>
                          )}

                          {order.orderStatus === "Pending" && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="mt-4 w-full flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#8DC53E] text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
