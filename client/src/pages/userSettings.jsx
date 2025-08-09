import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Shield,
  Palette,
  Package,
  MapPin,
  HelpCircle,
  Mail,
  Smartphone,
  Lock,
  Sun,
  Moon,
  Monitor,
  Truck,
  Home,
  Building,
  ChevronDown,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("Notification");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: true,
      orderUpdates: true,
      promotions: false,
    },
    appearance: {
      theme: "light",
      language: "english",
      fontSize: "medium",
    },
    addresses: [],
  });

  // Fetch settings on component mount
  // Fetch settings on component mount
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
      } catch (error) {
        console.error("Error fetching settings:", error);

        if (error.response?.data?.message) {
          setErrors({ fetch: error.response.data.message });
        } else {
          setErrors({ fetch: "Failed to load settings. Please try again." });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);
  const navigate = useNavigate();

  // Create axios instance with interceptors
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  // Add request interceptor to include token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle 401 errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setErrors({ auth: "Session expired. Please login again." });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
      return Promise.reject(error);
    }
  );

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrors({ auth: "Please login to access settings." });
      setTimeout(() => navigate("/login"), 2000);
      return false;
    }
    return true;
  };
  // Save notification settings
  // Save notification settings
  const saveNotificationSettings = async () => {
    if (!isAuthenticated()) return;

    try {
      setSaveLoading(true);
      setErrors({});

      await api.put("/settings/notifications", settings.notifications);

      setSuccess("Notification settings saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving notification settings:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to save notification settings";
      setErrors({ save: errorMessage });
    } finally {
      setSaveLoading(false);
    }
  };

  // Save appearance settings
  // Save appearance settings
  const saveAppearanceSettings = async () => {
    if (!isAuthenticated()) return;

    try {
      setSaveLoading(true);
      setErrors({});

      await api.put("/settings/appearance", settings.appearance);

      setSuccess("Appearance settings saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving appearance settings:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to save appearance settings";
      setErrors({ save: errorMessage });
    } finally {
      setSaveLoading(false);
    }
  };

  // Save password
  // Save password
  const savePassword = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) return;

    setErrors({});
    setSuccess("");

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

      const response = await api.put("/settings/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);

      // Update token in localStorage if a new one was returned
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.error("Error updating password:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      setErrors({ save: errorMessage });
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit new address
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

      setSuccess("Address added successfully");
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
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding address:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to add address";
      setErrors({ save: errorMessage });
    } finally {
      setSaveLoading(false);
    }
  };
  // Handle notification change
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked,
      },
    }));
  };

  // Handle appearance change
  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [name]: value,
      },
    }));
  };

  // Render Notification Tab
  const renderNotificationTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Notification Preferences
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="text-gray-500" size={20} />
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            name="emailNotifications"
            checked={settings.notifications.emailNotifications}
            onChange={handleNotificationChange}
            className="w-5 h-5 text-[#8DC53E] rounded focus:ring-[#8DC53E]"
          />
        </div>

        {/* Other notification options... */}

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={saveNotificationSettings}
            disabled={saveLoading}
            className="px-8 py-3 bg-[#8DC53E] text-white rounded-lg hover:bg-[#97D243] transition-all duration-200 font-medium w-48 cursor-pointer disabled:opacity-50"
          >
            {saveLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Security Tab (Password Only)
  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Security Settings
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const { currentPassword, newPassword, confirmPassword } =
                e.target.elements;
              try {
                await savePassword(currentPassword.value, newPassword.value);
                // Reset form
                e.target.reset();
                // Show success message
              } catch (error) {
                // Show error message
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-8 py-3 bg-[#8DC53E] text-white rounded-lg hover:bg-[#97D243] transition-all duration-200 font-medium w-48 cursor-pointer disabled:opacity-50"
              >
                {saveLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Render Appearance Tab
  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Appearance Settings
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() =>
                  handleAppearanceChange({
                    target: {
                      name: "theme",
                      value: theme.value,
                    },
                  })
                }
                className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 ${
                  settings.appearance.theme === theme.value
                    ? "border-[#8DC53E] bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <theme.icon size={24} />
                <span className="text-sm font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Other appearance options... */}

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={saveAppearanceSettings}
            disabled={saveLoading}
            className="px-8 py-3 bg-[#8DC53E] text-white rounded-lg hover:bg-[#97D243] transition-all duration-200 font-medium w-48 cursor-pointer disabled:opacity-50"
          >
            {saveLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Addresses Tab
  const renderAddressesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
        <button
          className="bg-[#8DC53E] text-white px-4 py-2 rounded-lg hover:bg-[#97D243] transition-colors"
          onClick={() => {
            // Open add address modal
          }}
        >
          Add New Address
        </button>
      </div>
      <div className="space-y-4">
        {settings.addresses.map((address) => (
          <div
            key={address._id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {address.addressType === "Home" ? (
                  <Home className="text-gray-500 mt-1" size={20} />
                ) : (
                  <Building className="text-gray-500 mt-1" size={20} />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {address.addressType}
                    </h3>
                    {address.isDefault && (
                      <span className="bg-[#8DC53E] text-white text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="text-gray-600">{address.addressLine2}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="text-[#8DC53E] hover:text-[#97D243] text-sm"
                  onClick={() => {
                    // Open edit modal
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 hover:text-red-600 text-sm"
                  onClick={async () => {
                    try {
                      await axios.delete(
                        `/api/settings/addresses/${address._id}`,
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      );
                      // Refresh addresses
                      const response = await axios.get(
                        "/api/settings/addresses",
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      );
                      setSettings((prev) => ({
                        ...prev,
                        addresses: response.data,
                      }));
                    } catch (error) {
                      console.error("Error deleting address:", error);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Help Tab (Simplified)
  const renderHelpTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Help & Support
      </h2>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
          <p className="text-gray-600 mb-4">
            Need help? Our support team is here to assist you.
          </p>
          <div className="flex space-x-4">
            <button className="bg-[#8DC53E] text-white px-4 py-2 rounded-lg hover:bg-[#97D243] transition-colors">
              Email Support
            </button>
            <button className="border border-[#8DC53E] text-[#8DC53E] px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
              Live Chat
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-2">FAQ</h3>
          <p className="text-gray-600 mb-4">
            Find answers to commonly asked questions.
          </p>
          <button className="text-[#8DC53E] hover:text-[#97D243] transition-colors">
            View FAQ →
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-[#8DC53E] p-6 m-6 rounded-2xl">
        <div className="space-y-2">
          {[
            { icon: Bell, label: "Notification" },
            { icon: Shield, label: "Security" },
            { icon: Palette, label: "Appearance" },
            { icon: Package, label: "My Orders" },
            { icon: MapPin, label: "Addresses" },
            { icon: HelpCircle, label: "Help" },
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === item.label
                    ? "bg-[#99D93E] bg-opacity-20 text-white font-medium"
                    : "text-white text-opacity-90 hover:bg-[#97D243] hover:bg-opacity-10"
                }`}
              >
                <IconComponent size={20} />
                <span className="text-base">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              {activeTab === "Profile" ? "Edit profile" : activeTab}
            </h1>
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              {/* Profile image */}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8DC53E]"></div>
              </div>
            ) : (
              <>
                {activeTab === "Notification" && renderNotificationTab()}
                {activeTab === "Security" && renderSecurityTab()}
                {activeTab === "Appearance" && renderAppearanceTab()}
                {activeTab === "Addresses" && renderAddressesTab()}
                {activeTab === "Help" && renderHelpTab()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
