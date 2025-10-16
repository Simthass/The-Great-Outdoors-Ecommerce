// pages/admin/EventManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    date: "",
    endDate: "",
    time: "",
    location: "",
    price: 0,
    maxParticipants: "",
    category: "hiking",
    difficulty: "beginner",
    featured: false,
    registrationDeadline: "",
    requirements: [],
    includes: [],
    organizer: {
      name: "",
      contact: "",
      email: "",
    },
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [currentSidebarPage, setSidebarPage] = useState("events");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  const categories = [
    "hiking",
    "camping",
    "climbing",
    "fishing",
    "hunting",
    "workshop",
    "other",
  ];
  const difficulties = ["beginner", "intermediate", "advanced"];

  useEffect(() => {
    fetchUserProfile();
    fetchEvents();
  }, []);

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
      if (data.success) setUserProfile(data.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const handleNavClick = (key) => {
    setSidebarPage(key);
    const routes = {
      dashboard: "/AdminDashboard",
      users: "/Admin/User",
      products: "/Admin/AdminProduct",
      orders: "/Admin/OrderManagement",
      inventory: "/Admin/Inventory",
      reviews: "/Admin/ReviewList",
      coupons: "/Admin/AdminCoupons",
      events: "/Admin/EventManagement",
      content: "/Admin/ContentManagement",
      reports: "/Admin/ReportGeneration/productReport",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage && !editingEvent) {
      alert("Please select an image");
      return;
    }

    const submitFormData = new FormData();

    // Add all form fields
    Object.keys(formData).forEach((key) => {
      if (key === "requirements" || key === "includes") {
        submitFormData.append(
          key,
          JSON.stringify(formData[key].filter((item) => item.trim() !== ""))
        );
      } else if (key === "organizer") {
        submitFormData.append(key, JSON.stringify(formData[key]));
      } else {
        submitFormData.append(key, formData[key]);
      }
    });

    if (selectedImage) {
      submitFormData.append("image", selectedImage);
    }

    try {
      if (editingEvent) {
        await axios.put(
          `${API_URL}/events/${editingEvent._id}`,
          submitFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        alert("Event updated successfully!");
      } else {
        await axios.post(`${API_URL}/events`, submitFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Event created successfully!");
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription,
      date: new Date(event.date).toISOString().split("T")[0],
      endDate: event.endDate
        ? new Date(event.endDate).toISOString().split("T")[0]
        : "",
      time: event.time,
      location: event.location,
      price: event.price,
      maxParticipants: event.maxParticipants || "",
      category: event.category,
      difficulty: event.difficulty,
      featured: event.featured,
      registrationDeadline: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString().split("T")[0]
        : "",
      requirements: event.requirements || [],
      includes: event.includes || [],
      organizer: event.organizer || { name: "", contact: "", email: "" },
    });
    setImagePreview(`${API_URL.replace("/api", "")}${event.imageUrl}`);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`${API_URL}/events/${eventId}`);
      fetchEvents();
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      date: "",
      endDate: "",
      time: "",
      location: "",
      price: 0,
      maxParticipants: "",
      category: "hiking",
      difficulty: "beginner",
      featured: false,
      registrationDeadline: "",
      requirements: [],
      includes: [],
      organizer: {
        name: "",
        contact: "",
        email: "",
      },
    });
    setSelectedImage(null);
    setImagePreview("");
    setEditingEvent(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavClick}
          userProfile={userProfile}
        />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentSidebarPage}
        onPageChange={handleNavClick}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Event Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and manage outdoor events and activities
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-[#8DC53E] hover:bg-[#7AB32E] text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                {showForm ? "Cancel" : "+ Add New Event"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Event Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description * (Max 150 characters)
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    maxLength="150"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.shortDescription.length}/150 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Location and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level *
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    >
                      {difficulties.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Deadline
                    </label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Featured Event Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#8DC53E] focus:ring-[#8DC53E] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Mark as Featured Event
                  </label>
                </div>

                {/* Event Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8DC53E] file:text-white hover:file:bg-[#7AB32E]"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) =>
                          handleArrayChange(
                            "requirements",
                            index,
                            e.target.value
                          )
                        }
                        placeholder="Enter requirement"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("requirements", index)}
                        className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("requirements")}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Add Requirement
                  </button>
                </div>

                {/* What's Included */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's Included
                  </label>
                  {formData.includes.map((item, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          handleArrayChange("includes", index, e.target.value)
                        }
                        placeholder="What's included"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("includes", index)}
                        className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("includes")}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Add Item
                  </button>
                </div>

                {/* Organizer Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Organizer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organizer Name
                      </label>
                      <input
                        type="text"
                        name="organizer.name"
                        value={formData.organizer.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="organizer.contact"
                        value={formData.organizer.contact}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="organizer.email"
                        value={formData.organizer.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8DC53E] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#8DC53E] hover:bg-[#7AB32E] text-white rounded-lg font-semibold transition-colors"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Current Events
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading events...</div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  No events found. Create your first event!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={`${API_URL.replace("/api", "")}${event.imageUrl}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {event.featured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-[#8DC53E] text-white px-2 py-1 rounded text-xs font-semibold">
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          {event.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {event.category}
                        </span>
                        <span className="text-sm font-semibold text-[#8DC53E]">
                          {event.price === 0 ? "Free" : `Rs. ${event.price}`}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h4>

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
                          {formatDate(event.date)} at {event.time}
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
                        {event.maxParticipants && (
                          <div className="flex items-center text-xs text-gray-500">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                            {event.currentParticipants}/{event.maxParticipants}{" "}
                            participants
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;
