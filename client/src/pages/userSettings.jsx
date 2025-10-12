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
      const response = await api.get("/settings/orders");
      setSettings((prev) => ({
        ...prev,
        orders: response.data.data || response.data || [],
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
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
    setAddressForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
    if (!window.confirm("Are you sure you want to delete this address?")) return;
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

  // Delete Account Modal
  const renderDeleteModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
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
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg" data-testid="delete-warning">
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6" data-testid="danger-zone">
          <div className="flex items-start space-x-3">
            <UserX className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-900 mb-2">Delete Account</h3>
              <p className="text-red-700 text-sm mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid="toggle-email">
          <div className="flex items-center space-x-3">
            <Mail className="text-gray-500" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
          </div>
          <input
            type="checkbox"
            name="emailNotifications"
            checked={settings.notifications.emailNotifications}
            onChange={handleNotificationChange}
            className="w-5 h-5 text-[#8DC53E] rounded focus:ring-[#8DC53E]"
            data-testid="email-notifications-checkbox"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid="toggle-push">
          <div className="flex items-center space-x-3">
            <Bell className="text-gray-500" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive push notifications on your device</p>
            </div>
          </div>
          <input
            type="checkbox"
            name="pushNotifications"
            checked={settings.notifications.pushNotifications}
            onChange={handleNotificationChange}
            className="w-5 h-5 text-[#8DC53E] rounded focus:ring-[#8DC53E]"
            data-testid="push-notifications-checkbox"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid="toggle-sms">
          <div className="flex items-center space-x-3">
            <Smartphone className="text-gray-500" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
          </div>
          <input
            type="checkbox"
            name="smsNotifications"
            checked={settings.notifications.smsNotifications}
            onChange={handleNotificationChange}
            className="w-5 h-5 text-[#8DC53E] rounded focus:ring-[#8DC53E]"
            data-testid="sms-notifications-checkbox"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid="toggle-order-updates">
          <div className="flex items-center space-x-3">
            <Package className="text-gray-500" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">Order Updates</h3>
              <p className="text-sm text-gray-500">Get notified about order status changes</p>
            </div>
          </div>
          <input
            type="checkbox"
            name="orderUpdates"
            checked={settings.notifications.orderUpdates}
            onChange={handleNotificationChange}
            className="w-5 h-5 text-[#8DC53E] rounded focus:ring-[#8DC53E]"
            data-testid="order-updates-checkbox"
          />
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid="toggle-promotions">
          <div className="flex items-center space-x-3">
            <Mail className="text-gray-500" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">Promotions</h3>
              <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
            </div>
          </div>
          <input
            type="checkbox"
            name="promotions"
            checked={settings.notifications.promotions}
            onChange={handleNotificationChange}
            className="w-5 h-5 text-[#8DC53E] rounded focus:ring-[#8DC53E]"
            data-testid="promotions-checkbox"
          />
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={saveNotificationSettings}
            disabled={saveLoading}
            className="px-8 py-3 bg-[#8DC53E] text-white rounded-lg hover:bg-[#97D243] transition-all duration-200 font-medium w-48 cursor-pointer disabled:opacity-50"
            data-testid="notifications-save-btn"
          >
            {saveLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );

  // Security Tab
  const renderSecurityTab = () => (
    <div className="space-y-6" data-testid="tab-security">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={savePassword} data-testid="password-form">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter current password"
                  data-testid="current-password-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter new password"
                  data-testid="new-password-input"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1" data-testid="new-password-error">
                    {errors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Confirm new password"
                  data-testid="confirm-password-input"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1" data-testid="confirm-password-error">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-8 py-3 bg-[#8DC53E] text-white rounded-lg hover:bg-[#97D243] transition-all duration-200 font-medium w-48 cursor-pointer disabled:opacity-50"
                data-testid="change-password-btn"
              >
                {saveLoading ? "Saving..." : "Change Password"}
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
        {ordersLoading && (
          <div className="flex items-center space-x-2" data-testid="orders-loading">
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

      <div className="space-y-4" data-testid="orders-list">
        {!ordersLoading && settings.orders && settings.orders.length > 0 ? (
          settings.orders.map((order) => {
            const cardId =
              order._id || order.orderId || String(Math.random()).slice(2);
            return (
              <div
                key={cardId}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                data-testid={`order-card-${cardId}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-500" data-testid="order-date">
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-lg" data-testid="order-total">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.orderStatus === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.orderStatus === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.orderStatus === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      data-testid="order-status"
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600" data-testid="order-items-count">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>

                    {order.orderStatus === "Shipped" && (
                      <div className="flex items-center space-x-2 text-blue-600" data-testid="order-trackable">
                        <Truck className="h-4 w-4" />
                        <span className="text-sm font-medium">Track Order</span>
                      </div>
                    )}
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 space-y-2" data-testid="order-items">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-gray-600">
                            {item.product?.name || `Item ${index + 1}`}
                            {item.quantity && ` (Qty: ${item.quantity})`}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-gray-500">
                            +{order.items.length - 3} more items
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : !ordersLoading ? (
          <div className="text-center py-16" data-testid="orders-empty-state">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start shopping to see your orders here. Your order history will
              appear once you make your first purchase.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#8DC53E] text-white px-6 py-3 rounded-lg hover:bg-[#97D243] transition-colors font-medium"
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="address-form-modal"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" data-testid="address-form-title">
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

        <form onSubmit={submitAddress} className="space-y-4" data-testid="address-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
            <select
              name="addressType"
              value={addressForm.addressType}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
              placeholder="Street address"
              data-testid="address-line1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={addressForm.addressLine2}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
              placeholder="Apartment, suite, etc."
              data-testid="address-line2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                data-testid="address-city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
              <input
                type="text"
                name="province"
                value={addressForm.province}
                onChange={handleAddressFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                data-testid="address-province"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
              <input
                type="text"
                name="postalCode"
                value={addressForm.postalCode}
                onChange={handleAddressFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
                data-testid="address-postal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={addressForm.country}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent"
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
            <label className="text-sm text-gray-700">Set as default address</label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddressForm(false);
                setEditingAddress(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              data-testid="address-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-2 bg-[#8DC53E] text-white rounded-lg hover:bg-[#97D243] disabled:opacity-50"
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
        <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
        <button
          onClick={() => setShowAddressForm(true)}
          className="bg-[#8DC53E] text-white px-4 py-2 rounded-lg hover:bg-[#97D243] transition-colors flex items-center space-x-2"
          data-testid="add-address-btn"
        >
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="space-y-4" data-testid="addresses-list">
        {settings.addresses && settings.addresses.length > 0 ? (
          settings.addresses.map((address) => (
            <div
              key={address._id}
              className="border border-gray-200 rounded-lg p-4"
              data-testid={`address-card-${address._id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {address.addressType === "Home" ? (
                    <Home className="text-gray-500 mt-1" size={20} />
                  ) : address.addressType === "Work" ? (
                    <Building className="text-gray-500 mt-1" size={20} />
                  ) : (
                    <MapPin className="text-gray-500 mt-1" size={20} />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900" data-testid="address-type-label">
                        {address.addressType}
                      </h3>
                      {address.isDefault && (
                        <span className="bg-[#8DC53E] text-white text-xs px-2 py-1 rounded-full" data-testid="address-default-badge">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1" data-testid="address-line1-value">
                      {address.addressLine1}
                    </p>
                    {address.addressLine2 && (
                      <p className="text-gray-600" data-testid="address-line2-value">
                        {address.addressLine2}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm" data-testid="address-city-province">
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                    <p className="text-gray-500 text-sm" data-testid="address-country-value">
                      {address.country}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-[#8DC53E] hover:text-[#97D243] text-sm flex items-center space-x-1"
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
                    className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1"
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
          <div className="text-center py-12" data-testid="addresses-empty-state">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses saved</h3>
            <p className="mt-1 text-sm text-gray-500">Add an address to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Main component loading state
  if (loading) {
    return (
      <div data-testid="settings-loading">
        <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
          <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Settings</p>
        </div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8DC53E] mx-auto mb-4"
              data-testid="settings-loading-spinner"
            ></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth errors
  if (errors.auth) {
    return (
      <div data-testid="auth-error">
        <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
          <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Settings</p>
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
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Settings</p>
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
                <div className="lg:w-1/4 px-8 pb-8 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-200" data-testid="settings-tabs-nav">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      const tid = `tab-btn-${tab.id.toLowerCase().replace(/\s+/g, "-")}`;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                            activeTab === tab.id
                              ? "bg-[#8DC53E] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          aria-pressed={activeTab === tab.id}
                          data-testid={tid}
                        >
                          <IconComponent size={20} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Main Content */}
                <div className="lg:w-3/4 px-8 pt-8 lg:pt-0" data-testid="settings-content">
                  {activeTab === "Notification" && renderNotificationTab()}
                  {activeTab === "Security" && renderSecurityTab()}
                  {activeTab === "My Orders" && renderMyOrdersTab()}
                  {activeTab === "Addresses" && renderAddressesTab()}
                  {activeTab === "Account" && renderAccountTab()}
                  {activeTab === "Help" && (
                    <div className="space-y-6" data-testid="tab-help">
                      <h2 className="text-xl font-semibold text-gray-900">Help & Support</h2>
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
                          <p className="text-gray-600 mb-3">
                            Need help? Our support team is here for you.
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500" data-testid="help-email">
                              Email: Simthass@outlook.com
                            </p>
                            <p className="text-sm text-gray-500" data-testid="help-phone">
                              Phone: +94764078448
                            </p>
                            <p className="text-sm text-gray-500" data-testid="help-hours">
                              Hours: Monday - Friday, 9AM - 6PM
                            </p>
                          </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-2">Frequently Asked Questions</h3>
                          <p className="text-gray-600 mb-3">
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

