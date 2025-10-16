import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import StarRating from "../../components/StarRating";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { ChevronUp } from "lucide-react";

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("banners");
  const [currentSidebarPage, setSidebarPage] = useState("content");
  const [userProfile, setUserProfile] = useState(null);

  // Ref for scrolling to top
  const topRef = useRef(null);
  const navigate = useNavigate();

  // Banner state
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [selectedBannerFiles, setSelectedBannerFiles] = useState([]);
  const [bannerPreviewUrls, setBannerPreviewUrls] = useState([]);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewUploading, setReviewUploading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    customerTitle: "",
    description: "",
    rating: 5,
    customerImage: null,
  });
  const [reviewImagePreview, setReviewImagePreview] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  useEffect(() => {
    fetchUserProfile();
    if (activeTab === "banners") {
      fetchBanners();
    } else {
      fetchReviews();
    }
  }, [activeTab]);

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
    } else if (key === "content") {
      navigate("/Admin/Content");
    }
  };

  // Scroll to top button
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Banner functions
  const fetchBanners = async () => {
    setBannerLoading(true);
    try {
      const response = await axios.get(`${API_URL}/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert("Failed to fetch banners");
    } finally {
      setBannerLoading(false);
    }
  };

  const handleBannerFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedBannerFiles(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setBannerPreviewUrls(urls);
  };

  const handleBannerUpload = async () => {
    if (selectedBannerFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setBannerUploading(true);
    const formData = new FormData();

    selectedBannerFiles.forEach((file) => {
      formData.append("banners", file);
    });

    try {
      await axios.post(`${API_URL}/banners/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedBannerFiles([]);
      setBannerPreviewUrls([]);
      fetchBanners();
      alert("Banners uploaded successfully!");
    } catch (error) {
      console.error("Error uploading banners:", error);
      alert("Failed to upload banners");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      await axios.delete(`${API_URL}/banners/${bannerId}`);
      fetchBanners();
      alert("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner");
    }
  };

  const handleBannerToggleActive = async (bannerId) => {
    try {
      await axios.put(`${API_URL}/banners/${bannerId}/toggle`);
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner status:", error);
      alert("Failed to update banner status");
    }
  };

  const handleBannerDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanners(items);

    try {
      await axios.put(`${API_URL}/banners/reorder`, { banners: items });
    } catch (error) {
      console.error("Error reordering banners:", error);
      fetchBanners();
    }
  };

  // Review functions
  const fetchReviews = async () => {
    setReviewLoading(true);
    try {
      const response = await axios.get(`${API_URL}/reviews/admin`);
      setReviews(response.data.filter((review) => review.isHomepageReview));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Failed to fetch reviews");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewImageSelect = (e) => {
    const file = e.target.files[0];
    setReviewForm({ ...reviewForm, customerImage: file });

    if (file) {
      const url = URL.createObjectURL(file);
      setReviewImagePreview(url);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewUploading(true);

    const formData = new FormData();
    formData.append("customerName", reviewForm.customerName);
    formData.append("customerTitle", reviewForm.customerTitle);
    formData.append("description", reviewForm.description);
    formData.append("rating", reviewForm.rating);

    if (reviewForm.customerImage) {
      formData.append("customerImage", reviewForm.customerImage);
    }

    try {
      if (editingReview) {
        await axios.put(
          `${API_URL}/reviews/homepage/${editingReview._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        alert("Review updated successfully!");
      } else {
        await axios.post(`${API_URL}/reviews/homepage`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Review created successfully!");
      }

      resetReviewForm();
      fetchReviews();
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review");
    } finally {
      setReviewUploading(false);
    }
  };

  const resetReviewForm = () => {
    setReviewForm({
      customerName: "",
      customerTitle: "",
      description: "",
      rating: 5,
      customerImage: null,
    });
    setReviewImagePreview("");
    setEditingReview(null);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      customerName: review.customerName,
      customerTitle: review.customerTitle,
      description: review.description,
      rating: review.rating,
      customerImage: null,
    });
    setReviewImagePreview(
      review.customerImage
        ? `${API_URL.replace("/api", "")}${review.customerImage}`
        : ""
    );
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`);
      fetchReviews();
      alert("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const handleReviewDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(reviews);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setReviews(items);

    try {
      await axios.put(`${API_URL}/reviews/homepage/reorder`, {
        reviews: items,
      });
    } catch (error) {
      console.error("Error reordering reviews:", error);
      fetchReviews();
    }
  };

  if (bannerLoading && banners.length === 0 && activeTab === "banners") {
    return (
      <div>
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
      <div className="flex bg-gray-50 min-h-screen mt-6 rounded-2xl">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavClick}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <div className="flex-1" ref={topRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8DC53E] to-[#7AB332] rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Content Management
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Manage your website banners and customer reviews
              </p>
            </div>

            {/* Enhanced Tabs */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("banners")}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === "banners"
                        ? "bg-gradient-to-r from-[#8DC53E] to-[#7AB332] text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Banner Management</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === "reviews"
                        ? "bg-gradient-to-r from-[#8DC53E] to-[#7AB332] text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    <span>Review Management</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Banner Management */}
            {activeTab === "banners" && (
              <>
                {/* Upload Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 backdrop-blur-sm bg-white/90">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-[#8DC53E]/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[#8DC53E]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Upload New Banners
                    </h2>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Banner Images
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleBannerFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#8DC53E] transition-colors duration-200">
                        <div className="w-16 h-16 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-[#8DC53E]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Drop your images here
                        </h3>
                        <p className="text-gray-600">
                          or{" "}
                          <span className="text-[#8DC53E] font-medium">
                            click to browse
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {bannerPreviewUrls.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Preview Images
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {bannerPreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                Image {index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBannerUpload}
                    disabled={
                      bannerUploading || selectedBannerFiles.length === 0
                    }
                    className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center space-x-2 ${
                      bannerUploading || selectedBannerFiles.length === 0
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-[#8DC53E] to-[#7AB332] hover:from-[#7AB332] to-[#6BA228] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    {bannerUploading ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span>Upload Banners</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Existing Banners */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#8DC53E]/10 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#8DC53E]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Current Banners
                      </h2>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {banners.length} banner{banners.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {bannerLoading ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="animate-spin w-8 h-8 text-[#8DC53E]"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">
                        Loading banners...
                      </p>
                    </div>
                  ) : banners.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No banners yet
                      </h3>
                      <p className="text-gray-600">
                        Upload your first banner to get started
                      </p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleBannerDragEnd}>
                      <Droppable droppableId="banners">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {banners.map((banner, index) => (
                              <Draggable
                                key={banner._id}
                                draggableId={banner._id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 transition-all duration-200 ${
                                      snapshot.isDragging
                                        ? "shadow-2xl scale-[1.02] border-[#8DC53E]"
                                        : "hover:shadow-lg"
                                    }`}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mr-4 p-2 rounded-lg hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors"
                                    >
                                      <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                      </svg>
                                    </div>

                                    <img
                                      src={`${API_URL.replace("/api", "")}${
                                        banner.imageUrl
                                      }`}
                                      alt={`Banner ${index + 1}`}
                                      className="w-24 h-16 object-cover rounded-lg border border-gray-200 shadow-sm mr-6"
                                    />

                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                          Banner {index + 1}
                                        </h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                          Position #{banner.order}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Drag to reorder • Click toggle to
                                        activate/deactivate
                                      </p>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() =>
                                          handleBannerToggleActive(banner._id)
                                        }
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                          banner.isActive
                                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                      >
                                        {banner.isActive
                                          ? "Active"
                                          : "Inactive"}
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleBannerDelete(banner._id)
                                        }
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </>
            )}

            {/* Review Management */}
            {activeTab === "reviews" && (
              <>
                {/* Add/Edit Review Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-[#8DC53E]/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[#8DC53E]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingReview ? "Edit Review" : "Add New Review"}
                    </h2>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          value={reviewForm.customerName}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              customerName: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Enter customer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Customer Title
                        </label>
                        <input
                          type="text"
                          value={reviewForm.customerTitle}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              customerTitle: e.target.value,
                            })
                          }
                          placeholder="e.g., Car Racer, Actor, CEO"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Review Text *
                      </label>
                      <textarea
                        value={reviewForm.description}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            description: e.target.value,
                          })
                        }
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                        placeholder="Write the customer's review..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Rating *
                      </label>
                      <div className="flex items-center space-x-4">
                        <StarRating
                          value={reviewForm.rating}
                          onChange={(value) =>
                            setReviewForm({ ...reviewForm, rating: value })
                          }
                          size="text-2xl"
                        />
                        <span className="text-lg font-semibold text-gray-700">
                          {reviewForm.rating} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Customer Image
                      </label>
                      <div className="flex items-start space-x-6">
                        <div className="flex-1">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReviewImageSelect}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#8DC53E] transition-colors duration-200">
                              <div className="w-12 h-12 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg
                                  className="w-6 h-6 text-[#8DC53E]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600">
                                <span className="text-[#8DC53E] font-medium">
                                  Click to upload
                                </span>{" "}
                                customer photo
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          </div>
                        </div>
                        {reviewImagePreview && (
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <img
                                src={reviewImagePreview}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  Preview
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={reviewUploading}
                        className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center space-x-2 ${
                          reviewUploading
                            ? "bg-gray-300 cursor-not-allowed text-gray-500"
                            : "bg-gradient-to-r from-[#8DC53E] to-[#7AB332] hover:from-[#7AB332] to-[#6BA228] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        }`}
                      >
                        {reviewUploading ? (
                          <>
                            <svg
                              className="animate-spin w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>
                              {editingReview ? "Update Review" : "Add Review"}
                            </span>
                          </>
                        )}
                      </button>
                      {editingReview && (
                        <button
                          type="button"
                          onClick={resetReviewForm}
                          className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Existing Reviews */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#8DC53E]/10 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#8DC53E]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Homepage Reviews
                      </h2>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {reviewLoading ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="animate-spin w-8 h-8 text-[#8DC53E]"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">
                        Loading reviews...
                      </p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-gray-600">
                        Add your first customer review to get started
                      </p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleReviewDragEnd}>
                      <Droppable droppableId="reviews">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-6"
                          >
                            {reviews.map((review, index) => (
                              <Draggable
                                key={review._id}
                                draggableId={review._id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 transition-all duration-200 ${
                                      snapshot.isDragging
                                        ? "shadow-2xl scale-[1.02] border-[#8DC53E]"
                                        : "hover:shadow-lg"
                                    }`}
                                  >
                                    <div className="flex items-start space-x-6">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-grab active:cursor-grabbing pt-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                      >
                                        <svg
                                          className="w-5 h-5 text-gray-400"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                        </svg>
                                      </div>

                                      <div className="flex-shrink-0">
                                        <div className="relative">
                                          <img
                                            src={
                                              review.customerImage
                                                ? `${API_URL.replace(
                                                    "/api",
                                                    ""
                                                  )}${review.customerImage}`
                                                : "/default-avatar.png"
                                            }
                                            alt={review.customerName}
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                          />
                                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#8DC53E] rounded-full border-2 border-white flex items-center justify-center">
                                            <svg
                                              className="w-3 h-3 text-white"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-3">
                                          <div>
                                            <h3 className="font-bold text-xl text-gray-900 mb-1">
                                              {review.customerName}
                                            </h3>
                                            <p className="text-sm font-medium text-[#8DC53E] uppercase tracking-wide">
                                              {review.customerTitle}
                                            </p>
                                            <div className="mt-2">
                                              <StarRating
                                                value={review.rating}
                                              />
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <button
                                              onClick={() =>
                                                handleEditReview(review)
                                              }
                                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-1"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                              <span>Edit</span>
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteReview(review._id)
                                              }
                                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-1"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                              <span>Delete</span>
                                            </button>
                                          </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                                          <p className="text-gray-700 leading-relaxed text-base">
                                            "{review.description}"
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </>
            )}
          </div>

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

export default ContentManagement;
