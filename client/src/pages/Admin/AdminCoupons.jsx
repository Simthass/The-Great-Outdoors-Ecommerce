// AdminCoupons.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Users,
  TrendingUp,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [currentSidebarPage, setSidebarPage] = useState("coupons");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for date inputs
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

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
      if (data.success) setUserProfile(data.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
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

  useEffect(() => {
    fetchUserProfile();

    if (!user) {
      return;
    }

    if (user?.role !== "Admin") {
      window.location.href = "/";
      return;
    }

    setAuthChecked(true);
    fetchCoupons();
  }, [user]);

  const fetchCoupons = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_URL}/coupons?page=${currentPage}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCoupons(response.data.data.coupons);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleDiscountValueChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, "");

    if (formData.discountType === "percentage" && value) {
      const numValue = parseFloat(value);
      if (numValue > 100) {
        value = "100";
      }
    }

    setFormData({
      ...formData,
      discountValue: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (
      formData.code.trim().length < 4 ||
      formData.code.trim().length > 50
    ) {
      newErrors.code = "Coupon code must be between 4 and 50 characters";
    } else if (!/^[A-Z0-9-]+$/i.test(formData.code.trim())) {
      newErrors.code =
        "Coupon code can only contain letters, numbers, and hyphens";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (
      formData.description.trim().length < 5 ||
      formData.description.trim().length > 500
    ) {
      newErrors.description =
        "Description must be between 5 and 500 characters";
    }

    if (!formData.discountValue) {
      newErrors.discountValue = "Discount value is required";
    } else {
      const value = parseFloat(formData.discountValue);
      if (formData.discountType === "percentage") {
        if (value < 1 || value > 100) {
          newErrors.discountValue = "Percentage must be between 1 and 100";
        }
      } else {
        if (value <= 0) {
          newErrors.discountValue = "Fixed discount must be greater than 0";
        }
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Allow today's date and future dates only
      if (startDate < today) {
        newErrors.startDate = "Start date cannot be before today";
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (formData.usageLimit && parseInt(formData.usageLimit) < 1) {
      newErrors.usageLimit = "Usage limit must be a positive integer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = getAuthToken();

      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? parseFloat(formData.minOrderAmount)
          : 0,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        usageLimit: formData.usageLimit
          ? parseInt(formData.usageLimit)
          : undefined,
        isActive: formData.isActive,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      let response;
      if (editingCoupon) {
        response = await axios.put(
          `${API_URL}/coupons/${editingCoupon._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccessMessage("Coupon updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/coupons`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Coupon created successfully!");
      }

      resetForm();
      fetchCoupons();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving coupon:", error);

      if (error.response?.data) {
        if (
          error.response.data.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          const serverErrors = {};
          error.response.data.errors.forEach((err) => {
            if (err.path) {
              serverErrors[err.path] = err.msg;
            }
          });

          if (Object.keys(serverErrors).length > 0) {
            setErrors(serverErrors);
            return;
          }
        }

        if (error.response.data.message) {
          setErrors({ submit: error.response.data.message });
        }
      } else {
        setErrors({ submit: "Failed to save coupon" });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      isActive: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || "",
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      startDate: new Date(coupon.startDate).toISOString().split("T")[0],
      endDate: new Date(coupon.endDate).toISOString().split("T")[0],
      usageLimit: coupon.usageLimit?.toString() || "",
      isActive: coupon.isActive,
    });
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Coupon deleted successfully!");
      fetchCoupons();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      setErrors({ submit: "Failed to delete coupon" });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isCouponActive = (coupon) => {
    const now = new Date();
    return (
      coupon.isActive &&
      new Date(coupon.startDate) <= now &&
      new Date(coupon.endDate) >= now
    );
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
    if (now < startDate) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Scheduled
        </span>
      );
    }
    if (now > endDate) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Expired
        </span>
      );
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          Limit Reached
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;

    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    switch (statusFilter) {
      case "active":
        return matchesSearch && isCouponActive(coupon);
      case "scheduled":
        return matchesSearch && coupon.isActive && now < startDate;
      case "expired":
        return matchesSearch && now > endDate;
      case "inactive":
        return matchesSearch && !coupon.isActive;
      default:
        return matchesSearch;
    }
  });

  if (!authChecked && loading) {
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
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentSidebarPage}
        onPageChange={handleNavClick}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Coupon Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and manage discount coupons for your store
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#8DC53E] hover:bg-[#7AB82D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8DC53E] transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Coupon
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="ml-3 text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <XCircle className="w-5 h-5 text-red-400" />
                <p className="ml-3 text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-3">
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search coupons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="expired">Expired</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupons Grid */}
              <div className="grid gap-6">
                {filteredCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-[#8DC53E] bg-opacity-10 p-2 rounded-lg">
                            <Tag className="w-5 h-5 text-[#8DC53E]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {coupon.code}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {coupon.description}
                            </p>
                          </div>
                          {getStatusBadge(coupon)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            {coupon.discountType === "percentage" ? (
                              <Percent className="w-4 h-4 text-gray-400" />
                            ) : (
                              <DollarSign className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-600">
                              {coupon.discountType === "percentage"
                                ? `${coupon.discountValue}% off`
                                : `Rs. ${coupon.discountValue} off`}
                            </span>
                            {coupon.maxDiscountAmount &&
                              coupon.discountType === "percentage" && (
                                <span className="text-xs text-gray-500">
                                  (max Rs. {coupon.maxDiscountAmount})
                                </span>
                              )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(coupon.startDate)} -{" "}
                              {formatDate(coupon.endDate)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {coupon.usedCount || 0} used
                              {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                            </span>
                          </div>
                        </div>

                        {coupon.minOrderAmount > 0 && (
                          <div className="flex items-center space-x-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Min order: Rs. {coupon.minOrderAmount}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 text-[#8DC53E] hover:bg-[#8DC53E] hover:bg-opacity-10 rounded-lg transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>

            {/* Sidebar Form */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                  </h2>
                </div>

                {showForm ? (
                  <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    {/* Coupon Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors ${
                          errors.code ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="SUMMER2024"
                      />
                      {errors.code && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.code}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors resize-none ${
                          errors.description
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Summer sale discount"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Discount Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (Rs.)</option>
                      </select>
                    </div>

                    {/* Discount Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleDiscountValueChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors ${
                            errors.discountValue
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder={
                            formData.discountType === "percentage"
                              ? "10"
                              : "100"
                          }
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {formData.discountType === "percentage" ? (
                            <Percent className="w-4 h-4 text-gray-400" />
                          ) : (
                            <span className="text-gray-400 text-sm">Rs.</span>
                          )}
                        </div>
                      </div>
                      {errors.discountValue && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.discountValue}
                        </p>
                      )}
                    </div>

                    {/* Max Discount Amount (for percentage) */}
                    {formData.discountType === "percentage" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Discount (Rs.)
                        </label>
                        <input
                          type="number"
                          name="maxDiscountAmount"
                          value={formData.maxDiscountAmount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors"
                          placeholder="500"
                        />
                      </div>
                    )}

                    {/* Min Order Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        name="minOrderAmount"
                        value={formData.minOrderAmount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors"
                        placeholder="0"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={getTodayString()}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors ${
                          errors.startDate
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date <span className="text-red-500"></span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate || getTodayString()}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors ${
                          errors.endDate ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.endDate}
                        </p>
                      )}
                    </div>

                    {/* Usage Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usage Limit
                      </label>
                      <input
                        type="number"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-[#8DC53E] transition-colors"
                        placeholder="Leave empty for unlimited"
                      />
                      {errors.usageLimit && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.usageLimit}
                        </p>
                      )}
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#8DC53E] focus:ring-[#8DC53E] border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Active coupon
                      </label>
                    </div>

                    {/* Form Actions */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#8DC53E] hover:bg-[#7AB82D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8DC53E] transition-colors"
                        >
                          {editingCoupon ? "Update" : "Create"}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8DC53E] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Create New Coupon
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add discount coupons to boost sales and reward customers
                    </p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#8DC53E] hover:bg-[#7AB82D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8DC53E] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Get Started
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Coupons</span>
                    <span className="font-medium">{coupons.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Coupons</span>
                    <span className="font-medium text-green-600">
                      {coupons.filter((c) => isCouponActive(c)).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Expired Coupons</span>
                    <span className="font-medium text-red-600">
                      {
                        coupons.filter((c) => new Date() > new Date(c.endDate))
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
