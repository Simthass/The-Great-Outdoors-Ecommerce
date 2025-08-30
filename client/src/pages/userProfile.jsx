import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Custom notification function
  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Load user data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setFormData({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            email: data.data.email || "",
            phoneNumber: data.data.phoneNumber || "",
            address: data.data.address || "",
            city: data.data.city || "",
            state: data.data.state || "",
            bio: data.data.bio || "",
          });
          setProfileImage(data.data.profileImage || "/default-profile.jpg");
        } else {
          showNotification("error", data.message || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        showNotification("error", "Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      showNotification(
        "error",
        "Please select a valid image file (JPEG, JPG, PNG, GIF)"
      );
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image size should be less than 5MB");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      setLoading(true);
      const response = await axios.put(
        "/api/users/profile/image",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = response.data;

      if (response.status === 200) {
        setProfileImage(`${data.data.profileImage}?t=${Date.now()}`);
        showNotification("success", "Profile image updated successfully");
      } else {
        showNotification(
          "error",
          data.message || "Failed to update profile image"
        );
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      if (error.response) {
        showNotification(
          "error",
          error.response.data.message || "Failed to update profile image"
        );
      } else {
        showNotification("error", "Error updating profile image");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("success", "Profile updated successfully");
        setIsEditing(false);
      } else {
        showNotification("error", data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("error", "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload original data
    fetch("/api/users/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFormData({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            email: data.data.email || "",
            phoneNumber: data.data.phoneNumber || "",
            address: data.data.address || "",
            city: data.data.city || "",
            state: data.data.state || "",
            bio: data.data.bio || "",
          });
        }
      });
  };

  // Professional Notification Component
  const Notification = ({ type, message, onClose }) => {
    const getStyles = () => {
      const baseStyles =
        "flex items-center p-4 mb-4 text-sm rounded-lg border shadow-md transition-all duration-300";

      switch (type) {
        case "success":
          return `${baseStyles} bg-green-50 text-black border-green-200`;
        case "error":
          return `${baseStyles} bg-red-50 text-red-800 border-red-200`;
        default:
          return `${baseStyles} bg-blue-50 text-blue-800 border-blue-200`;
      }
    };

    const getIcon = () => {
      switch (type) {
        case "success":
          return <CheckCircle size={18} className="mr-3 text-green-600" />;
        case "error":
          return <XCircle size={18} className="mr-3 text-red-600" />;
        default:
          return null;
      }
    };

    return (
      <div className={getStyles()}>
        {getIcon()}
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  if (loading && !formData.firstName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8DC53E] mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Profile</p>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 max-w-screen">
        <div className="max-w-7xl mx-auto">
          {/* Professional Notification */}
          {notification && (
            <div className="mb-6">
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-[#8DC53E] to-[#97D243] relative">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="relative">
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
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-[#8DC53E] text-white p-2 rounded-full shadow-lg hover:bg-[#97D243] transition-all duration-200 cursor-pointer"
                    disabled={loading}
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="pt-20 pb-8 px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {formData.bio || "No bio yet"}
                </p>
              </div>

              <div className="flex justify-center mb-8">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#8DC53E] text-white px-8 py-3 rounded-[5px] font-medium hover:bg-[#97D243] transition-all duration-200 shadow-lg w-48 cursor-pointer"
                    disabled={loading}
                  >
                    Edit Profile
                  </button>
                ) : null}
              </div>

              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Personal Information
                </h3>

                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200 resize-none"
                        placeholder="Tell us about yourself..."
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                          placeholder="Enter first name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                          placeholder="Enter last name"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed outline-none transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                        placeholder="Enter contact number"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                        placeholder="Enter address"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                          placeholder="Enter city"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none transition-all duration-200"
                          placeholder="Enter state"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-center space-x-7 pt-6">
                      <button
                        onClick={handleCancel}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-[5px] hover:bg-gray-50 transition-all duration-200 font-medium w-48 cursor-pointer"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-[#8DC53E] text-white rounded-[5px] hover:bg-[#97D243] transition-all duration-200 font-medium shadow-lg w-48 cursor-pointer"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <Mail className="text-[#8DC53E]" size={24} />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">
                            {formData.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <Phone className="text-[#8DC53E]" size={24} />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {formData.phoneNumber || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <MapPin className="text-[#8DC53E] mt-1" size={24} />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium text-gray-900">
                            {formData.address || "Not provided"}
                          </p>
                          {(formData.city || formData.state) && (
                            <p className="text-gray-600">
                              {formData.city}
                              {formData.city && formData.state ? ", " : ""}
                              {formData.state}
                            </p>
                          )}
                        </div>
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
  );
};

export default Profile;
