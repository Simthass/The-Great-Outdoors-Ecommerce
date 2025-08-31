import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
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
  Clock,
  Package2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set()); // Track expanded orders
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
  const [analytics, setAnalytics] = useState(null);
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

  // Ref for scrolling to top
  const topRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagination.page]);

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
      toast.error(error.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/orders/analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
    fetchAnalytics();
  }, [pagination.page, filters]);

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

  // Enhanced handleUpdateOrder function
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
          icon: <CheckCircle className="notification-icon text-green-500" />,
        });
        fetchOrders();
        setShowUpdateModal(false);
        setSelectedOrder(null);
      } else {
        throw new Error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update order. Please try again."
      );
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId, reason) => {
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
        toast.success("Order cancelled successfully");
        fetchOrders();
      } else {
        throw new Error(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
      Shipped: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      Refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Format currency
  const formatCurrency = (totalAmount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(totalAmount || 0);
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
        `${reportConfig.format.toUpperCase()} report generated successfully!`
      );
      setShowReportModal(false);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to generate report. Please try again."
      );
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

  // Handle sidebar navigation
  const handleNavClick = (key) => {
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
    } else if (key === "Products") {
      navigate("/Admin/AdminProduct");
    } else if (key === "reports") {
      navigate("/Admin/ReportGeneration/productReport");
    }
  };

  // Render order details row
  const renderOrderDetails = (order) => {
    if (!expandedOrders.has(order._id)) return null;

    return (
      <tr key={`${order._id}-details`} className="bg-gray-50">
        <td colSpan="7" className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Order Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Order Details - #{order.orderId}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Ordered: {formatDateTime(order.orderDate)}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      order.totalAmount + order.shippingCost - order.discount
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Grand Total</div>
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {order.user?.firstName} {order.user?.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {order.user?.email}
                    </div>
                    {order.user?.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {order.user?.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    Payment Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Method:</span>{" "}
                      {order.paymentMethod}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    {order.paymentId && (
                      <div>
                        <span className="font-medium">Payment ID:</span>{" "}
                        {order.paymentId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-purple-600" />
                    Shipping Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    {order.carrier && (
                      <div>
                        <span className="font-medium">Carrier:</span>{" "}
                        {order.carrier}
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div>
                        <span className="font-medium">Est. Delivery:</span>{" "}
                        {formatDate(order.estimatedDelivery)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-700">
                    <div>{order.shippingAddress?.addressLine1}</div>
                    {order.shippingAddress?.addressLine2 && (
                      <div>{order.shippingAddress.addressLine2}</div>
                    )}
                    <div>
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.province}{" "}
                      {order.shippingAddress?.postalCode}
                    </div>
                    <div>{order.shippingAddress?.country || "Sri Lanka"}</div>
                    {order.shippingAddress?.phoneNumber && (
                      <div className="mt-2 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.shippingAddress.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
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
                    <hr className="my-2" />
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
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package2 className="h-4 w-4" />
                    Order Items ({order.items?.length || 0})
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {order.items?.map((item, index) => (
                    <div key={index} className="px-6 py-4 flex items-center">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
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
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </div>
                        {item.sku && (
                          <div className="text-xs text-gray-500">
                            SKU: {item.sku}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Order Notes
                  </h4>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              )}

              {/* Coupon Information */}
              {order.couponCode && (
                <div className="mt-6 bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Coupon Applied
                  </h4>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Code:</span>{" "}
                    {order.couponCode}
                    {order.couponDetails && (
                      <span className="ml-4">
                        <span className="font-medium">Discount:</span>{" "}
                        {formatCurrency(order.couponDetails.discountAmount)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
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
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                  Update Order
                </button>
                {order.orderStatus !== "Cancelled" &&
                  order.orderStatus !== "Delivered" && (
                    <button
                      onClick={() => {
                        const reason = prompt("Enter cancellation reason:");
                        if (reason) {
                          handleCancelOrder(order._id, reason);
                        }
                      }}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      <XCircle className="h-4 w-4" />
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

  if (loading && orders.length === 0) {
    return (
      <div>
        {/* Header */}
        <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
          <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
            Admin - Order Management
          </p>
        </div>

        <div className="flex rounded-lg mt-6">
          {/* Sidebar Loading */}
          <aside className="bg-green-600 text-white h-screen sticky top-0 w-20 rounded-lg">
            <div className="animate-pulse p-4">
              <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-8"></div>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-green-500 rounded-lg mb-3"
                ></div>
              ))}
            </div>
          </aside>

          {/* Main Content Loading */}
          <div className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
          Admin - Order Management
        </p>
      </div>

      <div className="flex bg-gray-50 min-h-screen mt-6 rounded-2xl">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavClick}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 max-w-7xl mx-auto" ref={topRef}>
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order Management
              </h1>
              <p className="text-gray-600">
                Manage customer orders, update status, and track deliveries
              </p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <Download className="h-4 w-4" />
              Generate Report
            </button>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalOrders || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics.avgOrderValue || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="notification-icon text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.ordersByStatus?.find(
                        (s) => s._id === "Delivered"
                      )?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Order ID, customer..."
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div className="flex items-end">
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
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Orders</h2>
                <button
                  onClick={fetchOrders}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleOrderDetails(order._id)}
                                className="mr-2 text-gray-500 hover:text-gray-700"
                              >
                                {expandedOrders.has(order._id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {order.user?.firstName} {order.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(order.orderDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(
                              order.totalAmount +
                                order.shippingCost -
                                order.discount
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleOrderDetails(order._id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
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
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit3 className="h-4 w-4" />
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, pagination.page - 1))
                    }
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.pages, pagination.page + 1)
                      )
                    }
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Update Order Modal */}
          {showUpdateModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Update Order #{selectedOrder.orderId}
                </h3>
                <form onSubmit={handleUpdateOrder}>
                  <div className="space-y-4">
                    {/* Order Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Payment Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Tracking Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Carrier */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Carrier
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={updateData.carrier}
                        onChange={(e) =>
                          setUpdateData((prev) => ({
                            ...prev,
                            carrier: e.target.value,
                          }))
                        }
                        placeholder="e.g. DHL, FedEx"
                      />
                    </div>

                    {/* Estimated Delivery */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Delivery
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateModal(false);
                        setSelectedOrder(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Update Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Report Generation Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Generate Report
                </h3>
                <form onSubmit={handleGenerateReport}>
                  <div className="space-y-4">
                    {/* Report Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Report Type
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Format
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Period */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Period
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Custom Date Range */}
                    {reportConfig.period === "custom" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="flex justify-end space-x-3 mt-6">
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
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {reportLoading ? "Generating..." : "Generate Report"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
