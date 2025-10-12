// pages/Events.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "hiking", label: "Hiking" },
    { value: "camping", label: "Camping" },
    { value: "climbing", label: "Climbing" },
    { value: "fishing", label: "Fishing" },
    { value: "hunting", label: "Hunting" },
    { value: "workshop", label: "Workshop" },
    { value: "other", label: "Other" },
  ];

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, selectedDifficulty, searchTerm]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events?upcoming=true`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(
        (event) => event.difficulty === selectedDifficulty
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      hiking: "🥾",
      camping: "⛺",
      climbing: "🧗",
      fishing: "🎣",
      hunting: "🏹",
      workshop: "🔧",
      other: "🌲",
    };
    return icons[category] || "🌲";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC53E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-800 to-[#8DC53E] text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Outdoor Events & Adventures
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Join our community of outdoor enthusiasts for thrilling
              adventures, skill-building workshops, and unforgettable
              experiences in nature.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="font-semibold">🏔️ Mountain Expeditions</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="font-semibold">🎯 Skills Workshops</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="font-semibold">🌟 Community Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search events or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Events */}
            {filteredEvents.filter((event) => event.featured).length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Featured Events
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredEvents
                    .filter((event) => event.featured)
                    .slice(0, 2)
                    .map((event) => (
                      <div
                        key={event._id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      >
                        <div className="relative h-64">
                          <img
                            src={`${API_URL.replace("/api", "")}${
                              event.imageUrl
                            }`}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-[#8DC53E] text-white px-3 py-1 rounded-full text-sm font-semibold">
                              ⭐ Featured
                            </span>
                          </div>
                          <div className="absolute top-4 right-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(
                                event.difficulty
                              )}`}
                            >
                              {event.difficulty.charAt(0).toUpperCase() +
                                event.difficulty.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">
                              {getCategoryIcon(event.category)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {event.category.charAt(0).toUpperCase() +
                                event.category.slice(1)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {event.shortDescription}
                          </p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {formatDate(event.date)} at {event.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {event.location}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl font-bold text-[#8DC53E]">
                                {event.price === 0
                                  ? "Free"
                                  : `Rs. ${event.price}`}
                              </span>
                              {event.maxParticipants && (
                                <span className="text-sm text-gray-500">
                                  {event.currentParticipants}/
                                  {event.maxParticipants} spots
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => navigate(`/events/${event._id}`)}
                              className="bg-[#8DC53E] hover:bg-[#7AB32E] text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* All Events */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-48">
                      <img
                        src={`${API_URL.replace("/api", "")}${event.imageUrl}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                            event.difficulty
                          )}`}
                        >
                          {event.difficulty.charAt(0).toUpperCase() +
                            event.difficulty.slice(1)}
                        </span>
                      </div>
                      {event.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#8DC53E] text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">
                          {getCategoryIcon(event.category)}
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {event.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {event.shortDescription}
                      </p>

                      <div className="space-y-1 mb-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {new Date(event.date).toLocaleDateString()} at{" "}
                          {event.time}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {event.location}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#8DC53E]">
                          {event.price === 0 ? "Free" : `Rs. ${event.price}`}
                        </span>
                        <button
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-semibold transition-colors duration-200"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
