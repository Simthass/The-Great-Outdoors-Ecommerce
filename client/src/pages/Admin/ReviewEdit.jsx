import { useEffect, useState } from "react";
import StarRating from "../../components/StarRating";
import Sidebar from "../../components/Sidebar";
import {
  getReview,
  updateReview,
  createReview,
  deleteReview,
} from "../../lib/ReviewsApi";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  Save,
  Trash2,
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
  Package,
} from "lucide-react";

export default function ReviewEdit() {
  const { id } = useParams(); // "R001" or "new"
  const isNew = id === "new";
  const navigate = useNavigate();
  const [currentSidebarPage] = useState("reviews");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    rating: 5,
    description: "",
    customerId: "",
    productId: "",
    dateAdded: "",
    status: "Y",
    response: "",
  });

  const [originalResponse, setOriginalResponse] = useState("");

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
    if (isNew) return;

    (async () => {
      setLoading(true);
      try {
        const r = await getReview(id);
        if (!r) {
          setError("Review not found");
          return;
        }
        setForm({
          rating: r.rating ?? 5,
          description: r.description ?? "",
          customerId: r.customerId ?? "",
          productId: r.productId ?? "",
          dateAdded: r.dateAdded ? r.dateAdded.slice(0, 10) : "",
          status: r.status ?? "Y",
          response: r.response ?? "",
        });
        setOriginalResponse(r.response ?? "");
      } catch (err) {
        setError("Failed to load review");
        console.error("Error loading review:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Save: update everything EXCEPT response
  const onSave = async () => {
    if (!form.customerId || !form.productId || !form.description) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { rating, description, customerId, productId, dateAdded, status } =
        form;
      const payload = {
        rating,
        description,
        customerId,
        productId,
        dateAdded,
        status,
      };

      if (isNew) {
        const created = await createReview(payload);
        navigate(`/Admin/ReviewEdit/${created.reviewId ?? "new"}`);
        alert("Review created successfully!");
      } else {
        await updateReview(id, payload);
        alert("Review saved successfully!");
      }
    } catch (err) {
      setError("Failed to save review");
      console.error("Error saving review:", err);
    } finally {
      setLoading(false);
    }
  };

  // Respond: update ONLY the response field
  const onRespond = async () => {
    try {
      setLoading(true);
      setError("");

      await updateReview(id, { response: form.response });
      setOriginalResponse(form.response);
      alert("Response saved successfully!");
    } catch (err) {
      setError("Failed to save response");
      console.error("Error saving response:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      setLoading(true);
      setError("");

      await deleteReview(id);
      alert("Review deleted successfully!");
      navigate("/Admin/ReviewList");
    } catch (err) {
      setError("Failed to delete review");
      console.error("Error deleting review:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sidebar navigation
  const handleNavClick = (key) => {
    // Let sidebar handle navigation
  };

  const responseDirty =
    form.response.trim() !== "" && form.response !== originalResponse;

  return (
    <div data-testid="admin-review-edit">
      {/* Header */}
      <div
        className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center"
        data-testid="page-hero"
      >
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
          Admin - {isNew ? "Add New Review" : "Edit Review"}
        </p>
      </div>

      <div className="flex bg-gray-50 min-h-screen mt-6 rounded-2xl" data-testid="layout">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavClick}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <div className="flex-1 p-6" data-testid="content">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/Admin/ReviewList")}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
              data-testid="back-to-list-btn"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reviews
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded"
              data-testid="error-banner"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm" data-testid="error-text">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-sm border" data-testid="edit-card">
            {/* Form Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-yellow-500" />
                <h1 className="text-2xl font-bold text-gray-800" data-testid="edit-title">
                  {isNew ? "Add New Review" : `Edit Review ${id}`}
                </h1>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6" data-testid="form-section">
              {loading && !isNew ? (
                <div className="flex items-center justify-center py-12" data-testid="loading-indicator">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
                  <span className="text-gray-600">Loading review...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Rating */}
                  <div className="bg-gray-50 p-4 rounded-lg" data-testid="rating-block">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Rating</h3>
                      <button
                        className="text-sm text-green-600 hover:text-green-700 underline"
                        onClick={() => setForm((s) => ({ ...s, rating: 5 }))}
                        data-testid="reset-rating-btn"
                      >
                        Reset to 5 Stars
                      </button>
                    </div>
                    <div data-testid="star-rating">
                      <StarRating
                        value={form.rating}
                        onChange={(v) => setForm((s) => ({ ...s, rating: v }))}
                        size="text-2xl"
                      />
                    </div>
                  </div>

                  {/* Review Description */}
                  <div data-testid="description-field">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[120px]"
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      placeholder="Write the review details…"
                      rows={5}
                      data-testid="description-input"
                    />
                  </div>

                  {/* Customer and Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="meta-grid">
                    <div data-testid="customer-field">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        name="customerId"
                        value={form.customerId}
                        onChange={onChange}
                        placeholder="John Doe"
                        readOnly
                        data-testid="customer-input"
                      />
                    </div>
                    <div data-testid="product-field">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package className="h-4 w-4 inline mr-1" />
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        name="productId"
                        value={form.productId}
                        onChange={onChange}
                        placeholder="Product Name"
                        readOnly
                        data-testid="product-input"
                      />
                    </div>
                    <div data-testid="date-field">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Date Added
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        name="dateAdded"
                        value={form.dateAdded}
                        onChange={onChange}
                        data-testid="date-added-input"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div data-testid="status-field">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      name="status"
                      value={form.status}
                      onChange={onChange}
                      data-testid="status-select"
                    >
                      <option value="Y">Active (Y)</option>
                      <option value="N">Inactive (N)</option>
                    </select>
                  </div>

                  {/* Admin Response */}
                  <div className="bg-blue-50 p-4 rounded-lg" data-testid="response-field">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      Admin Response
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                      name="response"
                      value={form.response}
                      onChange={onChange}
                      placeholder="Write your response to this review…"
                      rows={4}
                      data-testid="response-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-gray-50" data-testid="actions">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  onClick={() => navigate("/Admin/ReviewList")}
                  disabled={loading}
                  data-testid="cancel-btn"
                >
                  Cancel
                </button>

                {!isNew && (
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    onClick={onDelete}
                    disabled={loading}
                    data-testid="delete-btn"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Review
                  </button>
                )}

                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  onClick={onSave}
                  disabled={loading}
                  data-testid="save-btn"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" data-testid="saving-spinner"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isNew ? "Create Review" : "Save Changes"}
                </button>

                {!isNew && (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    disabled={!responseDirty || loading}
                    onClick={onRespond}
                    data-testid="save-response-btn"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Save Response
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

