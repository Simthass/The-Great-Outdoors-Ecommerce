import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  Phone,
  AlertCircle,
  User,
  FileText,
  DollarSign,
  ChevronRight,
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
    Pending: { icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-200" },
    Processing: { icon: Package, color: "bg-blue-100 text-blue-700 border-blue-200" },
    Shipped: { icon: Truck, color: "bg-purple-100 text-purple-700 border-purple-200" },
    Delivered: { icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-200" },
    Cancelled: { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200" },
  };
  const { icon: Icon, color } = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${color}`}>
      <Icon size={14} />
      {status}
    </span>
  );
};

// ── Info Card Component ──────────────────────────────────────────────────────
const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
    <div className="px-5 py-4 border-b border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <Icon size={18} className="text-[#8DC53E]" />
        {title}
      </h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Order Item Component ─────────────────────────────────────────────────────
const OrderItem = ({ item, index }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  
  return (
    <FadeIn delay={index * 0.05}>
      <div className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-all duration-300">
        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
          <img
            src={item.image ? `${BASE_URL}${item.image}` : "/products/placeholder.jpg"}
            alt={item.productName}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "/products/placeholder.jpg"; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm mb-1">{item.productName}</h4>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <Package size={12} /> Qty: {item.quantity}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={12} /> Rs.{item.price.toLocaleString()} each
            </span>
          </div>
          {item.sku && (
            <p className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#8DC53E]">Rs.{item.total.toLocaleString()}</p>
        </div>
      </div>
    </FadeIn>
  );
};

// ── Main Order Details Page ──────────────────────────────────────────────────
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  ScrollToTop();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrderDetails();
  }, [id, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/orders/${order._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      fetchOrderDetails();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const PX = "px-6 lg:px-[75px]";
  const SECTION_PY = "py-16 lg:py-20";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#8DC53E]/20 border-t-[#8DC53E] rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative bg-gray-900 overflow-hidden">
          <div className={`relative ${SECTION_PY} ${PX}`}>
            <FadeIn>
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-8 h-px bg-[#8DC53E]" />
                  Error
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
                  Order Not
                  <br />
                  <span className="text-[#8DC53E]">Found</span>
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                  {error || "The order you're looking for doesn't exist or has been removed."}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <div className={`${SECTION_PY} bg-white ${PX}`}>
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-500 text-sm mb-8">
              We couldn't find the order you're looking for.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
            >
              Back to Orders <ArrowLeft size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const grandTotal = order.totalAmount + order.shippingCost - order.discount;
  const canCancel = order.orderStatus === "Pending";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/OrderDetails-hero.jpg"
            alt="Order Details background"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div className={`relative ${SECTION_PY} ${PX}`}>
          <FadeIn>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[#8DC53E] text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-[#8DC53E]" />
                Order Details
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                  Order #{order.orderId}
                </h1>
                <button
                  onClick={copyOrderId}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Copy Order ID"
                >
                  <Copy size={16} className="text-white/70" />
                </button>
                {copySuccess && (
                  <span className="text-xs text-green-400 font-medium">Copied!</span>
                )}
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-xl mt-2">
                View complete details of your order including items, shipping, and tracking.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main Content */}
      <section className={`${SECTION_PY} bg-white`}>
        <div className={PX}>
          {/* Back Button */}
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#8DC53E] text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Orders
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1">
              <FadeIn delay={0.05}>
                <div className="bg-gray-50 rounded-xl p-5 sticky top-6">
                  {/* Status */}
                  <div className="text-center pb-5 border-b border-gray-200">
                    <div className="w-16 h-16 bg-[#8DC53E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package size={28} className="text-[#8DC53E]" />
                    </div>
                    <StatusBadge status={order.orderStatus} />
                    <p className="text-xs text-gray-500 mt-2">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-LK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="pt-5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <DollarSign size={14} /> Order Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900">Rs.{order.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-medium text-gray-900">
                          {order.shippingCost === 0 ? "Free" : `Rs.${order.shippingCost.toLocaleString()}`}
                        </span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-Rs.{order.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-[#8DC53E] text-lg">Rs.{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="pt-5 mt-5 border-t border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CreditCard size={14} /> Payment
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method</span>
                        <span className="font-medium text-gray-900">{order.paymentMethod || "Credit Card"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className={`font-medium ${
                          order.paymentStatus === "Paid" ? "text-green-600" : "text-amber-600"
                        }`}>
                          {order.paymentStatus || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canCancel && (
                    <div className="pt-5 mt-5 border-t border-gray-200">
                      <button
                        onClick={handleCancelOrder}
                        disabled={cancelling}
                        className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wide hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        {cancelling ? "Cancelling..." : "Cancel Order"}
                      </button>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <FadeIn delay={0.1}>
                <InfoCard title="Items Ordered" icon={Package}>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <OrderItem key={idx} item={item} index={idx} />
                    ))}
                  </div>
                </InfoCard>
              </FadeIn>

              {/* Shipping Address & Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FadeIn delay={0.15}>
                  <InfoCard title="Shipping Address" icon={MapPin}>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-gray-900">{order.shippingAddress?.addressLine1}</p>
                      {order.shippingAddress?.addressLine2 && (
                        <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>
                      )}
                      <p className="text-gray-600">
                        {order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}
                      </p>
                      <p className="text-gray-600 font-medium">{order.shippingAddress?.country}</p>
                      {order.shippingAddress?.phoneNumber && (
                        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-100">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-gray-600 text-sm">{order.shippingAddress.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </InfoCard>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <InfoCard title="Delivery Details" icon={Truck}>
                    {order.trackingNumber ? (
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                          <p className="text-sm font-mono font-medium text-gray-900">{order.trackingNumber}</p>
                        </div>
                        {order.carrier && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Carrier</p>
                            <p className="text-sm font-medium text-gray-900">{order.carrier}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Truck size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Shipping details will be updated soon</p>
                      </div>
                    )}
                    
                    {order.estimatedDelivery && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-[#8DC53E]" />
                          <span className="text-gray-500">Estimated Delivery:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(order.estimatedDelivery).toLocaleDateString("en-LK", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </InfoCard>
                </FadeIn>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <FadeIn delay={0.25}>
                  <InfoCard title="Special Instructions" icon={AlertCircle}>
                    <p className="text-gray-600 text-sm leading-relaxed">{order.notes}</p>
                  </InfoCard>
                </FadeIn>
              )}

              {/* Continue Shopping */}
              <FadeIn delay={0.3}>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Need something else?</h3>
                  <p className="text-gray-500 text-sm mb-4">Continue shopping for more outdoor gear and adventures.</p>
                  <button
                    onClick={() => navigate("/shop")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#8DC53E] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#7ab535] transition-all"
                  >
                    Continue Shopping <ChevronRight size={14} />
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderDetails;