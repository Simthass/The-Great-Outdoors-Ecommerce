// components/admin/BannerManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const OthersManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("banners", file);
    });

    try {
      await axios.post(`${API_URL}/banners/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedFiles([]);
      setPreviewUrls([]);
      fetchBanners();
      alert("Banners uploaded successfully!");
    } catch (error) {
      console.error("Error uploading banners:", error);
      alert("Failed to upload banners");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      await axios.delete(`${API_URL}/banners/${bannerId}`);
      fetchBanners();
      alert("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner");
    }
  };

  const handleToggleActive = async (bannerId) => {
    try {
      await axios.put(`${API_URL}/banners/${bannerId}/toggle`);
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner status:", error);
      alert("Failed to update banner status");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanners(items);

    try {
      await axios.put(`${API_URL}/banners/reorder`, { banners: items });
    } catch (error) {
      console.error("Error reordering banners:", error);
      fetchBanners(); // Revert on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Banner Management
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Banners</h2>

          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Preview Section */}
          {previewUrls.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Preview:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className={`px-6 py-2 rounded-lg font-semibold ${
              uploading || selectedFiles.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            {uploading ? "Uploading..." : "Upload Banners"}
          </button>
        </div>

        {/* Existing Banners */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Banners</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading banners...</div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="banners">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {banners.map((banner, index) => (
                      <Draggable
                        key={banner._id}
                        draggableId={banner._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center p-4 mb-4 bg-gray-50 rounded-lg border ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mr-4 cursor-grab"
                            >
                              <div className="w-6 h-6 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                </svg>
                              </div>
                            </div>

                            <img
                              src={`${API_URL.replace("/api", "")}${
                                banner.imageUrl
                              }`}
                              alt={`Banner ${index + 1}`}
                              className="w-20 h-12 object-cover rounded mr-4"
                            />

                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                Banner {index + 1}
                              </div>
                              <div className="text-xs text-gray-500">
                                Order: {banner.order}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleActive(banner._id)}
                                className={`px-3 py-1 rounded text-xs font-semibold ${
                                  banner.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {banner.isActive ? "Active" : "Inactive"}
                              </button>

                              <button
                                onClick={() => handleDelete(banner._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default OthersManagement;
