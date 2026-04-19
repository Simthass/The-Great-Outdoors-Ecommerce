import React, { useState } from "react";
import axios from "axios";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

const EventSubscriptionForm = () => {
  const [email, setEmail] = useState("");
  const [preferredActivities, setPreferredActivities] = useState(["all"]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const activities = [
    { value: "all", label: "All Events" },
    { value: "hiking", label: "Hiking" },
    { value: "camping", label: "Camping" },
    { value: "climbing", label: "Climbing" },
    { value: "fishing", label: "Fishing" },
    { value: "hunting", label: "Hunting" },
    { value: "workshop", label: "Workshops" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/event-notifications/subscribe`,
        {
          email,
          preferredActivities: preferredActivities.length
            ? preferredActivities
            : ["all"],
        },
      );
      setMessage(response.data.message);
      setMessageType("success");
      setEmail("");
      setPreferredActivities(["all"]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to subscribe.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleActivityChange = (activityValue) => {
    if (activityValue === "all") {
      setPreferredActivities(["all"]);
    } else {
      setPreferredActivities((prev) => {
        const filtered = prev.filter((item) => item !== "all");
        if (filtered.includes(activityValue)) {
          return filtered.filter((item) => item !== activityValue);
        } else {
          return [...filtered, activityValue];
        }
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Modern Curved Input */}
        <div className="relative flex items-center w-full bg-gray-50 rounded-full border border-gray-200 focus-within:border-[#8DC53E] focus-within:ring-4 focus-within:ring-[#8DC53E]/20 transition-all duration-300 p-1.5 shadow-sm">
          <div className="pl-4 pr-2 text-gray-400">
            <Mail size={20} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm py-3"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-gray-900 text-white font-bold px-8 py-3 rounded-full hover:bg-[#8DC53E] transition-all duration-300 h-full ${loading ? "opacity-70 cursor-wait" : ""}`}
          >
            {loading ? "Joining..." : "Subscribe"}
          </button>
        </div>

        {/* Activity Pills */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Tailor your experience
          </p>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => {
              const isSelected = preferredActivities.includes(activity.value);
              return (
                <button
                  key={activity.value}
                  type="button"
                  onClick={() => handleActivityChange(activity.value)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border ${
                    isSelected
                      ? "bg-[#8DC53E]/10 border-[#8DC53E] text-[#7ab535]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {activity.label}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm font-bold p-4 rounded-2xl ${messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {messageType === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message}
        </div>
      )}
    </div>
  );
};

export default EventSubscriptionForm;
