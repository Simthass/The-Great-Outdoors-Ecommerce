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
  CreditCard,
  MapPin,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  User,
  ArrowRight,
  AlertCircle,
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
        fetchOrders();
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

  const orderStats = {
    total: orders.length,
    pending: orders.filter((order) => order.orderStatus === "Pending").length,
    processing: orders.filter((order) => order.orderStatus === "Processing")
      .length,
    delivered: orders.filter((order) => order.orderStatus === "Delivered")
      .length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat">
        <div className="h-full bg-black/40 flex items-center">
          <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
            <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
              My Orders
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex flex-col xl:flex-row min-h-screen ml-16 mr-16">
        {/* Left Sidebar - Order Stats */}
        <div className="xl:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 mb-8">
          <div className="p-8 space-y-8">
            {/* Stats Overview */}
            <div className="text-center pb-8 border-b border-gray-100">
              <div className="w-20 h-20 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-[#8DC53E]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Order History
              </h2>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>

            {/* Order Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#8DC53E]" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-[#8DC53E]/10 to-[#8DC53E]/5 rounded-xl p-4 border border-[#8DC53E]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orderStats.total}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-[#8DC53E]" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orderStats.pending}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Processing</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orderStats.processing}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Delivered</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {orderStats.delivered}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-[#8DC53E]" />
                Filters
              </h3>
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent bg-gray-50"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent appearance-none bg-gray-50"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-gray-100 space-y-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200 flex items-center justify-center"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh Orders
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="w-full bg-[#8DC53E] text-white py-3 rounded-xl font-medium hover:bg-[#7AB32E] transition-colors flex items-center justify-center"
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area - Orders List */}
        <div className="xl:w-2/3 bg-gray-50">
          <div className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-red-700">{error}</p>
                </div>
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
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
                  className="bg-[#8DC53E] text-white px-8 py-3 rounded-xl hover:bg-[#7AB32E] transition-colors font-medium inline-flex items-center"
                >
                  Start Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 text-xl">
                              Order #{order.orderId}
                            </h3>
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {getStatusIcon(order.orderStatus)}
                              <span className="ml-1.5">
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
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
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-1.5" />
                              {order.paymentMethod || "Credit Card"}
                            </div>
                            <span className="text-xl font-bold text-[#8DC53E]">
                              Rs.{" "}
                              {(
                                order.totalAmount +
                                order.shippingCost -
                                order.discount
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className="flex items-center px-4 py-2.5 bg-[#8DC53E] text-white rounded-xl hover:bg-[#7AB32E] transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>

                          <button
                            onClick={() => toggleOrderExpand(order._id)}
                            className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
                      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 border-t border-gray-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <Package className="w-5 h-5 mr-2 text-[#8DC53E]" />
                              Items ({order.items.length})
                            </h4>
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
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
                                    <p className="font-semibold text-gray-900 truncate">
                                      {item.productName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} × Rs.{" "}
                                      {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <span className="font-bold text-[#8DC53E]">
                                    Rs. {item.total.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary & Info */}
                          <div className="space-y-6">
                            {/* Order Summary */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2 text-[#8DC53E]" />
                                Order Summary
                              </h4>
                              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Subtotal
                                  </span>
                                  <span className="font-medium">
                                    Rs. {order.totalAmount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Shipping
                                  </span>
                                  <span className="font-medium">
                                    {order.shippingCost === 0
                                      ? "FREE"
                                      : `Rs. ${order.shippingCost.toFixed(2)}`}
                                  </span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Discount
                                    </span>
                                    <span className="font-medium text-green-600">
                                      -Rs. {order.discount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                  <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-[#8DC53E]">
                                      Rs.{" "}
                                      {(
                                        order.totalAmount +
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
                              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
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
                              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                <div className="flex items-center text-sm text-green-700">
                                  <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span>Tracking: {order.trackingNumber}</span>
                                </div>
                              </div>
                            )}

                            {order.orderStatus === "Pending" && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200"
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
                  className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
