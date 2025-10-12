import { useEffect, useMemo, useState } from "react";
import StarRating from "../../components/StarRating";
import Sidebar from "../../components/Sidebar";
import { listAdminReviews, deleteAdminReview } from "../../lib/ReviewsApi";
import { useNavigate } from "react-router-dom";
import { Star, Filter, Plus, FileText } from "lucide-react";

export default function ReviewsList() {
  const [data, setData] = useState([]);
  const [sortKey, setSortKey] = useState("date_desc");
  const [productFilter, setProductFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentSidebarPage] = useState("reviews");
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

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
    (async () => {
      setLoading(true);
      try {
        const res = await listAdminReviews();
        setData(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const pf = productFilter.trim().toLowerCase();
    const cf = customerFilter.trim().toLowerCase();
    let rows = [...data];

    if (pf) rows = rows.filter((r) => (r.productId || "").toLowerCase().includes(pf));
    if (cf) rows = rows.filter((r) => (r.customerId || "").toLowerCase().includes(cf));

    rows.sort((a, b) => {
      const da = new Date(a.dateAdded).getTime();
      const db = new Date(b.dateAdded).getTime();
      const ra = Number(a.rating || 0);
      const rb = Number(b.rating || 0);
      const pa = (a.productId || "").toLowerCase();
      const pb = (b.productId || "").toLowerCase();
      const ca = (a.customerId || "").toLowerCase();
      const cb = (b.customerId || "").toLowerCase();

      switch (sortKey) {
        case "date_desc": return db - da;
        case "date_asc": return da - db;
        case "rating_desc": return rb - ra;
        case "rating_asc": return ra - rb;
        case "product_asc": return pa.localeCompare(pb);
        case "product_desc": return pb.localeCompare(pa);
        case "customer_asc": return ca.localeCompare(cb);
        case "customer_desc": return cb.localeCompare(ca);
        default: return 0;
      }
    });

    return rows;
  }, [productFilter, customerFilter, data, sortKey]);

  const onDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    await deleteAdminReview(id);
    setData((rows) => rows.filter((r) => r.reviewId !== id));
  };

  const handleNavClick = (key) => {};

  return (
    <div data-testid="reviews-list-page">
      {/* Header */}
      <div
        className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center"
        data-testid="admin-reviews-header"
      >
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]" data-testid="admin-reviews-title">
          Admin - Review Management
        </p>
      </div>

      <div className="flex bg-gray-50 min-h-screen mt-6 rounded-2xl">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavClick}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Stats */}
          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6" data-testid="reviews-stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="total-reviews-count">
                    {data.length}
                  </p>
                </div>
                <Star className="h-10 w-10 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="mx-6 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800" data-testid="reviews-section-title">
                Ratings and Reviews
              </h1>
            </div>

            {/* Filters and Controls */}
            <div className="p-6 border-b border-gray-200" data-testid="reviews-filters">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input
                  data-testid="product-filter-input"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Filter by Product ID"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                />
                <input
                  data-testid="customer-filter-input"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Filter by Customer ID"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                />
                <select
                  data-testid="sort-select"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  title="Sort options"
                >
                  <optgroup label="Date">
                    <option value="date_desc">By date (Newest)</option>
                    <option value="date_asc">By date (Oldest)</option>
                  </optgroup>
                  <optgroup label="Rating">
                    <option value="rating_desc">Rating (Highest)</option>
                    <option value="rating_asc">Rating (Lowest)</option>
                  </optgroup>
                  <optgroup label="IDs">
                    <option value="product_asc">Product ID (A → Z)</option>
                    <option value="product_desc">Product ID (Z → A)</option>
                    <option value="customer_asc">Customer ID (A → Z)</option>
                    <option value="customer_desc">Customer ID (Z → A)</option>
                  </optgroup>
                </select>

                <button
                  data-testid="clear-filters-btn"
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                  onClick={() => {
                    setProductFilter("");
                    setCustomerFilter("");
                    setSortKey("date_desc");
                  }}
                >
                  <Filter className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  data-testid="add-review-btn"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                  onClick={() => navigate("/Admin/ReviewEdit/new")}
                >
                  <Plus className="h-4 w-4" />
                  Add Review
                </button>
                <button
                  data-testid="review-report-btn"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                  onClick={() => navigate("/Admin/ReportGeneration/reviewReport")}
                >
                  <FileText className="h-4 w-4" />
                  Review Report
                </button>
              </div>
            </div>

            {/* Table (desktop) */}
            <div className="hidden md:block overflow-x-auto" data-testid="reviews-table">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Rating</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Product Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Customer Name</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Review ID</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Date Added</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr data-testid="reviews-loading-row">
                      <td className="py-8 text-center text-gray-500" colSpan={7}>
                        <div className="flex items-center justify-center" data-testid="reviews-loading">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                          Loading reviews...
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr data-testid="reviews-empty-row">
                      <td className="py-8 text-center text-gray-500" colSpan={7} data-testid="reviews-empty">
                        No reviews found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr
                        key={r.reviewId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        data-testid={`review-row-${r.reviewId}`}
                      >
                        <td className="py-4 px-6"><StarRating value={Number(r.rating) || 0} /></td>
                        <td className="py-4 px-6 text-gray-900" data-testid="product-cell">
                          {r.productId.length > 30 ? `${r.productId.substring(0, 30)}...` : r.productId}
                        </td>
                        <td className="py-4 px-6 text-gray-900" data-testid="customer-cell">{r.customerId}</td>
                        <td className="py-4 px-6 text-gray-900" data-testid="reviewid-cell">{r.reviewId}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800" data-testid="status-badge">
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600" data-testid="date-cell">
                          {r.dateAdded ? new Date(r.dateAdded).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              onClick={() => navigate(`/Admin/ReviewEdit/${r.reviewId}`)}
                              data-testid={`open-review-btn-${r.reviewId}`}
                            >
                              Open
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              onClick={() => onDelete(r.reviewId)}
                              data-testid={`delete-review-btn-${r.reviewId}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile) */}
            <div className="md:hidden p-6" data-testid="reviews-cards">
              {loading ? (
                <div className="text-center py-8 text-gray-500" data-testid="reviews-loading-mobile">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                    Loading reviews...
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500" data-testid="reviews-empty-mobile">
                  No reviews found
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((r) => (
                    <div
                      key={r.reviewId}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                      data-testid={`review-card-${r.reviewId}`}
                    >
                      {/* ...unchanged content... */}
                      <div className="mt-4 flex gap-2">
                        <button
                          className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          onClick={() => navigate(`/Admin/ReviewEdit/${r.reviewId}`)}
                          data-testid={`open-review-card-btn-${r.reviewId}`}
                        >
                          Open
                        </button>
                        <button
                          className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium py-2 px-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          onClick={() => onDelete(r.reviewId)}
                          data-testid={`delete-review-card-btn-${r.reviewId}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

