import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";
import {
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Plus,
  Minus,
  X,
  Check,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Review system state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
    reviewerName: "",
  });
  // Add these missing state variables after your existing useState declarations:
  const [canReview, setCanReview] = useState(false);
  const [reviewCheckLoading, setReviewCheckLoading] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState(null);
  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalAction, setConfirmModalAction] = useState(null);

  const [userProfile, setUserProfile] = useState(null);

  // Fallback API URL since import.meta.env is not available
  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
    fetchReviews();
    checkCanReview();
    if (isLoggedIn()) {
      fetchUserProfile();
    }
  }, [id, editingReview]);

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUserProfile(response.data.data);

        // Only auto-fill reviewer name if we're NOT editing an existing review
        if (!editingReview) {
          setNewReview((prev) => ({
            ...prev,
            reviewerName: `${response.data.data.firstName} ${response.data.data.lastName}`,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);

      // Set default selected color if colors are available
      if (response.data.colors && response.data.colors.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDescription = (text) => {
    if (!text) return "";

    // Split by lines and process each line
    return text.split("\n").map((line, index) => {
      // Check if line starts with bullet point indicator (like -, *, •, etc.)
      const isBullet = /^(\s*[-*•]\s+)/.test(line);

      if (isBullet) {
        // Remove the bullet indicator and wrap in list item
        const content = line.replace(/^(\s*[-*•]\s+)/, "");
        return (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-gray-400">•</span>
            <span>{content}</span>
          </li>
        );
      }

      // Regular paragraph
      return <p key={index}>{line}</p>;
    });
  };
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await axios.get(
        `${API_URL}/product-reviews/product/${id}`
      );

      if (response.data.success) {
        const reviewsData = response.data.data.reviews;

        // If user is logged in, mark their own reviews as editable
        if (isLoggedIn()) {
          const token = getAuthToken();
          const userResponse = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (userResponse.data.success) {
            const userId = userResponse.data.data._id;
            reviewsData.forEach((review) => {
              if (review.user && review.user._id === userId) {
                review.canEdit = true;
              }
            });
          }
        }

        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };
  const checkCanReview = async () => {
    if (!isLoggedIn()) {
      setCanReview(false);
      return;
    }

    try {
      setReviewCheckLoading(true);
      const response = await axios.get(
        `${API_URL}/product-reviews/can-review/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      if (response.data.success) {
        setCanReview(response.data.canReview);

        if (response.data.existingReview) {
          setUserExistingReview(response.data.existingReview);
        }
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      setCanReview(false);
    } finally {
      setReviewCheckLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      // Check if user is logged in
      if (!isLoggedIn()) {
        if (
          window.confirm(
            "Please log in to add items to cart. Would you like to log in now?"
          )
        ) {
          navigate("/login");
        }
        return;
      }

      // Prevent duplicate clicks
      if (addedToCart) return;

      // Optimistically update UI
      setAddedToCart(true);

      const response = await axios.post(
        `${API_URL}/cart/add`,
        {
          productId: id,
          quantity: quantity,
          selectedColor: selectedColor,
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          withCredentials: true,
        }
      );

      console.log("Added to cart:", response.data);

      // Reset the button state after 3 seconds
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddedToCart(false);

      if (error.response?.status === 401) {
        alert("Please log in to add items to cart");
        navigate("/login");
      } else {
        alert("Failed to add item to cart. Please try again.");
      }
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    // Reset image selection when color changes
    setSelectedImage(0);
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    // Add validation for reviewerName
    if (!newReview.reviewerName || newReview.reviewerName.trim() === "") {
      setConfirmModalMessage("Please enter your name");
      setShowConfirmModal(true);
      return;
    }

    try {
      const reviewData = {
        productId: id,
        rating: parseInt(newReview.rating),
        title: newReview.title ? newReview.title.trim() : "",
        comment: newReview.comment.trim(),
        reviewerName: newReview.reviewerName.trim(), // This should now be defined
      };

      console.log("📝 Submitting review data:", reviewData);

      let response;
      if (editingReview) {
        response = await axios.put(
          `${API_URL}/product-reviews/${editingReview._id}`, // ✅ fixed
          reviewData,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.post(`${API_URL}/product-reviews`, reviewData, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        });
      }

      console.log("✅ Review response:", response.data);

      if (response.data.success) {
        // Refresh reviews and check review status
        await fetchReviews();
        await checkCanReview();

        // Reset form
        setNewReview({
          rating: 5,
          title: "",
          comment: "",
          reviewerName: "",
        });
        setShowReviewForm(false);
        setEditingReview(null);

        alert(
          editingReview
            ? "Review updated successfully!"
            : "Review submitted successfully!"
        );
      }
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      console.error("❌ Error response:", error.response?.data);

      let errorMessage = "Failed to submit review. Please try again.";

      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || errorMessage;

        // If there are validation errors, show them
        if (error.response.data.errors) {
          const errorDetails = error.response.data.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join(", ");
          errorMessage += ` Details: ${errorDetails}`;
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Please log in again to submit your review.";
        navigate("/login");
        return;
      }

      setConfirmModalMessage(errorMessage);
      setShowConfirmModal(true);
    }
  };
  const handleEditReview = (review) => {
    let reviewerName = review.reviewerName;

    // If user is logged in, force fill from profile
    if (isLoggedIn() && userProfile) {
      reviewerName = `${userProfile.firstName} ${userProfile.lastName}`;
    }

    setNewReview({
      rating: review.rating || 5,
      title: review.title || "",
      comment: review.comment || "",
      reviewerName: reviewerName || "",
    });
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = (reviewId) => {
    setConfirmModalMessage("Are you sure you want to delete this review?");
    setShowConfirmModal(true);
    setConfirmModalAction(() => async () => {
      try {
        await axios.delete(`${API_URL}/product-reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        // Refresh reviews and check review status
        await fetchReviews();
        await checkCanReview();
        setShowConfirmModal(false);

        alert("Review deleted successfully!");
      } catch (error) {
        console.error("Error deleting review:", error);
        setShowConfirmModal(false);
        alert("Failed to delete review. Please try again.");
      }
    });
  };

  const formatDate = (date) => {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return "1 month ago";
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const nextImage = () => {
    const images = getProductImages();
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getProductImages();
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <div className="text-xl text-gray-600 mt-4 font-medium">
            Loading product details...
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-6xl text-red-500 mb-4">⚠️</div>
          <div className="text-2xl text-red-600 font-semibold">
            Product not found
          </div>
        </div>
      </div>
    );
  }

  // Get product images - either from selected color or default product images
  const getProductImages = () => {
    if (
      selectedColor &&
      selectedColor.images &&
      selectedColor.images.length > 0
    ) {
      return selectedColor.images.map((img) =>
        img.startsWith("http") ? img : `${API_URL.replace("/api", "")}${img}`
      );
    } else if (product.images && product.images.length > 0) {
      return product.images.map((img) =>
        img.startsWith("http") ? img : `${API_URL.replace("/api", "")}${img}`
      );
    } else {
      // Fallback to single image or placeholder
      return [
        product.imageUrl
          ? `${API_URL.replace("/api", "")}${product.imageUrl}`
          : "/products/placeholder.jpg",
      ];
    }
  };

  const productImages = getProductImages();

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-900">
      {/* Modern Breadcrumb */}
      <div className="w-full h-20 bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm">
            <button
              onClick={() => navigate("/")}
              className="text-white hover:text-green-600 transition-colors duration-200 cursor-pointer"
            >
              Home
            </button>
            <ChevronRight size={16} className="text-gray-400 mx-1" />
            <button
              onClick={() => navigate("/shop")}
              className="text-white hover:text-green-600 transition-colors duration-200 cursor-pointer"
            >
              Shop
            </button>
            <ChevronRight size={16} className="text-gray-400 mx-1" />
            <span className="text-white font-semibold truncate max-w-xs">
              {product.productName}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Enhanced Product Images Section */}
            <div className="p-4 sm:p-8 bg-gray-100 flex items-center justify-center">
              <div className="relative group w-full max-w-lg mx-auto">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-md">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.productName}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Image Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Zoom Button */}
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <ZoomIn size={18} />
                  </button>

                  {/* Image Counter */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {selectedImage + 1} / {productImages.length}
                    </div>
                  )}
                </div>

                {/* Enhanced Thumbnail Images */}
                {productImages.length > 1 && (
                  <div className="mt-6">
                    <div className="flex justify-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                      {productImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 focus:outline-none ${
                            selectedImage === index
                              ? "ring-2 ring-green-500 ring-offset-2 shadow-lg"
                              : "ring-1 ring-gray-200 hover:ring-gray-300 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.productName} ${index + 1}`}
                            className="w-full h-full object-contain bg-white"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Product Information */}
            <div className="p-6 sm:p-10 lg:p-12 space-y-6 lg:space-y-8">
              {/* Product Title & Actions */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {product.productName}
                    </h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        SKU: {product._id.slice(-8)}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {product.brand || "Premium Brand"}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`p-2 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        isWishlisted
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>
                    <button className="p-2 rounded-xl border-2 bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Enhanced Rating */}
                <div className="flex items-center space-x-3 mt-4">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {Array(5)
                        .fill()
                        .map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={`${
                              i < Math.floor(calculateAverageRating())
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {calculateAverageRating()}
                    </span>
                    <span className="text-gray-500 text-xs">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      document
                        .getElementById("reviews-section")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                    className="text-green-600 hover:text-green-700 font-medium text-xs border-b border-green-600 hover:border-green-700 transition-colors"
                  >
                    Read Reviews
                  </button>
                </div>
              </div>

              {/* Enhanced Price */}
              <div className="py-4 border-b border-gray-100">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    Rs.{" "}
                    {selectedColor && selectedColor.price
                      ? selectedColor.price
                      : product.price}
                  </span>
                  {selectedColor &&
                    selectedColor.originalPrice &&
                    selectedColor.originalPrice > selectedColor.price && (
                      <span className="text-base text-gray-500 line-through">
                        Rs. {selectedColor.originalPrice}
                      </span>
                    )}
                  {selectedColor &&
                    selectedColor.originalPrice &&
                    selectedColor.originalPrice > selectedColor.price && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {Math.round(
                          ((selectedColor.originalPrice - selectedColor.price) /
                            selectedColor.originalPrice) *
                            100
                        )}{" "}
                        % OFF
                      </span>
                    )}
                </div>
              </div>

              {/* Enhanced Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Available Colors
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorChange(color)}
                        className={`p-3 border rounded-xl transition-all duration-300 text-left ${
                          selectedColor === color
                            ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                            style={{
                              backgroundColor:
                                color.colorCode || color.hex || "#gray",
                            }}
                          ></div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-900">
                              {color.name || color.colorName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {color.stock !== undefined
                                ? color.stock > 0
                                  ? `${color.stock} in stock`
                                  : "Out of stock"
                                : "In Stock"}
                            </div>
                          </div>
                          {selectedColor === color && (
                            <Check
                              size={20}
                              className="text-green-500 flex-shrink-0"
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 h-8 text-center border-2 border-green-500 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 no-arrows"
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-green-600 text-white rounded-xl py-3 px-6 font-semibold text-lg hover:bg-green-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {addedToCart ? "Added ✓" : "+ Add to Cart"}
                  </button>
                </div>
              </div>

              {/* Other Features */}
              <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                <div className="flex items-center">
                  <Truck size={20} className="text-green-500 mr-2" />
                  Free Shipping
                </div>
                <div className="flex items-center">
                  <Shield size={20} className="text-green-500 mr-2" />1 Year
                  Warranty
                </div>
                <div className="flex items-center">
                  <RotateCcw size={20} className="text-green-500 mr-2" />
                  30 Day Returns
                </div>
                <div className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-3xl shadow-lg mt-8 p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Description</h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {formatDescription(
                selectedColor && selectedColor.description
                  ? selectedColor.description
                  : product.description ||
                      "Experience premium quality with this exceptional product. Designed for durability and performance, it offers outstanding value and reliability for all your needs."
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Specifications</h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Brand",
                    value: product.brand || "Premium Brand",
                  },
                  {
                    label: "Category",
                    value: product.category?.categoryName || "General",
                  },
                  {
                    label: "Stock",
                    value: selectedColor
                      ? selectedColor.stock > 0
                        ? `${selectedColor.stock} in stock`
                        : "Out of stock"
                      : "In Stock",
                    className: selectedColor
                      ? selectedColor.stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-green-600",
                  },
                  { label: "Warranty", value: "1 Year" },
                  ...(selectedColor && selectedColor.material
                    ? [{ label: "Material", value: selectedColor.material }]
                    : []),
                  ...(selectedColor && selectedColor.size
                    ? [{ label: "Size", value: selectedColor.size }]
                    : []),
                ].map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-600 text-sm">
                      {spec.label}:
                    </span>
                    <span
                      className={`font-semibold text-sm ${
                        spec.className || "text-gray-900"
                      }`}
                    >
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {/* Reviews Section */}
        <div
          className="bg-white rounded-3xl shadow-lg mt-8 p-6 sm:p-8 lg:p-10 space-y-8"
          id="reviews-section"
        >
          {/* Reviews Section Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews ({reviews.length})
            </h2>

            {/* Conditional Review Button */}
            {isLoggedIn() ? (
              <div>
                {reviewCheckLoading ? (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    Checking...
                  </div>
                ) : canReview ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-green-600 text-white text-sm font-semibold rounded-full px-5 py-2 hover:bg-green-700 transition-colors duration-200"
                  >
                    Write a Review
                  </button>
                ) : userExistingReview ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      You've already reviewed this product
                    </p>
                    <button
                      onClick={() => handleEditReview(userExistingReview)}
                      className="bg-blue-600 text-white text-sm font-semibold rounded-full px-5 py-2 hover:bg-blue-700 transition-colors duration-200"
                    >
                      Edit Your Review
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="bg-gray-400 text-white text-sm font-semibold rounded-full px-5 py-2 cursor-not-allowed"
                      title="You can only review products you have purchased and received"
                    >
                      Purchase Required to Review
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      Only verified purchasers can leave reviews
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-gray-600 text-white text-sm font-semibold rounded-full px-5 py-2 hover:bg-gray-700 transition-colors duration-200"
              >
                Login to Review
              </button>
            )}
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        {review.reviewerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-semibold text-gray-900">
                            {review.reviewerName}
                          </div>
                          {review.isVerifiedPurchase && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    {review.canEdit && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < review.rating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-gray-900 text-sm">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              No reviews yet.{" "}
              {canReview
                ? "Be the first to review this product!"
                : "Purchase this product to leave the first review!"}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={productImages[selectedImage]}
              alt={product.productName}
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
            >
              <X size={24} />
            </button>
            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
          onClick={() => {
            setShowReviewForm(false);
            setEditingReview(null);
            setNewReview({
              rating: 5,
              title: "",
              comment: "",
              reviewerName: "",
            });
          }}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4"></form>
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setNewReview({
                    rating: 5,
                    title: "",
                    comment: "",
                    reviewerName: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex">
                  {Array(5)
                    .fill()
                    .map((_, i) => (
                      <Star
                        key={i}
                        size={32}
                        onClick={() =>
                          setNewReview({ ...newReview, rating: i + 1 })
                        }
                        className={`cursor-pointer transition-colors duration-200 ${
                          i < newReview.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={newReview.reviewerName}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      reviewerName: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Enter your name"
                  required
                  disabled={isLoggedIn()} // Disable if logged in
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) =>
                    setNewReview({ ...newReview, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Summarize your review in a short title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment *
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm h-32"
                  placeholder="Share your thoughts on the product..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setNewReview({
                      rating: 5,
                      title: "",
                      comment: "",
                      reviewerName: "",
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors duration-200"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-gray-800 text-lg font-semibold">
              {confirmModalMessage}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  if (confirmModalAction) confirmModalAction();
                  setShowConfirmModal(false);
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
