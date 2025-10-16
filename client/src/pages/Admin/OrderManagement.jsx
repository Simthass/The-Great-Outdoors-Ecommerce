import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Eye,
  Edit3,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Package,
  DollarSign,
  User,
  ChevronUp,
  ChevronDown,
  MapPin,
  Phone,
  CreditCard,
  Package2,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    orderStatus: "",
    paymentStatus: "",
    trackingNumber: "",
    carrier: "",
    estimatedDelivery: "",
  });
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    ordersByStatus: [],
    revenueByStatus: {},
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    reportType: "orders",
    format: "pdf",
    period: "last30days",
    startDate: "",
    endDate: "",
  });
  const [currentSidebarPage, setSidebarPage] = useState("orders");
  const [userProfile, setUserProfile] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [error, setError] = useState("");

  // Ref for scrolling to top
  const topRef = useRef(null);
  const errorRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagination.page]);

  // Scroll to error when it occurs
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [error]);

  // Fetch user profile for sidebar
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await axios.get(`${API_URL}/admin/orders`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 0,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch orders";
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: "❌",
        style: {
          fontSize: "14px",
        },
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced analytics calculation
  const calculateAnalytics = (ordersData) => {
    if (!ordersData || ordersData.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        ordersByStatus: [],
        revenueByStatus: {},
      };
    }

    // Calculate revenue only for completed/delivered orders (not cancelled/refunded)
    const validOrders = ordersData.filter(
      (order) => !["Cancelled", "Refunded"].includes(order.orderStatus)
    );

    const totalRevenue = validOrders.reduce((sum, order) => {
      return (
        sum +
        (order.totalAmount + (order.shippingCost || 0) - (order.discount || 0))
      );
    }, 0);

    const totalOrders = ordersData.length;
    const avgOrderValue =
      validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // Orders by status
    const ordersByStatus = ordersData.reduce((acc, order) => {
      const status = order.orderStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Revenue by status
    const revenueByStatus = ordersData.reduce((acc, order) => {
      const status = order.orderStatus;
      const orderRevenue =
        order.totalAmount + (order.shippingCost || 0) - (order.discount || 0);
      acc[status] = (acc[status] || 0) + orderRevenue;
      return acc;
    }, {});

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({
        _id: status,
        count,
      })),
      revenueByStatus,
    };
  };

  // Fetch enhanced analytics
  const fetchAnalytics = async () => {
    setStatsLoading(true);
    try {
      // Fetch all orders for analytics calculation
      const response = await axios.get(`${API_URL}/admin/orders`, {
        params: {
          limit: 1000, // Get more orders for accurate analytics
          ...filters,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const ordersData = response.data.orders || [];
        const calculatedAnalytics = calculateAnalytics(ordersData);
        setAnalytics(calculatedAnalytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Fallback to calculating from current orders
      const calculatedAnalytics = calculateAnalytics(orders);
      setAnalytics(calculatedAnalytics);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
  }, [pagination.page, filters]);

  useEffect(() => {
    if (orders.length > 0) {
      fetchAnalytics();
    }
  }, [orders]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Toggle order details expansion
  const toggleOrderDetails = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Enhanced handleUpdateOrder function with stock management
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await axios.put(
        `${API_URL}/admin/orders/${selectedOrder._id}/update`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(`Order #${selectedOrder.orderId} updated successfully`, {
          icon: "✅",
          style: {
            fontSize: "14px",
          },
        });

        // If order is being cancelled, restore stock
        if (
          updateData.orderStatus === "Cancelled" &&
          selectedOrder.orderStatus !== "Cancelled"
        ) {
          await restoreOrderStock(selectedOrder._id);
        }

        // If order was cancelled and now being reactivated, reduce stock
        if (
          selectedOrder.orderStatus === "Cancelled" &&
          updateData.orderStatus !== "Cancelled"
        ) {
          await reduceOrderStock(selectedOrder._id);
        }

        fetchOrders();
        setShowUpdateModal(false);
        setSelectedOrder(null);
      } else {
        throw new Error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update order. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: "❌",
        style: {
          fontSize: "14px",
        },
      });
    }
  };

  // Restore stock when order is cancelled
  const restoreOrderStock = async (orderId) => {
    try {
      await axios.put(
        `${API_URL}/admin/orders/${orderId}/restore-stock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Stock restored for cancelled order");
    } catch (error) {
      console.error("Error restoring stock:", error);
      toast.error("Order cancelled but failed to restore stock", {
        icon: "⚠️",
        style: {
          fontSize: "14px",
        },
      });
    }
  };

  // Reduce stock when order is reactivated from cancelled status
  const reduceOrderStock = async (orderId) => {
    try {
      await axios.put(
        `${API_URL}/admin/orders/${orderId}/reduce-stock`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Stock reduced for reactivated order");
    } catch (error) {
      console.error("Error reducing stock:", error);
      toast.error("Order updated but failed to reduce stock", {
        icon: "⚠️",
        style: {
          fontSize: "14px",
        },
      });
    }
  };

  // Enhanced order cancellation with stock restoration
  const handleCancelOrder = async (orderId, reason) => {
    if (!reason) {
      toast.error("Cancellation reason is required", {
        icon: "❌",
        style: {
          fontSize: "14px",
        },
      });
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/admin/orders/${orderId}/cancel`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Restore stock for cancelled order
        await restoreOrderStock(orderId);

        toast.success("Order cancelled successfully and stock restored", {
          icon: "✅",
          style: {
            fontSize: "14px",
          },
        });
        fetchOrders();
        setShowCancelModal(false);
        setOrderToCancel(null);
      } else {
        throw new Error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to cancel order";
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: "❌",
        style: {
          fontSize: "14px",
        },
      });
    }
  };

  // Get status badge color with enhanced styling
  const getStatusBadgeColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Processing: "bg-blue-100 text-blue-800 border border-blue-200",
      Shipped: "bg-purple-100 text-purple-800 border border-purple-200",
      Delivered: "bg-green-100 text-green-800 border border-green-200",
      Cancelled: "bg-red-100 text-red-800 border border-red-200",
      Refunded: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Paid: "bg-green-100 text-green-800 border border-green-200",
      Failed: "bg-red-100 text-red-800 border border-red-200",
      Refunded: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Enhanced analytics cards with better UI
  const AnalyticsCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "neutral",
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">
            {title}
          </p>
          <p className="text-xl font-bold text-gray-900 truncate">
            {typeof value === "number" &&
            (title.includes("Revenue") || title.includes("Value"))
              ? formatCurrency(value)
              : value}
          </p>
          {change && (
            <p
              className={`text-xs font-medium mt-1 truncate ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={`p-2 rounded-lg flex-shrink-0 ml-3 ${
            title.includes("Revenue")
              ? "bg-green-50 text-green-600"
              : title.includes("Orders")
              ? "bg-blue-50 text-blue-600"
              : title.includes("Value")
              ? "bg-purple-50 text-purple-600"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  // Enhanced confirmation modal for cancellation
  const CancellationModal = ({ order, onConfirm, onCancel }) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      if (!reason.trim()) {
        toast.error("Please provide a cancellation reason", {
          icon: "❌",
          style: { fontSize: "14px" },
        });
        return;
      }

      setLoading(true);
      await onConfirm(order._id, reason);
      setLoading(false);
    };

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Order #{order.orderId}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              This action cannot be undone. The order amount will be deducted
              from total revenue.
            </p>
          </div>

          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !reason.trim()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle sidebar navigation
  const handleNavigation = (key) => {
    if (key === "dashboard") {
      navigate("/AdminDashboard");
    } else if (key === "users") {
      navigate("/Admin/User");
    } else if (key === "employees") {
      navigate("/Admin/Employee");
    } else if (key === "inventory") {
      navigate("/Admin/Inventory");
    } else if (key === "orders") {
      navigate("/Admin/Orders");
    } else if (key === "reviews") {
      navigate("/Admin/ReviewList");
    } else if (key === "products") {
      navigate("/Admin/AdminProduct");
    } else if (key === "reports") {
      navigate("/Admin/ReportGeneration/productReport");
    }
  };

  // Enhanced order details rendering
  const renderOrderDetails = (order) => {
    if (!expandedOrders.has(order._id)) return null;

    return (
      <tr key={`${order._id}-details`} className="bg-gray-50/50">
        <td colSpan="7" className="px-4 py-6">
          <div className="max-w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Order Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    Order Details - #{order.orderId}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Ordered: {formatDateTime(order.orderDate)}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span className="truncate">
                          Tracking: {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(
                      order.totalAmount + order.shippingCost - order.discount
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Grand Total</div>
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Customer Information */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="truncate">
                      <span className="font-medium">Name:</span>{" "}
                      {order.user?.firstName} {order.user?.lastName}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">Email:</span>{" "}
                      {order.user?.email}
                    </div>
                    {order.user?.phone && (
                      <div className="truncate">
                        <span className="font-medium">Phone:</span>{" "}
                        {order.user?.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <CreditCard className="h-3 w-3 text-green-600" />
                    Payment Information
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="truncate">
                      <span className="font-medium">Method:</span>{" "}
                      {order.paymentMethod}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    {order.paymentId && (
                      <div className="truncate">
                        <span className="font-medium">Payment ID:</span>{" "}
                        {order.paymentId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <Truck className="h-3 w-3 text-purple-600" />
                    Shipping Information
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    {order.carrier && (
                      <div className="truncate">
                        <span className="font-medium">Carrier:</span>{" "}
                        {order.carrier}
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div className="truncate">
                        <span className="font-medium">Est. Delivery:</span>{" "}
                        {formatDate(order.estimatedDelivery)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address & Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-600" />
                    Shipping Address
                  </h4>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div className="truncate">
                      {order.shippingAddress?.addressLine1}
                    </div>
                    {order.shippingAddress?.addressLine2 && (
                      <div className="truncate">
                        {order.shippingAddress.addressLine2}
                      </div>
                    )}
                    <div className="truncate">
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.province}{" "}
                      {order.shippingAddress?.postalCode}
                    </div>
                    <div className="truncate">
                      {order.shippingAddress?.country || "Sri Lanka"}
                    </div>
                    {order.shippingAddress?.phoneNumber && (
                      <div className="mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">
                          {order.shippingAddress.phoneNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <DollarSign className="h-3 w-3 text-gray-600" />
                    Order Summary
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatCurrency(order.shippingCost)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <hr className="my-1" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(
                          order.totalAmount +
                            order.shippingCost -
                            order.discount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border rounded-lg overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                    <Package2 className="h-3 w-3" />
                    Order Items ({order.items?.length || 0})
                  </h4>
                </div>
                <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {order.items?.map((item, index) => (
                    <div key={index} className="px-4 py-3 flex items-center">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img
                            src={
                              item.image.startsWith("http")
                                ? item.image
                                : `${BASE_URL}${item.image}`
                            }
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/products/placeholder.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.productName}
                        </div>
                        {item.sku && (
                          <div className="text-xs text-gray-500 truncate">
                            SKU: {item.sku}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 flex-shrink-0 ml-2">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-4 bg-yellow-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                    Order Notes
                  </h4>
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {order.notes}
                  </p>
                </div>
              )}

              {/* Coupon Information */}
              {order.couponCode && (
                <div className="mt-4 bg-green-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                    Coupon Applied
                  </h4>
                  <div className="text-xs text-gray-700">
                    <span className="font-medium">Code:</span>{" "}
                    {order.couponCode}
                    {order.couponDetails && (
                      <span className="ml-2">
                        <span className="font-medium">Discount:</span>{" "}
                        {formatCurrency(order.couponDetails.discountAmount)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setUpdateData({
                      orderStatus: order.orderStatus,
                      paymentStatus: order.paymentStatus,
                      trackingNumber: order.trackingNumber || "",
                      carrier: order.carrier || "",
                      estimatedDelivery: order.estimatedDelivery
                        ? new Date(order.estimatedDelivery)
                            .toISOString()
                            .split("T")[0]
                        : "",
                    });
                    setShowUpdateModal(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-sm"
                >
                  <Edit3 className="h-3 w-3" />
                  Update Order
                </button>
                {order.orderStatus !== "Cancelled" &&
                  order.orderStatus !== "Delivered" && (
                    <button
                      onClick={() => {
                        setOrderToCancel(order);
                        setShowCancelModal(true);
                      }}
                      className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium text-sm"
                    >
                      <XCircle className="h-3 w-3" />
                      Cancel Order
                    </button>
                  )}
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Handle report generation
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);

    try {
      const params = {
        reportType: reportConfig.reportType,
        period: reportConfig.period,
        ...(reportConfig.startDate && { startDate: reportConfig.startDate }),
        ...(reportConfig.endDate && { endDate: reportConfig.endDate }),
      };

      const endpoint =
        reportConfig.format === "pdf"
          ? `${API_URL}/reports/export/pdf`
          : `${API_URL}/reports/export/excel`;

      const response = await axios.get(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          reportConfig.format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `${reportConfig.reportType}-report-${timestamp}.${reportConfig.format}`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success(
        `${reportConfig.format.toUpperCase()} report generated successfully!`,
        {
          icon: "✅",
          style: { fontSize: "14px" },
        }
      );
      setShowReportModal(false);
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to generate report. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: "❌",
        style: { fontSize: "14px" },
      });
    } finally {
      setReportLoading(false);
    }
  };

  // Handle page change with scroll to top
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchOrders();
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to top button
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div data-testid="admin-order-management-loading">
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar
            currentPage={currentSidebarPage}
            onPageChange={handleNavigation}
            userProfile={userProfile}
          />

          <div className="flex-1 p-4 lg:p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavigation}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0" ref={topRef}>
          <div className="p-4 lg:p-6 max-w-full">
            {/* Error Display - Moved to top */}
            {error && (
              <div ref={errorRef} className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-1 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Header */}
            <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">
                  Order Management
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  Manage customer orders, update status, track deliveries, and
                  monitor revenue analytics
                </p>
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <button
                  onClick={fetchOrders}
                  className="flex items-center justify-center gap-2 bg-white text-gray-700 px-3 lg:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-200 font-medium text-sm flex-1 lg:flex-none"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-sm flex-1 lg:flex-none"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              </div>
            </div>

            {/* Enhanced Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AnalyticsCard
                title="Total Orders"
                value={analytics.totalOrders}
                icon={ShoppingCart}
                change={`${
                  analytics.ordersByStatus.find((s) => s._id === "Delivered")
                    ?.count || 0
                } delivered`}
                changeType="positive"
              />
              <AnalyticsCard
                title="Total Revenue"
                value={analytics.totalRevenue}
                icon={DollarSign}
                change={
                  analytics.totalRevenue > 0 ? "Active revenue" : "No revenue"
                }
                changeType={analytics.totalRevenue > 0 ? "positive" : "neutral"}
              />
              <AnalyticsCard
                title="Avg Order Value"
                value={analytics.avgOrderValue}
                icon={BarChart3}
                change={
                  analytics.avgOrderValue > 0
                    ? "Per order average"
                    : "No orders"
                }
                changeType={
                  analytics.avgOrderValue > 0 ? "positive" : "neutral"
                }
              />
              <AnalyticsCard
                title="Completed Orders"
                value={
                  analytics.ordersByStatus.find((s) => s._id === "Delivered")
                    ?.count || 0
                }
                icon={CheckCircle}
                change={`${
                  Math.round(
                    ((analytics.ordersByStatus.find(
                      (s) => s._id === "Delivered"
                    )?.count || 0) /
                      analytics.totalOrders) *
                      100
                  ) || 0
                }% completion`}
                changeType="positive"
              />
            </div>

            {/* Enhanced Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Orders
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Order ID, customer..."
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      handleFilterChange("paymentStatus", e.target.value)
                    }
                  >
                    <option value="">All Payment</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => {
                    setFilters({
                      status: "",
                      paymentStatus: "",
                      search: "",
                      startDate: "",
                      endDate: "",
                    });
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Enhanced Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-gray-900">
                      Orders
                    </h2>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Showing {orders.length} of {pagination.total} orders
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <RefreshCw className="h-3 w-3" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    No orders found
                  </h3>
                  <p className="text-gray-600 text-sm max-w-sm mx-auto">
                    {filters.status || filters.paymentStatus || filters.search
                      ? "Try adjusting your filters to see more results."
                      : "No orders have been placed yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Order ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Payment
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Total
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <React.Fragment key={order._id}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <button
                                  onClick={() => toggleOrderDetails(order._id)}
                                  className="mr-2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                                >
                                  {expandedOrders.has(order._id) ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </button>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                                    {order.orderId}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.items?.length || 0} items
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                  {order.user?.firstName} {order.user?.lastName}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-[120px]">
                                  {order.user?.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(order.orderDate)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.orderDate).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                                  order.orderStatus
                                )}`}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(
                                  order.paymentStatus
                                )}`}
                              >
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(
                                  order.totalAmount +
                                    order.shippingCost -
                                    order.discount
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => toggleOrderDetails(order._id)}
                                  className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setUpdateData({
                                      orderStatus: order.orderStatus,
                                      paymentStatus: order.paymentStatus,
                                      trackingNumber:
                                        order.trackingNumber || "",
                                      carrier: order.carrier || "",
                                      estimatedDelivery: order.estimatedDelivery
                                        ? new Date(order.estimatedDelivery)
                                            .toISOString()
                                            .split("T")[0]
                                        : "",
                                    });
                                    setShowUpdateModal(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition-colors"
                                  title="Edit Order"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {renderOrderDetails(order)}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Enhanced Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(1, pagination.page - 1))
                        }
                        disabled={pagination.page === 1}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.pages, pagination.page + 1)
                          )
                        }
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Update Order Modal */}
            {showUpdateModal && selectedOrder && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Update Order #{selectedOrder.orderId}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Update order status and tracking information
                    </p>
                  </div>
                  <form onSubmit={handleUpdateOrder}>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Order Status
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={updateData.orderStatus}
                          onChange={(e) =>
                            setUpdateData((prev) => ({
                              ...prev,
                              orderStatus: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Status
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={updateData.paymentStatus}
                          onChange={(e) =>
                            setUpdateData((prev) => ({
                              ...prev,
                              paymentStatus: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={updateData.trackingNumber}
                          onChange={(e) =>
                            setUpdateData((prev) => ({
                              ...prev,
                              trackingNumber: e.target.value,
                            }))
                          }
                          placeholder="Enter tracking number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carrier
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={updateData.carrier}
                          onChange={(e) =>
                            setUpdateData((prev) => ({
                              ...prev,
                              carrier: e.target.value,
                            }))
                          }
                          placeholder="e.g., DHL, FedEx, UPS"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Delivery
                        </label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={updateData.estimatedDelivery}
                          onChange={(e) =>
                            setUpdateData((prev) => ({
                              ...prev,
                              estimatedDelivery: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUpdateModal(false);
                          setSelectedOrder(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Update Order
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Cancellation Modal */}
            {showCancelModal && orderToCancel && (
              <CancellationModal
                order={orderToCancel}
                onConfirm={handleCancelOrder}
                onCancel={() => {
                  setShowCancelModal(false);
                  setOrderToCancel(null);
                }}
              />
            )}

            {/* Report Generation Modal */}
            {showReportModal && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generate Report
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Export order data in your preferred format
                    </p>
                  </div>
                  <form onSubmit={handleGenerateReport}>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Report Type
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={reportConfig.reportType}
                          onChange={(e) =>
                            setReportConfig((prev) => ({
                              ...prev,
                              reportType: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="orders">Orders Report</option>
                          <option value="sales">Sales Summary</option>
                          <option value="customers">Customer Analytics</option>
                          <option value="products">Product Performance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Format
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={reportConfig.format}
                          onChange={(e) =>
                            setReportConfig((prev) => ({
                              ...prev,
                              format: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="pdf">PDF</option>
                          <option value="excel">Excel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Period
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={reportConfig.period}
                          onChange={(e) =>
                            setReportConfig((prev) => ({
                              ...prev,
                              period: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="last7days">Last 7 Days</option>
                          <option value="last30days">Last 30 Days</option>
                          <option value="last3months">Last 3 Months</option>
                          <option value="last6months">Last 6 Months</option>
                          <option value="lastyear">Last Year</option>
                          <option value="custom">Custom Range</option>
                        </select>
                      </div>

                      {reportConfig.period === "custom" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              value={reportConfig.startDate}
                              onChange={(e) =>
                                setReportConfig((prev) => ({
                                  ...prev,
                                  startDate: e.target.value,
                                }))
                              }
                              required={reportConfig.period === "custom"}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              value={reportConfig.endDate}
                              onChange={(e) =>
                                setReportConfig((prev) => ({
                                  ...prev,
                                  endDate: e.target.value,
                                }))
                              }
                              required={reportConfig.period === "custom"}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReportModal(false);
                          setReportConfig({
                            reportType: "orders",
                            format: "pdf",
                            period: "last30days",
                            startDate: "",
                            endDate: "",
                          });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={reportLoading}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {reportLoading ? "Generating..." : "Generate Report"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Enhanced Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition duration-200 hover:shadow-xl z-40"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
