import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Bell,
  Shield,
  Package,
  MapPin,
  HelpCircle,
  Mail,
  Smartphone,
  Lock,
  Truck,
  Home,
  Building,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Search,
  ChevronDown,
  DollarSign,
  AlertCircle,
  User,
} from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";

// ── Scroll-triggered reveal wrapper ──────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 24, className = "" }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(5px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.55, delay, ease: [0.33, 1, 0.68, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Status Badge Component ───────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    Pending: { icon: Clock, color: "bg-amber-100 text-amber-700" },
    Processing: { icon: Package, color: "bg-blue-100 text-blue-700" },
    Shipped: { icon: Truck, color: "bg-purple-100 text-purple-700" },
    Delivered: { icon: CheckCircle, color: "bg-green-100 text-green-700" },
    Cancelled: { icon: XCircle, color: "bg-red-100 text-red-700" },
  };
  const { icon: Icon, color } = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

// ── Toggle Switch Component (Fixed - proper slider) ──────────────────────────
const ToggleSwitch = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div>
      <h4 className="text-sm font-bold text-gray-900">{label}</h4>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8DC53E]"></div>
    </label>
  </div>
);

// ── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white ${
        toast.type === "success" ? "border-[#8DC53E]/30" : "border-red-200"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle size={18} className="text-[#8DC53E]" />
      ) : (
        <AlertCircle size={18} className="text-red-500" />
      )}
      <p className="text-sm font-medium text-gray-800">{toast.message}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ── Main Settings Page ──────────────────────────────────────────────────────
