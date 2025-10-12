// pages/EventDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API_URL}/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/events/${id}/register`);
      alert("Successfully registered for the event!");
      fetchEvent(); // Refresh event data
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Failed to register for event");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DC53E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <button
            onClick={() => navigate("/events")}
            className="bg-[#8DC53E] hover:bg-[#7AB32E] text-white px-6 py-2 rounded-lg"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96">
        <img
          src={`${API_URL.replace("/api", "")}${event.imageUrl}`}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-8 left-8 right-8">
          <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-4">
            <span className="bg-[#8DC53E] text-white px-4 py-2 rounded-lg font-semibold">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
              {event.difficulty.charAt(0).toUpperCase() +
                event.difficulty.slice(1)}
            </span>
            {event.featured && (
              <span className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                ⭐ Featured
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                {event.description}
              </p>

              {event.requirements && event.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {event.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#8DC53E] mr-2">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.includes && event.includes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {event.includes.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#8DC53E] mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-8 sticky top-8">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#8DC53E] mb-2">
                  {event.price === 0 ? "Free" : `Rs. ${event.price}`}
                </div>
                <p className="text-gray-600">Per person</p>
              </div>

              {/* Event Info */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                    {event.endDate && (
                      <p className="text-sm text-gray-600">
                        Ends: {new Date(event.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>

                {event.maxParticipants && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-sm text-gray-600">
                        {event.currentParticipants}/{event.maxParticipants}{" "}
                        registered
                      </p>
                    </div>
                  </div>
                )}

                {event.registrationDeadline && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Registration Deadline</p>
                      <p className="text-sm text-gray-600">
                        {new Date(
                          event.registrationDeadline
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Button */}
              <div className="mb-6">
                {event.maxParticipants &&
                event.currentParticipants >= event.maxParticipants ? (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Event Full
                  </button>
                ) : event.registrationDeadline &&
                  new Date(event.registrationDeadline) < new Date() ? (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="w-full bg-[#8DC53E] hover:bg-[#7AB32E] text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Register Now
                  </button>
                )}
              </div>

              {/* Organizer Info */}
              {event.organizer && event.organizer.name && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Organizer</h3>
                  <div className="space-y-2">
                    <p className="font-medium">{event.organizer.name}</p>
                    {event.organizer.contact && (
                      <p className="text-sm text-gray-600">
                        📞 {event.organizer.contact}
                      </p>
                    )}
                    {event.organizer.email && (
                      <p className="text-sm text-gray-600">
                        ✉️ {event.organizer.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/events")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
