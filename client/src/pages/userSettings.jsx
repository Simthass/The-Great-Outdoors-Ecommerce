import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  User,
  AlertTriangle,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
} from "lucide-react";

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("Notification");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [expandedOrder, setExpandedOrder] = useState(null);
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
    country: "Canada",
    isDefault: false,
  });

  const navigate = useNavigate();

  // Custom notification function
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Professional Notification Component
  const Notification = ({ type, message, onClose }) => {
    const baseStyles =
      "flex items-center p-4 mb-4 text-sm rounded-lg border shadow-md transition-all duration-300";
    const styles =
      type === "success"
        ? `${baseStyles} bg-green-50 text-black border-green-200`
        : type === "error"
        ? `${baseStyles} bg-red-50 text-red-800 border-red-200`
        : `${baseStyles} bg-blue-50 text-blue-800 border-blue-200`;

    const icon =
      type === "success" ? (
        <CheckCircle size={18} className="mr-3 text-green-600" />
      ) : type === "error" ? (
        <XCircle size={18} className="mr-3 text-red-600" />
      ) : null;

    return (
      <div className={styles} data-testid={`notification-${type}`}>
        {icon}
        <span className="flex-1 font-medium" data-testid="notification-message">
          {message}
        </span>
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          data-testid="notification-close-btn"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  // Create axios instance with interceptors
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setErrors({ auth: "Session expired. Please login again." });
        setTimeout(() => navigate("/login"), 2000);
      }
      return Promise.reject(error);
    }
  );

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
      const msg = error.response?.data?.message || "Failed to load orders";
      setErrors({ orders: msg });
      showNotification("error", msg);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      showNotification("error", "Please confirm account deletion");
      return;
    }
    try {
      setDeleteLoading(true);
      setErrors({});
      await api.delete("/users/account", { data: { confirmDelete: true } });
      showNotification("success", "Account deleted successfully");
      localStorage.removeItem("token");
      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      }, 2000);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete account";
      setErrors({ delete: msg });
      showNotification("error", msg);
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
        setErrors({});
        const response = await api.get("/settings");
        setSettings(response.data);
        const profileResponse = await api.get("/users/profile");
        if (profileResponse.data.success) {
          setProfileImage(
            profileResponse.data.data.profileImage || "/default-user.png"
          );
        }
      } catch (error) {
        setErrors({
          fetch:
            error.response?.data?.message ||
            "Failed to load settings. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "My Orders") getUserOrders();
  }, [activeTab]);

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [name]: checked },
    }));
  };

  const saveNotificationSettings = async () => {
    if (!isAuthenticated()) return;
    try {
      setSaveLoading(true);
      setErrors({});
      await api.put("/settings/notifications", settings.notifications);
      showNotification("success", "Notification settings saved successfully");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to save notification settings";
      setErrors({ save: msg });
      showNotification("error", msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) return;
    setErrors({});
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
      showNotification("success", "Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update password";
      setErrors({ save: msg });
      showNotification("error", msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitAddress = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) return;
    try {
      setSaveLoading(true);
      setErrors({});
      const response = await api.post("/settings/addresses", addressForm);
      setSettings((prev) => ({
        ...prev,
        addresses: [...prev.addresses, response.data.address],
      }));
      showNotification("success", "Address added successfully");
      setShowAddressForm(false);
      setAddressForm({
        addressType: "Home",
        addressLine1: "",
        addressLine2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Canada",
        isDefault: false,
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to add address";
      setErrors({ save: msg });
      showNotification("error", msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    if (!isAuthenticated()) return;
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    try {
      setSaveLoading(true);
      await api.delete(`/settings/addresses/${addressId}`);
      setSettings((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((a) => a._id !== addressId),
      }));
      showNotification("success", "Address deleted successfully");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete address";
      setErrors({ save: msg });
      showNotification("error", msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
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

  const filteredOrders = settings.orders.filter((order) => {
    const orderId = order?.orderId ? order.orderId.toLowerCase() : "";
    const status = order?.orderStatus ? order.orderStatus.toLowerCase() : "";
    const search = searchTerm.toLowerCase();

    return orderId.includes(search) || status.includes(search);
  });

  const orderStats = {
    total: settings.orders.length,
    pending: settings.orders.filter((order) => order.orderStatus === "Pending")
      .length,
    processing: settings.orders.filter(
      (order) => order.orderStatus === "Processing"
    ).length,
    delivered: settings.orders.filter(
      (order) => order.orderStatus === "Delivered"
    ).length,
  };

  // Delete Account Modal
  const renderDeleteModal = () => (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      data-testid="delete-account-modal"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Account
            </h3>
          </div>
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirm(false);
            }}
            className="text-gray-500 hover:text-gray-700"
            data-testid="delete-modal-close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div
            className="bg-red-50 border border-red-200 p-4 rounded-lg"
            data-testid="delete-warning"
          >
            <p className="text-red-800 text-sm">
              <strong>Warning:</strong> This action cannot be undone. This will
              permanently delete your account and remove all your data from our
              servers.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-700 text-sm">
              The following data will be permanently deleted:
            </p>
            <ul className="text-gray-600 text-sm space-y-1 ml-4">
              <li>• Your profile information</li>
              <li>• All saved addresses</li>
              <li>• Order history</li>
              <li>• Account settings</li>
              <li>• Profile image</li>
            </ul>
          </div>

          <div className="flex items-start space-x-2 pt-4">
            <input
              type="checkbox"
              id="deleteConfirm"
              checked={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500 mt-1"
              data-testid="delete-confirm-checkbox"
            />
            <label htmlFor="deleteConfirm" className="text-sm text-gray-700">
              I understand that this action cannot be undone and I want to
              permanently delete my account.
            </label>
          </div>

          {errors.delete && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
              data-testid="delete-error"
            >
              {errors.delete}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirm(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              data-testid="delete-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={!deleteConfirm || deleteLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="delete-account-btn"
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Account Tab
  const renderAccountTab = () => (
    <div className="space-y-6" data-testid="tab-account">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Account Settings
      </h2>
      <div className="space-y-6">
        <div
          className="bg-red-50 border border-red-200 rounded-xl p-6"
          data-testid="danger-zone"
        >
          <div className="flex items-start space-x-3">
            <UserX className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Delete Account
              </h3>
              <p className="text-red-700 text-sm mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                data-testid="open-delete-modal-btn"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Notification Tab
  const renderNotificationTab = () => (
    <div className="space-y-6" data-testid="tab-notifications">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Notification Preferences
      </h2>

      <div className="space-y-4">
        <div
          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
          data-testid="toggle-email"
        >
          <div className="flex items-center space-x-4">
            <Mail className="text-gray-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.notifications.emailNotifications}
              onChange={handleNotificationChange}
              className="sr-only peer"
              data-testid="email-notifications-checkbox"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8DC53E]"></div>
          </label>
        </div>

        <div
          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
          data-testid="toggle-push"
        >
          <div className="flex items-center space-x-4">
            <Bell className="text-gray-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-500">
                Receive push notifications on your device
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="pushNotifications"
              checked={settings.notifications.pushNotifications}
              onChange={handleNotificationChange}
              className="sr-only peer"
              data-testid="push-notifications-checkbox"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8DC53E]"></div>
          </label>
        </div>

        <div
          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
          data-testid="toggle-sms"
        >
          <div className="flex items-center space-x-4">
            <Smartphone className="text-gray-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive notifications via SMS
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="smsNotifications"
              checked={settings.notifications.smsNotifications}
              onChange={handleNotificationChange}
              className="sr-only peer"
              data-testid="sms-notifications-checkbox"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8DC53E]"></div>
          </label>
        </div>

        <div
          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
          data-testid="toggle-order-updates"
        >
          <div className="flex items-center space-x-4">
            <Package className="text-gray-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Order Updates</h3>
              <p className="text-sm text-gray-500">
                Get notified about order status changes
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="orderUpdates"
              checked={settings.notifications.orderUpdates}
              onChange={handleNotificationChange}
              className="sr-only peer"
              data-testid="order-updates-checkbox"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8DC53E]"></div>
          </label>
        </div>

        <div
          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
          data-testid="toggle-promotions"
        >
          <div className="flex items-center space-x-4">
            <Mail className="text-gray-500" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Promotions</h3>
              <p className="text-sm text-gray-500">
                Receive promotional emails and offers
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="promotions"
              checked={settings.notifications.promotions}
              onChange={handleNotificationChange}
              className="sr-only peer"
              data-testid="promotions-checkbox"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8DC53E]"></div>
          </label>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={saveNotificationSettings}
            disabled={saveLoading}
            className="px-8 py-3 bg-[#8DC53E] text-white rounded-xl hover:bg-[#97D243] transition-all duration-200 font-medium w-48 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            data-testid="notifications-save-btn"
          >
            {saveLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Security Tab
  const renderSecurityTab = () => (
    <div className="space-y-6" data-testid="tab-security">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Security Settings
      </h2>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-6 text-lg">
            Change Password
          </h3>
          <form onSubmit={savePassword} data-testid="password-form">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Current Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200 bg-white"
                    placeholder="Enter current password"
                    data-testid="current-password-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    minLength="6"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200 bg-white"
                    placeholder="Enter new password"
                    data-testid="new-password-input"
                  />
                </div>
                {errors.newPassword && (
                  <p
                    className="text-red-500 text-sm mt-2"
                    data-testid="new-password-error"
                  >
                    {errors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    minLength="6"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200 bg-white"
                    placeholder="Confirm new password"
                    data-testid="confirm-password-input"
                  />
                </div>
                {errors.confirmPassword && (
                  <p
                    className="text-red-500 text-sm mt-2"
                    data-testid="confirm-password-error"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-8 py-4 bg-[#8DC53E] text-white rounded-xl hover:bg-[#97D243] transition-all duration-200 font-medium w-48 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                data-testid="change-password-btn"
              >
                {saveLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Orders Tab
  const renderMyOrdersTab = () => (
    <div className="space-y-6" data-testid="tab-orders">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
        {ordersLoading && (
          <div
            className="flex items-center space-x-2"
            data-testid="orders-loading"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#8DC53E]"></div>
            <span className="text-sm text-gray-500">Loading orders...</span>
          </div>
        )}
      </div>

      {errors.orders && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          data-testid="orders-error"
        >
          {errors.orders}
        </div>
      )}

      {/* Order Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#8DC53E]/10 to-[#8DC53E]/5 rounded-xl p-4 border border-[#8DC53E]/20">
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

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200">
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

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
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

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent bg-white"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="lg:w-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent appearance-none bg-white"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4" data-testid="orders-list">
        {!ordersLoading && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 bg-white"
              data-testid={`order-card-${order._id}`}
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
                        <span className="ml-1.5">{order.orderStatus}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(
                          order.orderDate || order.createdAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-1.5" />
                        {order.paymentMethod || "Credit Card"}
                      </div>
                      <span className="text-xl font-bold text-[#8DC53E]">
                        Rs.{" "}
                        {(
                          order.totalAmount +
                          (order.shippingCost || 0) -
                          (order.discount || 0)
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
                        Items ({order.items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
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
                                  e.target.src = "/products/placeholder.jpg";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {item.productName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × Rs.{" "}
                                {item.price?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <span className="font-bold text-[#8DC53E]">
                              Rs. {item.total?.toFixed(2) || "0.00"}
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
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                              Rs. {order.totalAmount?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">
                              {order.shippingCost === 0
                                ? "FREE"
                                : `Rs. ${(order.shippingCost || 0).toFixed(2)}`}
                            </span>
                          </div>
                          {(order.discount || 0) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Discount</span>
                              <span className="font-medium text-green-600">
                                -Rs. {(order.discount || 0).toFixed(2)}
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
                                  (order.shippingCost || 0) -
                                  (order.discount || 0)
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
          ))
        ) : !ordersLoading ? (
          <div className="text-center py-16" data-testid="orders-empty-state">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start shopping to see your orders here. Your order history will
              appear once you make your first purchase.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#8DC53E] text-white px-6 py-3 rounded-xl hover:bg-[#97D243] transition-colors font-medium shadow-md hover:shadow-lg"
              data-testid="start-shopping-btn"
            >
              Start Shopping
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  // Address Form Modal
  const renderAddressForm = () => (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      data-testid="address-form-modal"
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-lg font-semibold"
            data-testid="address-form-title"
          >
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
              setAddressForm({
                addressType: "Home",
                addressLine1: "",
                addressLine2: "",
                city: "",
                province: "",
                postalCode: "",
                country: "Canada",
                isDefault: false,
              });
            }}
            className="text-gray-500 hover:text-gray-700"
            data-testid="address-form-close"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={submitAddress}
          className="space-y-4"
          data-testid="address-form"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Type
            </label>
            <select
              name="addressType"
              value={addressForm.addressType}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
              data-testid="address-type"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="addressLine1"
              value={addressForm.addressLine1}
              onChange={handleAddressFormChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
              placeholder="Street address"
              data-testid="address-line1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              name="addressLine2"
              value={addressForm.addressLine2}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
              placeholder="Apartment, suite, etc."
              data-testid="address-line2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                data-testid="address-city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province *
              </label>
              <input
                type="text"
                name="province"
                value={addressForm.province}
                onChange={handleAddressFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                data-testid="address-province"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={handleAddressFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                data-testid="address-postal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={addressForm.country}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                data-testid="address-country"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={addressForm.isDefault}
              onChange={handleAddressFormChange}
              className="w-4 h-4 text-[#8DC53E] rounded focus:ring-[#8DC53E]"
              data-testid="address-default-checkbox"
            />
            <label className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddressForm(false);
                setEditingAddress(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              data-testid="address-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-2 bg-[#8DC53E] text-white rounded-xl hover:bg-[#97D243] disabled:opacity-50"
              data-testid="address-save-btn"
            >
              {saveLoading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Addresses Tab
  const renderAddressesTab = () => (
    <div className="space-y-6" data-testid="tab-addresses">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
        <button
          onClick={() => setShowAddressForm(true)}
          className="bg-[#8DC53E] text-white px-6 py-3 rounded-xl hover:bg-[#97D243] transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
          data-testid="add-address-btn"
        >
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid gap-4" data-testid="addresses-list">
        {settings.addresses && settings.addresses.length > 0 ? (
          settings.addresses.map((address) => (
            <div
              key={address._id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              data-testid={`address-card-${address._id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {address.addressType === "Home" ? (
                    <Home className="text-gray-500 mt-1" size={24} />
                  ) : address.addressType === "Work" ? (
                    <Building className="text-gray-500 mt-1" size={24} />
                  ) : (
                    <MapPin className="text-gray-500 mt-1" size={24} />
                  )}
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3
                        className="font-semibold text-gray-900"
                        data-testid="address-type-label"
                      >
                        {address.addressType}
                      </h3>
                      {address.isDefault && (
                        <span
                          className="bg-[#8DC53E] text-white text-xs px-3 py-1 rounded-full"
                          data-testid="address-default-badge"
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p
                      className="text-gray-600"
                      data-testid="address-line1-value"
                    >
                      {address.addressLine1}
                    </p>
                    {address.addressLine2 && (
                      <p
                        className="text-gray-600"
                        data-testid="address-line2-value"
                      >
                        {address.addressLine2}
                      </p>
                    )}
                    <p
                      className="text-gray-500"
                      data-testid="address-city-province"
                    >
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                    <p
                      className="text-gray-500"
                      data-testid="address-country-value"
                    >
                      {address.country}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    className="text-[#8DC53E] hover:text-[#97D243] text-sm flex items-center space-x-2"
                    onClick={() => {
                      setEditingAddress(address);
                      setAddressForm(address);
                      setShowAddressForm(true);
                    }}
                    data-testid={`address-edit-btn-${address._id}`}
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-2"
                    onClick={() => deleteAddress(address._id)}
                    disabled={saveLoading}
                    data-testid={`address-delete-btn-${address._id}`}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="text-center py-12"
            data-testid="addresses-empty-state"
          >
            <MapPin className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No addresses saved
            </h3>
            <p className="mt-2 text-gray-500">Add an address to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Main component loading state
  if (loading) {
    return (
      <div data-testid="settings-loading">
        <div
          className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden"
          data-testid="shop-hero"
        >
          <div className="absolute inset-0 bg-[url(/page-name.png)] bg-cover bg-center opacity-30"></div>
          <div className="relative z-10 text-center px-4">
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-2"
              data-testid="shop-title"
            >
              Settings
            </h1>
            <p className="text-gray-200 text-sm md:text-base">
              Customize Your all Settings Here
            </p>
          </div>
        </div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8DC53E] mx-auto mb-4"
              data-testid="settings-loading-spinner"
            ></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth errors
  if (errors.auth) {
    return (
      <div data-testid="auth-error">
        <div
          className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden"
          data-testid="shop-hero"
        >
          <div className="absolute inset-0 bg-[url(/page-name.png)] bg-cover bg-center opacity-30"></div>
          <div className="relative z-10 text-center px-4">
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-2"
              data-testid="shop-title"
            >
              Settings
            </h1>
            <p className="text-gray-200 text-sm md:text-base">
              Customize Your all Settings Here
            </p>
          </div>
        </div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              {errors.auth}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "Notification", label: "Notifications", icon: Bell },
    { id: "Security", label: "Security", icon: Shield },
    { id: "My Orders", label: "My Orders", icon: Package },
    { id: "Addresses", label: "Addresses", icon: MapPin },
    { id: "Account", label: "Account", icon: UserX },
    { id: "Help", label: "Help", icon: HelpCircle },
  ];

  return (
    <div data-testid="user-settings">
      <div
        className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden"
        data-testid="shop-hero"
      >
        <div className="absolute inset-0 bg-[url(/page-name.png)] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-2"
            data-testid="shop-title"
          >
            Settings
          </h1>
          <p className="text-gray-200 text-sm md:text-base">
            Customize Your all Settings Here
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Notification */}
          {notification && (
            <div className="mb-6" data-testid="notification-area">
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="h-32 bg-gradient-to-r from-[#8DC53E] to-[#97D243] relative">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                      src={`http://localhost:5000${profileImage}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-profile.jpg";
                      }}
                      data-testid="profile-image"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-20 pb-8">
              <div className="flex flex-col lg:flex-row">
                {/* Sidebar Tabs */}
                <div
                  className="lg:w-1/4 px-8 pb-8 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-200"
                  data-testid="settings-tabs-nav"
                >
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      const tid = `tab-btn-${tab.id
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full text-left px-4 py-4 rounded-xl flex items-center space-x-3 transition-all duration-200 ${
                            activeTab === tab.id
                              ? "bg-[#8DC53E] text-white shadow-md"
                              : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                          }`}
                          aria-pressed={activeTab === tab.id}
                          data-testid={tid}
                        >
                          <IconComponent size={20} />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Main Content */}
                <div
                  className="lg:w-3/4 px-8 pt-8 lg:pt-0"
                  data-testid="settings-content"
                >
                  {activeTab === "Notification" && renderNotificationTab()}
                  {activeTab === "Security" && renderSecurityTab()}
                  {activeTab === "My Orders" && renderMyOrdersTab()}
                  {activeTab === "Addresses" && renderAddressesTab()}
                  {activeTab === "Account" && renderAccountTab()}
                  {activeTab === "Help" && (
                    <div className="space-y-6" data-testid="tab-help">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Help & Support
                      </h2>
                      <div className="space-y-4">
                        <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Contact Support
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Need help? Our support team is here for you.
                          </p>
                          <div className="space-y-2">
                            <p
                              className="text-sm text-gray-500"
                              data-testid="help-email"
                            >
                              Email: Simthass@outlook.com
                            </p>
                            <p
                              className="text-sm text-gray-500"
                              data-testid="help-phone"
                            >
                              Phone: +94764078448
                            </p>
                            <p
                              className="text-sm text-gray-500"
                              data-testid="help-hours"
                            >
                              Hours: Monday - Friday, 9AM - 6PM
                            </p>
                          </div>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Frequently Asked Questions
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Find answers to common questions.
                          </p>
                          <button
                            className="text-[#8DC53E] hover:text-[#97D243] font-medium"
                            data-testid="view-faq-btn"
                          >
                            View FAQ →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddressForm && renderAddressForm()}
      {showDeleteModal && renderDeleteModal()}
    </div>
  );
};

export default UserSettings;
