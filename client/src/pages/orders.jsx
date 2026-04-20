import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  MapPin,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Filter,
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

// ── Order Card Component ─────────────────────────────────────────────────────
const OrderCard = ({ order, onViewDetails, onCancel, isExpanded, onToggleExpand }) => {
  const total = order.totalAmount + order.shippingCost - order.discount;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base">#{order.orderId}</h3>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(order.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard size={12} />
                {order.paymentMethod || "Card"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#8DC53E]">Rs.{total.toLocaleString()}</span>
            <button
              onClick={() => onViewDetails(order._id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
            >
              <Eye size={14} /> View
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Items */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Package size={14} /> Items ({order.items.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image ? `http://localhost:5000${item.image}` : "/products/placeholder.jpg"}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "/products/placeholder.jpg"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs.{item.price.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-bold text-[#8DC53E]">Rs.{item.total.toLocaleString()}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-400 text-center pt-1">+{order.items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                {/* Summary & Shipping */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <DollarSign size={14} /> Order Summary
                  </h4>
                  <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">Rs.{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium">{order.shippingCost === 0 ? "Free" : `Rs.${order.shippingCost.toLocaleString()}`}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-medium text-green-600">-Rs.{order.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-[#8DC53E]">Rs.{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <MapPin size={14} /> Shipping Address
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-100 p-3 text-sm text-gray-600">
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                      </div>
                    </div>
                  )}

                  {order.orderStatus === "Pending" && (
                    <button
                      onClick={() => onCancel(order._id)}
                      className="mt-4 w-full py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wide hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Orders Page ─────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  ScrollToTop();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, selectedStatus, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await axios.get(`${API_URL}/orders/user`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        params,
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
        setError("");
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderId = order.orderId?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return orderId.includes(search);
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "Pending").length,
    processing: orders.filter((o) => o.orderStatus === "Processing").length,
    delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
  };

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#8DC53E]/20 border-t-[#8DC53E] rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Orders-hero.jpg"
            alt="Orders background"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Your Orders
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                My
                <br />
                <span className="text-[#8DC53E]">Orders</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                Track and manage all your purchases in one place.
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
                <div className="bg-gray-50 rounded-xl p-5 sticky top-6">
                  {/* Stats */}
                  <div className="text-center pb-5 border-b border-gray-200">
                    <div className="w-14 h-14 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag size={24} className="text-[#8DC53E]" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Order History</h2>
                    <p className="text-xs text-gray-500 mt-1">{stats.total} total orders</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 py-5 border-b border-gray-200">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{stats.delivered}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Delivered</p>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="pt-5 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Search</label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Order ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#8DC53E] focus:ring-1 focus:ring-[#8DC53E] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                        <Filter size={12} /> Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#8DC53E] outline-none bg-white"
                      >
                        <option value="">All Orders</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wide hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                      Refresh
                    </button>

                    <button
                      onClick={() => navigate("/shop")}
                      className="w-full py-2 rounded-lg bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all flex items-center justify-center gap-2"
                    >
                      Continue Shopping <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Orders List */}
            <div className="lg:col-span-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={18} className="text-red-500" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                  <button onClick={fetchOrders} className="text-red-600 text-sm font-medium">Try Again</button>
                </div>
              )}

              {filteredOrders.length === 0 ? (
                <FadeIn>
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      {searchTerm || selectedStatus ? "Try adjusting your filters" : "You haven't placed any orders yet"}
                    </p>
                    <button
                      onClick={() => navigate("/shop")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
                    >
                      Start Shopping <ArrowRight size={14} />
                    </button>
                  </div>
                </FadeIn>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order, idx) => (
                    <FadeIn key={order._id} delay={idx * 0.05}>
                      <OrderCard
                        order={order}
                        onViewDetails={(id) => navigate(`/orders/${id}`)}
                        onCancel={handleCancelOrder}
                        isExpanded={expandedOrderId === order._id}
                        onToggleExpand={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                      />
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Orders;