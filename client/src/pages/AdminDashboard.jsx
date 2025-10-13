// pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  AlertCircle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Eye,
  MessageCircle,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [currentSidebarPage, setSidebarPage] = useState("dashboard");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchUserProfile();
    fetchDashboardData();
  }, []);

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [
        statsRes,
        recentOrdersRes,
        recentReviewsRes,
        activitiesRes,
        topProductsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/orders?limit=5&sort=-createdAt`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/reviews?limit=5&sort=-createdAt`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/products/top-selling?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("Recent Reviews Response:", recentReviewsRes.data);
      console.log("Top Products Response:", topProductsRes.data);

      setDashboardData({
        stats: statsRes.data.data,
        recentOrders: recentOrdersRes.data.orders || [],
        recentReviews: recentReviewsRes.data.reviews || [],
        activities: activitiesRes.data.activities || [],
        topProducts: topProductsRes.data.products || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set fallback data
      setDashboardData({
        stats: {
          totalRevenue: 0,
          revenueGrowth: 0,
          totalCustomers: 0,
          newCustomers: 0,
          totalProducts: 0,
          lowStockProducts: 0,
          totalOrders: 0,
          pendingOrders: 0,
          pageViews: 0,
          conversionRate: "0%",
          avgRating: "0.0",
          pendingTasks: 0,
        },
        recentOrders: [],
        recentReviews: [],
        activities: [],
        topProducts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (key) => {
    setSidebarPage(key);
    const routes = {
      dashboard: "/AdminDashboard",
      users: "/Admin/User",
      products: "/Admin/AdminProduct",
      orders: "/Admin/OrderManagement",
      inventory: "/Admin/Inventory",
      reviews: "/Admin/ReviewList",
      coupons: "/Admin/AdminCoupons",
      events: "/Admin/EventManagement",
      content: "/Admin/ContentManagement",
      reports: "/Admin/ReportGeneration/productReport",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
      Shipped: "bg-purple-100 text-purple-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      hidden: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getProductImageUrl = (product) => {
    // Check for images array first
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.startsWith("http")) return firstImage;
      if (firstImage.startsWith("/products/")) {
        return `${BASE_URL}${firstImage}`;
      }
      return `${BASE_URL}/uploads/${firstImage}`;
    }

    // Fallback to imageUrl
    if (product.imageUrl) {
      if (product.imageUrl.startsWith("http")) return product.imageUrl;
      if (product.imageUrl.startsWith("/uploads/")) {
        return `${BASE_URL}${product.imageUrl}`;
      }
      return `${BASE_URL}/uploads/${product.imageUrl}`;
    }

    // Final fallback
    return "/products/placeholder.jpg";
  };

  const trimProductName = (name, maxLength = 40) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavClick}
          userProfile={userProfile}
        />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, recentOrders, recentReviews, activities, topProducts } =
    dashboardData || {};

  console.log("Dashboard Data:", {
    recentReviews,
    topProducts,
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentSidebarPage}
        onPageChange={handleNavClick}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {userProfile?.firstName}! Here's what's happening
              with your store today.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    +{stats?.revenueGrowth || 0}% from last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-[#8DC53E]" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.totalOrders || 0}
                </p>
                <div className="flex items-center mt-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">
                    {stats?.pendingOrders || 0} pending
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.totalCustomers || 0}
                </p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600 font-medium">
                    +{stats?.newCustomers || 0} new this month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.totalProducts || 0}
                </p>
                <div className="flex items-center mt-2">
                  <Package className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600 font-medium">
                    {stats?.lowStockProducts || 0} low stock
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <button
                onClick={() => navigate("/Admin/OrderManagement")}
                className="text-[#8DC53E] hover:text-[#7AB32E] text-sm font-medium flex items-center"
              >
                View all
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders?.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.orderId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Reviews
              </h2>
              <button
                onClick={() => navigate("/Admin/ReviewList")}
                className="text-[#8DC53E] hover:text-[#7AB32E] text-sm font-medium flex items-center"
              >
                View all
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {recentReviews && recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div
                    key={review._id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-[#8DC53E]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {review.reviewerName || "Customer"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {review.comment || "No comment provided"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {activities && activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#8DC53E] rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Selling Products
              </h2>
              <button
                onClick={() => navigate("/Admin/AdminProduct")}
                className="text-[#8DC53E] hover:text-[#7AB32E] text-sm font-medium flex items-center"
              >
                View all
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {topProducts && topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/products/placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {trimProductName(product.productName)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {product.totalSold || 0} sold
                        </p>
                        {product.revenue && (
                          <p className="text-xs text-gray-500">
                            {formatCurrency(product.revenue)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No products data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
