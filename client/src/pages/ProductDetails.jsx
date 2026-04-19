import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ShoppingCart,
  Award,
  Package,
  ArrowRight,
  Sparkles,
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
  const [activeTab, setActiveTab] = useState("description");
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
  const [canReview, setCanReview] = useState(false);
  const [reviewCheckLoading, setReviewCheckLoading] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmModalAction, setConfirmModalAction] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
    fetchReviews();
    checkCanReview();
    if (isLoggedIn()) fetchUserProfile();
  }, [id]);

  // Auto-slide images on hover
  useEffect(() => {
    let interval;
    const images = getProductImages();
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          if (prev >= images.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, 1500);
    } else {
      setCurrentImageIndex(selectedImage);
    }
    return () => clearInterval(interval);
  }, [isHovered, selectedImage]);

  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUserProfile(response.data.data);
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
      if (response.data.colors && response.data.colors.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await axios.get(
        `${API_URL}/product-reviews/product/${id}`,
      );
      if (response.data.success) {
        const reviewsData = response.data.data.reviews;
        if (isLoggedIn()) {
          const token = getAuthToken();
          const userResponse = await axios.get(`${API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userResponse.data.success) {
            const userId = userResponse.data.data._id;
            reviewsData.forEach((review) => {
              if (review.user && review.user._id === userId)
                review.canEdit = true;
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
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      if (response.data.success) {
        setCanReview(response.data.canReview);
        if (response.data.existingReview)
          setUserExistingReview(response.data.existingReview);
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
      if (!isLoggedIn()) {
        if (
          window.confirm(
            "Please log in to add items to cart. Would you like to log in now?",
          )
        ) {
          navigate("/login");
        }
        return;
      }
      if (addedToCart) return;
      setAddedToCart(true);
      await axios.post(
        `${API_URL}/cart/add`,
        { productId: id, quantity, selectedColor },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true,
        },
      );
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
    if (newQuantity >= 1) setQuantity(newQuantity);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImage(0);
    setCurrentImageIndex(0);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
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
        reviewerName: newReview.reviewerName.trim(),
      };
      let response;
      if (editingReview) {
        response = await axios.put(
          `${API_URL}/product-reviews/${editingReview._id}`,
          reviewData,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              "Content-Type": "application/json",
            },
          },
        );
      } else {
        response = await axios.post(`${API_URL}/product-reviews`, reviewData, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        });
      }
      if (response.data.success) {
        await fetchReviews();
        await checkCanReview();
        setNewReview({ rating: 5, title: "", comment: "", reviewerName: "" });
        setShowReviewForm(false);
        setEditingReview(null);
        alert(
          editingReview
            ? "Review updated successfully!"
            : "Review submitted successfully!",
        );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      let errorMessage = "Failed to submit review. Please try again.";
      if (error.response?.status === 400)
        errorMessage = error.response.data.message || errorMessage;
      else if (error.response?.status === 401) {
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
    if (isLoggedIn() && userProfile)
      reviewerName = `${userProfile.firstName} ${userProfile.lastName}`;
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
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
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
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getProductImages();
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getProductImages = () => {
    if (selectedColor?.images?.length) {
      return selectedColor.images.map((img) =>
        img.startsWith("http") ? img : `${API_URL.replace("/api", "")}${img}`,
      );
    } else if (product?.images?.length) {
      return product.images.map((img) =>
        img.startsWith("http") ? img : `${API_URL.replace("/api", "")}${img}`,
      );
    } else {
      return [
        product?.imageUrl
          ? `${API_URL.replace("/api", "")}${product.imageUrl}`
          : "/products/placeholder.jpg",
      ];
    }
  };

  const formatDescription = (text) => {
    if (!text) return "";
    return text.split("\n").map((line, index) => {
      const isBullet = /^(\s*[-*•]\s+)/.test(line);
      if (isBullet) {
        const content = line.replace(/^(\s*[-*•]\s+)/, "");
        return (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-[#8DC53E]">•</span>
            <span>{content}</span>
          </li>
        );
      }
      return (
        <p key={index} className="mb-3 last:mb-0">
          {line}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#8DC53E]/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8DC53E] animate-spin" />
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            Product not found
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="text-[#8DC53E] hover:text-[#6aab28] font-medium"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages();
  const displayImageIndex = isHovered ? currentImageIndex : selectedImage;

  return (
    <div className="bg-white min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }

        .review-card {
          transition: all 0.3s ease;
        }
        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1);
        }

        .tab-active {
          color: #8DC53E;
          border-bottom: 2px solid #8DC53E;
        }
      `}</style>

      {/* Breadcrumb - FIXED: Added proper padding */}
      <div className="border-b border-gray-100 mt-5">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10 py-5">
          <nav className="flex items-center text-sm font-jakarta flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-[#8DC53E] transition-colors"
            >
              Home
            </button>
            <ChevronRight
              size={14}
              className="text-gray-300 mx-2 flex-shrink-0"
            />
            <button
              onClick={() => navigate("/shop")}
              className="text-gray-500 hover:text-[#8DC53E] transition-colors"
            >
              Shop
            </button>
            <ChevronRight
              size={14}
              className="text-gray-300 mx-2 flex-shrink-0"
            />
            <span className="text-gray-900 font-medium truncate">
              {product.productName}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left - Images with Auto-Slider on Hover */}
          <div className="space-y-4">
            <div
              className="relative group bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden border border-gray-100"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="aspect-square w-full flex items-center justify-center p-6 lg:p-10">
                <img
                  src={productImages[displayImageIndex]}
                  alt={product.productName}
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Zoom Button */}
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
              >
                <ZoomIn size={18} />
              </button>

              {/* Image Indicators */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {productImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === displayImageIndex
                          ? "w-6 bg-[#8DC53E]"
                          : "w-1.5 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setCurrentImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-[#8DC53E] shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-outfit text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                  {product.productName}
                </h1>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex-shrink-0 p-2.5 rounded-xl border-2 transition-all ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-gray-50 border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
                  }`}
                >
                  <Heart
                    size={20}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.floor(calculateAverageRating())
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                  </div>
                  <span className="font-bold text-gray-900 ml-1">
                    {calculateAverageRating()}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  ({reviews.length} reviews)
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">
                  SKU: {product._id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="py-4 border-y border-gray-100">
              <div className="flex items-baseline gap-3">
                <span className="font-outfit text-3xl font-black text-gray-900">
                  Rs. {(selectedColor?.price || product.price).toLocaleString()}
                </span>
                {selectedColor?.originalPrice &&
                  selectedColor.originalPrice > selectedColor.price && (
                    <>
                      <span className="text-gray-400 line-through text-lg">
                        Rs. {selectedColor.originalPrice.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold">
                        Save{" "}
                        {Math.round(
                          ((selectedColor.originalPrice - selectedColor.price) /
                            selectedColor.originalPrice) *
                            100,
                        )}
                        %
                      </span>
                    </>
                  )}
              </div>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-outfit font-bold text-sm uppercase tracking-wider text-gray-700 mb-3">
                  Available Colors
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(color)}
                      className={`group relative p-3 border-2 rounded-xl transition-all ${
                        selectedColor === color
                          ? "border-[#8DC53E] bg-[#8DC53E]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          style={{
                            backgroundColor:
                              color.colorCode || color.hex || "#ccc",
                          }}
                        />
                        <div className="text-left">
                          <p className="font-bold text-sm text-gray-900">
                            {color.name || color.colorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {color.stock > 0
                              ? `${color.stock} in stock`
                              : "Out of stock"}
                          </p>
                        </div>
                      </div>
                      {selectedColor === color && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#8DC53E] rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-outfit font-bold text-white transition-all duration-300 ${
                    addedToCart
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-[#8DC53E] to-[#6aab28] hover:shadow-lg hover:shadow-[#8DC53E]/30 hover:-translate-y-0.5"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    {addedToCart ? "Added to Cart!" : "Add to Cart"}
                  </span>
                </button>
              </div>

              <button className="w-full py-3 px-6 rounded-xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all">
                Buy It Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                {
                  icon: Truck,
                  text: "Free Shipping",
                  sub: "On orders over Rs. 5,000",
                },
                { icon: Shield, text: "1 Year Warranty", sub: "Full coverage" },
                {
                  icon: RotateCcw,
                  text: "30 Day Returns",
                  sub: "Easy returns",
                },
                { icon: Award, text: "Authentic Product", sub: "100% genuine" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80"
                >
                  <feature.icon
                    size={18}
                    className="text-[#8DC53E] flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-900">
                      {feature.text}
                    </p>
                    <p className="text-xs text-gray-500">{feature.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-outfit font-bold text-sm uppercase tracking-wider transition-all ${
                    activeTab === tab
                      ? "text-[#8DC53E] border-b-2 border-[#8DC53E]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab === "reviews" ? `Reviews (${reviews.length})` : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose prose-lg max-w-none"
                >
                  <div className="text-gray-600 leading-relaxed space-y-4 font-jakarta">
                    {formatDescription(
                      selectedColor?.description ||
                        product.description ||
                        "Experience premium quality with this exceptional product.",
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "specifications" && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl"
                >
                  <div className="bg-gray-50 rounded-2xl p-6">
                    {[
                      {
                        label: "Brand",
                        value: product.brand || "Premium Brand",
                      },
                      {
                        label: "Category",
                        value: product.category?.categoryName || "General",
                      },
                      { label: "SKU", value: product._id },
                      {
                        label: "Stock Status",
                        value: selectedColor
                          ? selectedColor.stock > 0
                            ? "In Stock"
                            : "Out of Stock"
                          : "In Stock",
                      },
                      {
                        label: "Warranty",
                        value: "1 Year Manufacturer Warranty",
                      },
                      ...(selectedColor?.material
                        ? [{ label: "Material", value: selectedColor.material }]
                        : []),
                      ...(selectedColor?.size
                        ? [{ label: "Size", value: selectedColor.size }]
                        : []),
                      ...(selectedColor?.weight
                        ? [{ label: "Weight", value: selectedColor.weight }]
                        : []),
                    ].map((spec, i) => (
                      <div
                        key={i}
                        className="flex py-3 border-b border-gray-200 last:border-0"
                      >
                        <span className="w-1/3 font-bold text-gray-700">
                          {spec.label}
                        </span>
                        <span className="w-2/3 text-gray-600">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="font-outfit text-5xl font-black text-gray-900 mb-2">
                          {calculateAverageRating()}
                        </div>
                        <div className="flex justify-center mb-1">
                          {Array(5)
                            .fill()
                            .map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < Math.floor(calculateAverageRating())
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-200"
                                }
                              />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          {reviews.length} reviews
                        </p>
                      </div>
                      <div className="flex-1">
                        {isLoggedIn() ? (
                          reviewCheckLoading ? (
                            <div className="flex items-center text-gray-500">
                              <div className="w-4 h-4 rounded-full border-2 border-[#8DC53E]/30 border-t-[#8DC53E] animate-spin mr-2" />
                              Checking...
                            </div>
                          ) : canReview ? (
                            <button
                              onClick={() => setShowReviewForm(true)}
                              className="bg-[#8DC53E] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#6aab28] transition-all"
                            >
                              Write a Review
                            </button>
                          ) : userExistingReview ? (
                            <button
                              onClick={() =>
                                handleEditReview(userExistingReview)
                              }
                              className="border-2 border-[#8DC53E] text-[#8DC53E] px-6 py-2.5 rounded-xl font-bold hover:bg-[#8DC53E]/5 transition-all"
                            >
                              Edit Your Review
                            </button>
                          ) : (
                            <p className="text-gray-500">
                              Purchase this product to leave a review
                            </p>
                          )
                        ) : (
                          <button
                            onClick={() => navigate("/login")}
                            className="border-2 border-gray-300 text-gray-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all"
                          >
                            Login to Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {reviewsLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 rounded-full border-2 border-[#8DC53E]/30 border-t-[#8DC53E] animate-spin" />
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-5">
                      {reviews.map((review) => (
                        <div
                          key={review._id}
                          className="review-card bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8DC53E] to-[#5a9e1a] flex items-center justify-center text-white font-bold text-sm">
                                {review.reviewerName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {review.reviewerName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            {review.canEdit && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="text-blue-500 text-xs hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="text-red-500 text-xs hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex mb-2">
                            {Array(5)
                              .fill()
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-200"
                                  }
                                />
                              ))}
                          </div>
                          {review.title && (
                            <p className="font-bold text-gray-800 mb-2">
                              {review.title}
                            </p>
                          )}
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Package
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>
                        No reviews yet. Be the first to review this product!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={productImages[displayImageIndex]}
              alt={product.productName}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 text-white hover:text-gray-300"
                >
                  <ChevronLeft size={40} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 text-white hover:text-gray-300"
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
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
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-outfit text-xl font-black text-gray-900">
                  {editingReview ? "Edit Review" : "Write a Review"}
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={28}
                          onClick={() =>
                            setNewReview({ ...newReview, rating: i + 1 })
                          }
                          className={`cursor-pointer transition-colors ${i < newReview.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Your Name
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
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8DC53E]/20 focus:border-[#8DC53E] transition"
                    placeholder="Enter your name"
                    required
                    disabled={isLoggedIn()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) =>
                      setNewReview({ ...newReview, title: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8DC53E]/20 focus:border-[#8DC53E] transition"
                    placeholder="Summarize your experience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8DC53E]/20 focus:border-[#8DC53E] transition h-28 resize-none"
                    placeholder="Share your thoughts about this product..."
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
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
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#8DC53E] to-[#6aab28] text-white rounded-xl font-bold hover:shadow-lg transition"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center text-gray-800 font-medium mb-6">
                {confirmModalMessage}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (confirmModalAction) confirmModalAction();
                    setShowConfirmModal(false);
                  }}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
