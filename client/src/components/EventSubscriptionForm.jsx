import React, { useState } from "react";
import axios from "axios";

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

    if (!email) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }

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
        }
      );

      setMessage(response.data.message);
      setMessageType("success");
      setEmail("");
      setPreferredActivities(["all"]);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to subscribe. Please try again."
      );
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Your Email Address"
          className="w-full h-[45px] pl-[20px] bg-[#ECEAEA]/50 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#8DC53E] transition-colors"
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          {activities.map((activity) => (
            <label
              key={activity.value}
              className="flex items-center text-sm cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferredActivities.includes(activity.value)}
                  onChange={() => handleActivityChange(activity.value)}
                  className="sr-only"
                  disabled={loading}
                />
                <div
                  className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all ${
                    preferredActivities.includes(activity.value)
                      ? "bg-[#8DC53E] border-[#8DC53E]"
                      : "bg-white border-gray-300 hover:border-[#8DC53E]"
                  }`}
                >
                  {preferredActivities.includes(activity.value) && (
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
                  )}
                </div>
              </div>
              <span className="text-gray-700">{activity.label}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-[#8DC53E] text-white font-semibold hover:bg-[#7AB32E] transition-colors duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{
            height: "45px",
            width: "163px",
            borderRadius: "5px",
            borderBottomRightRadius: "25px",
            boxShadow: "none",
            border: "none",
            fontSize: "16px",
            color: "white",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Subscribing..." : "Subscribe Now"}
        </button>
      </form>

      {message && (
        <div
          className={`text-sm font-medium ${
            messageType === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      <p className="text-[12px] text-[#797979] font-bold">
        Get notified about new outdoor events & adventures
      </p>
    </div>
  );
};

export default EventSubscriptionForm;