const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: true,
      orderUpdates: true,
      promotions: false,
    },
    addresses: [],
    orders: [],
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressForm, setAddressForm] = useState({
    addressType: "Home",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Sri Lanka",
    isDefault: false,
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  ScrollToTop();

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrors({ auth: "Please login to access settings." });
      setTimeout(() => navigate("/login"), 2000);
      return false;
    }
    return true;
  };

  const getUserOrders = async () => {
    if (!isAuthenticated()) return;
    try {
      setOrdersLoading(true);
      const response = await api.get("/orders/user");
      setSettings((prev) => ({
        ...prev,
        orders: response.data.data?.orders || response.data.orders || [],
      }));
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      showToast("error", "Please confirm account deletion");
      return;
    }
    try {
      setDeleteLoading(true);
      await api.delete("/users/account", { data: { confirmDelete: true } });
      showToast("success", "Account deleted successfully");
      localStorage.removeItem("token");
      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      }, 2000);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteConfirm(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get("/settings");
        setSettings(response.data);
        const profileResponse = await api.get("/users/profile");
        if (profileResponse.data.success) {
          setProfileImage(profileResponse.data.data.profileImage || "/default-profile.jpg");
        }
      } catch (error) {
        setErrors({ fetch: error.response?.data?.message || "Failed to load settings" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") getUserOrders();
  }, [activeTab]);

  const handleNotificationChange = (name) => (e) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [name]: e.target.checked },
    }));
  };

  const saveNotificationSettings = async () => {
    if (!isAuthenticated()) return;
    try {
      setSaveLoading(true);
      await api.put("/settings/notifications", settings.notifications);
      showToast("success", "Notification settings saved");
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaveLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }
    try {
      setSaveLoading(true);
      await api.put("/settings/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast("success", "Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to update password");
    } finally {
      setSaveLoading(false);
    }
  };

  const submitAddress = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) return;
    try {
      setSaveLoading(true);
      const response = await api.post("/settings/addresses", addressForm);
      setSettings((prev) => ({
        ...prev,
        addresses: [...prev.addresses, response.data.address],
      }));
      showToast("success", "Address added successfully");
      setShowAddressForm(false);
      setAddressForm({
        addressType: "Home",
        addressLine1: "",
        addressLine2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Sri Lanka",
        isDefault: false,
      });
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to add address");
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/settings/addresses/${addressId}`);
      setSettings((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((a) => a._id !== addressId),
      }));
      showToast("success", "Address deleted successfully");
    } catch (error) {
      showToast("error", error.response?.data?.message || "Failed to delete address");
    }
  };

  const filteredOrders = settings.orders.filter((order) => {
    const orderId = order.orderId?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const matchesStatus = !selectedStatus || order.orderStatus === selectedStatus;
    return (orderId.includes(search)) && matchesStatus;
  });

  const orderStats = {
    total: settings.orders.length,
    pending: settings.orders.filter((o) => o.orderStatus === "Pending").length,
    processing: settings.orders.filter((o) => o.orderStatus === "Processing").length,
    delivered: settings.orders.filter((o) => o.orderStatus === "Delivered").length,
  };

  const tabs = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "account", label: "Account", icon: UserX },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#8DC53E]/20 border-t-[#8DC53E] rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (errors.auth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {errors.auth}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section - No Unsplash Image */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Your Account
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                Account
                <br />
                <span className="text-[#8DC53E]">Settings</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                Manage your preferences, security, and account information.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main Content */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <FadeIn delay={0.05}>
                <div className="bg-gray-50 rounded-xl p-4 sticky top-6">
                  {/* Profile Avatar */}
                  <div className="text-center pb-5 border-b border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-white border-2 border-[#8DC53E] mx-auto mb-3 overflow-hidden">
                      <img
                        src={`${BASE_URL}${profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "/default-profile.jpg"; }}
                      />
                    </div>
                    <h3 className="font-bold text-gray-900">Account Settings</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage your preferences</p>
                  </div>

                  {/* Navigation Tabs */}
                  <nav className="pt-4 space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.id
                              ? "bg-[#8DC53E] text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon size={16} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </FadeIn>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <FadeIn delay={0.1}>
                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
                      <p className="text-sm text-gray-500">Choose how you want to be notified</p>
                    </div>
                    <div className="space-y-3">
                      <ToggleSwitch
                        checked={settings.notifications.emailNotifications}
                        onChange={handleNotificationChange("emailNotifications")}
                        label="Email Notifications"
                        description="Receive updates via email"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.pushNotifications}
                        onChange={handleNotificationChange("pushNotifications")}
                        label="Push Notifications"
                        description="Get real-time alerts on your device"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.smsNotifications}
                        onChange={handleNotificationChange("smsNotifications")}
                        label="SMS Notifications"
                        description="Get text message updates"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.orderUpdates}
                        onChange={handleNotificationChange("orderUpdates")}
                        label="Order Updates"
                        description="Track your order status"
                      />
                      <ToggleSwitch
                        checked={settings.notifications.promotions}
                        onChange={handleNotificationChange("promotions")}
                        label="Promotions & Offers"
                        description="Exclusive deals and discounts"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={saveNotificationSettings}
                        disabled={saveLoading}
                        className="px-6 py-2.5 rounded-lg bg-[#8DC53E] text-white text-sm font-bold hover:bg-[#7ab535] transition-all disabled:opacity-50"
                      >
                        {saveLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Security Settings</h2>
                      <p className="text-sm text-gray-500">Manage your password and security preferences</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock size={18} className="text-[#8DC53E]" />
                        Change Password
                      </h3>
                      <form onSubmit={savePassword} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] outline-none transition-all"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] outline-none transition-all"
                            placeholder="Enter new password"
                          />
                          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] outline-none transition-all"
                            placeholder="Confirm new password"
                          />
                          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="px-6 py-2.5 rounded-lg bg-[#8DC53E] text-white text-sm font-bold hover:bg-[#7ab535] transition-all disabled:opacity-50"
                          >
                            {saveLoading ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">My Orders</h2>
                      <p className="text-sm text-gray-500">Track and manage your order history</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-amber-600">{orderStats.pending}</p>
                        <p className="text-[10px] text-amber-600 uppercase tracking-wider">Pending</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
                        <p className="text-[10px] text-blue-600 uppercase tracking-wider">Processing</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
                        <p className="text-[10px] text-green-600 uppercase tracking-wider">Delivered</p>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by order ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] outline-none"
                        />
                      </div>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none bg-white"
                      >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Orders List */}
                    {ordersLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-[#8DC53E]/20 border-t-[#8DC53E] rounded-full animate-spin" />
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredOrders.map((order) => (
                          <div key={order._id} className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="p-4 bg-white">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-gray-900 text-sm">#{order.orderId}</h3>
                                    <StatusBadge status={order.orderStatus} />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                    <Calendar size={10} />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-bold text-[#8DC53E]">
                                    Rs.{(order.totalAmount + order.shippingCost - order.discount).toLocaleString()}
                                  </span>
                                  <button
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-[#8DC53E] hover:text-white transition-all"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                                  >
                                    <ChevronDown size={14} className={`transition-transform ${expandedOrderId === order._id ? "rotate-180" : ""}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {expandedOrderId === order._id && (
                              <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items</h4>
                                  {order.items?.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                        <img src={item.image || "/products/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs.{item.price.toLocaleString()}</p>
                                      </div>
                                      <span className="text-sm font-bold text-[#8DC53E]">Rs.{item.total.toLocaleString()}</span>
                                    </div>
                                  ))}
                                  {order.items?.length > 2 && (
                                    <p className="text-xs text-gray-400 text-center">+{order.items.length - 2} more items</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Saved Addresses</h2>
                        <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                      </div>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#8DC53E] text-white text-xs font-bold hover:bg-[#7ab535] transition-all"
                      >
                        <Plus size={14} /> Add Address
                      </button>
                    </div>

                    {settings.addresses?.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No saved addresses</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {settings.addresses.map((address) => (
                          <div key={address._id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex gap-3">
                              {address.addressType === "Home" ? <Home size={18} className="text-gray-400" /> : <Building size={18} className="text-gray-400" />}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-900 text-sm">{address.addressType}</h4>
                                  {address.isDefault && <span className="text-[10px] bg-[#8DC53E] text-white px-2 py-0.5 rounded-full">Default</span>}
                                </div>
                                <p className="text-sm text-gray-600">{address.addressLine1}</p>
                                {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
                                <p className="text-sm text-gray-500">{address.city}, {address.province} {address.postalCode}</p>
                                <p className="text-sm text-gray-500">{address.country}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(address);
                                  setAddressForm(address);
                                  setShowAddressForm(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-[#8DC53E] transition-colors"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => deleteAddress(address._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Account Management</h2>
                      <p className="text-sm text-gray-500">Manage your account settings</p>
                    </div>

                    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                      <div className="flex items-start gap-4">
                        <UserX size={24} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-base font-bold text-red-700 mb-1">Delete Account</h3>
                          <p className="text-sm text-red-600 mb-4">
                            Once you delete your account, there is no going back. This action is permanent.
                          </p>
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Help Tab */}
                {activeTab === "help" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Help & Support</h2>
                      <p className="text-sm text-gray-500">Get assistance with your account</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Mail size={16} className="text-[#8DC53E]" />
                        Contact Support
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">Email: support@tgo.com</p>
                      <p className="text-sm text-gray-600">Phone: +94 76 407 8448</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock size={16} className="text-[#8DC53E]" />
                        Business Hours
                      </h3>
                      <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-sm text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                      <p className="text-sm text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                )}
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => e.target === e.currentTarget && setShowAddressForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">{editingAddress ? "Edit Address" : "Add New Address"}</h3>
                <button onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submitAddress} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Address Type</label>
                  <select
                    name="addressType"
                    value={addressForm.addressType}
                    onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Province *</label>
                    <input
                      type="text"
                      name="province"
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#8DC53E] focus:ring-[#8DC53E]"
                  />
                  <label className="text-sm text-gray-700">Set as default address</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 py-2 rounded-lg bg-[#8DC53E] text-white text-sm font-medium hover:bg-[#7ab535] disabled:opacity-50"
                  >
                    {saveLoading ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-red-600 text-lg flex items-center gap-2">
                  <AlertCircle size={20} /> Delete Account
                </h3>
                <button onClick={() => setShowDeleteModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium">Warning: This action cannot be undone!</p>
                </div>

                <p className="text-gray-600 text-sm">This will permanently delete:</p>
                <ul className="text-gray-500 text-sm space-y-1 ml-5 list-disc">
                  <li>Your profile information</li>
                  <li>All saved addresses</li>
                  <li>Order history</li>
                  <li>Account settings</li>
                </ul>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="deleteConfirm"
                    checked={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="deleteConfirm" className="text-sm text-gray-700">
                    I understand the consequences and want to delete my account
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deleteConfirm || deleteLoading}
                    className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default UserSettings;