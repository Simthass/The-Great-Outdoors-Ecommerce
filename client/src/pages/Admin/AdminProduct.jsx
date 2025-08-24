import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    productName: "",
    description: "",
    price: "",
    weight: "",
    dimensions: "",
    brand: "",
    color: "",
    size: "",
    images: null,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    initializeCategories();
  }, []);

  const initializeCategories = async () => {
    try {
      await axios.post(`${API_URL}/categories/init-default`);
    } catch (error) {
      console.log("Categories already initialized or error occurred");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "checkbox") {
      // For the exclusive checkboxes
      if (name === "isFeatured" && checked) {
        setFormData((prev) => ({
          ...prev,
          isFeatured: true,
          isHotThisWeek: false,
        }));
      } else if (name === "isHotThisWeek" && checked) {
        setFormData((prev) => ({
          ...prev,
          isHotThisWeek: true,
          isFeatured: false,
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    }
    if (name === "images") {
      // Handle multiple file uploads
      if (files && files.length > 0) {
        const newImagePreviews = [];
        const fileArray = Array.from(files);

        fileArray.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newImagePreviews.push(reader.result);
            if (newImagePreviews.length === fileArray.length) {
              setImagePreviews([...imagePreviews, ...newImagePreviews]);
            }
          };
          reader.readAsDataURL(file);
        });

        setFormData((prev) => ({ ...prev, images: fileArray }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      // Remove from existing images
      const updatedExisting = [...existingImages];
      updatedExisting.splice(index, 1);
      setExistingImages(updatedExisting);
    } else {
      // Remove from new image previews
      const updatedPreviews = [...imagePreviews];
      updatedPreviews.splice(index, 1);
      setImagePreviews(updatedPreviews);

      // Remove from form data if not yet uploaded
      if (formData.images) {
        const updatedFiles = Array.from(formData.images);
        updatedFiles.splice(index, 1);
        setFormData((prev) => ({ ...prev, images: updatedFiles }));
      }
    }
  };
  const validateForm = () => {
    if (!formData.category) {
      setError("Please select a category");
      return false;
    }
    if (!formData.productName.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.brand.trim()) {
      setError("Brand is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();

      // Append all form fields including checkboxes
      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          // Handle multiple image files
          if (formData[key]) {
            Array.from(formData[key]).forEach((file, index) => {
              submitData.append(`images`, file);
            });
          }
        } else if (key === "isFeatured" || key === "isHotThisWeek") {
          // Explicitly append checkbox values as strings
          submitData.append(key, formData[key] ? "true" : "false");
        } else if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      // Append existing images if editing
      if (editingProduct && existingImages.length > 0) {
        submitData.append("existingImages", JSON.stringify(existingImages));
      }

      let response;
      if (editingProduct) {
        response = await axios.put(
          `${API_URL}/products/${editingProduct._id}`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setSuccess("Product updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/products`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Product added successfully!");
      }

      console.log("Product saved:", response.data);
      await fetchProducts();
      resetForm();
      setIsModalOpen(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving product:", error);
      setError(
        error.response?.data?.message ||
          "Error saving product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      category: product.category._id,
      productName: product.productName,
      description: product.description,
      price: product.price,
      weight: product.weight || "",
      dimensions: product.dimensions || "",
      brand: product.brand,
      color: product.color || "",
      size: product.size || "",
      images: null,
      isFeatured: product.isFeatured || false,
      isHotThisWeek: product.isHotThisWeek || false,
    });

    // Set existing images and previews
    if (product.images && product.images.length > 0) {
      setExistingImages(product.images);
      setImagePreviews(product.images.map((img) => `${BASE_URL}${img}`));
    } else if (product.imageUrl) {
      // For backward compatibility with single image
      setExistingImages([product.imageUrl]);
      setImagePreviews([`${BASE_URL}${product.imageUrl}`]);
    } else {
      setExistingImages([]);
      setImagePreviews([]);
    }

    setIsModalOpen(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        await fetchProducts();
        setSuccess("Product deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("Error deleting product. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      productName: "",
      description: "",
      price: "",
      weight: "",
      dimensions: "",
      brand: "",
      color: "",
      size: "",
      images: null,
      isFeatured: false,
      isHotThisWeek: false,
    });
    setEditingProduct(null);
    setImagePreviews([]);
    setExistingImages([]);
    setError("");

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || product.category._id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Add these functions to handle drag-and-drop
  const handleDragStart = (e, index, isExisting) => {
    setDraggedItem({ index, isExisting });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
  };

  const handleDragOver = (e, index, isExisting) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex, isExisting) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedItem) return;

    if (draggedItem.isExisting && isExisting) {
      // Reorder existing images
      const updatedExisting = [...existingImages];
      const [removed] = updatedExisting.splice(draggedItem.index, 1);
      updatedExisting.splice(targetIndex, 0, removed);
      setExistingImages(updatedExisting);
    } else if (!draggedItem.isExisting && !isExisting) {
      // Reorder new image previews
      const updatedPreviews = [...imagePreviews];
      const [removed] = updatedPreviews.splice(draggedItem.index, 1);
      updatedPreviews.splice(targetIndex, 0, removed);
      setImagePreviews(updatedPreviews);

      // Also reorder the files in formData if not yet uploaded
      if (formData.images) {
        const updatedFiles = Array.from(formData.images);
        const [removedFile] = updatedFiles.splice(draggedItem.index, 1);
        updatedFiles.splice(targetIndex, 0, removedFile);
        setFormData((prev) => ({ ...prev, images: updatedFiles }));
      }
    }

    setDraggedItem(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your outdoor sports equipment inventory
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#8DC53E] hover:bg-[#76A337] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            + Add New Product
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}
        {error && !isModalOpen && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name, brand, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={`${BASE_URL}${product.imageUrl}`}
                      alt={product.productName}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="h-full w-full flex items-center justify-center text-gray-400"
                    style={{ display: product.imageUrl ? "none" : "flex" }}
                  >
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {product.category.categoryName}
                    </span>
                    {product.isHotThisWeek && (
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        Hot This Week
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2 hover:text-green-600 transition-colors">
                    {product.productName}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-green-600 font-bold text-xl">
                      Rs. {parseFloat(product.price).toLocaleString()}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1 mt-2">
                      <p>
                        <span className="font-medium">Brand:</span>{" "}
                        {product.brand}
                      </p>
                      {product.weight && (
                        <p>
                          <span className="font-medium">Weight:</span>{" "}
                          {product.weight}kg
                        </p>
                      )}
                      {product.color && (
                        <p>
                          <span className="font-medium">Color:</span>{" "}
                          {product.color}
                        </p>
                      )}
                      {product.size && (
                        <p>
                          <span className="font-medium">Size:</span>{" "}
                          {product.size}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm || selectedCategory
                ? "No products match your filters"
                : "No products found"}
            </h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || selectedCategory
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first product to the inventory."}
            </p>
            {!searchTerm && !selectedCategory && (
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="mt-6 bg-[#8DC53E] hover:bg-[#76A337] text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-light"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Basic Information
                    </h3>

                    {/* Product Flags Section */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                      <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Product Highlights
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Featured Product */}
                        <div className="relative">
                          <label className="flex items-center cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id="isFeatured"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                                className="sr-only"
                              />
                              <div
                                className={`w-6 h-6 rounded-md border-2 transition-all duration-200 ${
                                  formData.isFeatured
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500"
                                    : "border-gray-300 group-hover:border-purple-400"
                                }`}
                              >
                                {formData.isFeatured && (
                                  <svg
                                    className="w-4 h-4 text-white absolute top-0.5 left-0.5"
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
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1.5 text-purple-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Featured Product
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Highlight this product on homepage
                              </p>
                            </div>
                          </label>
                          {formData.isFeatured && (
                            <div className="absolute -top-1 -right-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Featured
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Hot This Week */}
                        <div className="relative">
                          <label className="flex items-center cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                id="isHotThisWeek"
                                name="isHotThisWeek"
                                checked={formData.isHotThisWeek}
                                onChange={handleInputChange}
                                className="sr-only"
                              />
                              <div
                                className={`w-6 h-6 rounded-md border-2 transition-all duration-200 ${
                                  formData.isHotThisWeek
                                    ? "bg-gradient-to-r from-red-500 to-orange-500 border-red-500"
                                    : "border-gray-300 group-hover:border-red-400"
                                }`}
                              >
                                {formData.isHotThisWeek && (
                                  <svg
                                    className="w-4 h-4 text-white absolute top-0.5 left-0.5"
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
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1.5 text-red-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Hot This Week
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Mark as trending product
                              </p>
                            </div>
                          </label>
                          {formData.isHotThisWeek && (
                            <div className="absolute -top-1 -right-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                Hot 🔥
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Feedback Bar */}
                      {(formData.isFeatured || formData.isHotThisWeek) && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 text-blue-500 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="text-sm text-blue-700">
                              <span className="font-medium">
                                Product visibility enhanced!
                              </span>
                              <div className="text-xs text-blue-600 mt-1">
                                {formData.isFeatured && formData.isHotThisWeek
                                  ? "This product will appear in both Featured and Hot sections"
                                  : formData.isFeatured
                                  ? "This product will be highlighted in the Featured section"
                                  : "This product will appear in the Hot This Week section"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category and Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter brand name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter product name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        placeholder="Enter detailed product description"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  {/* Pricing & Specifications */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Pricing & Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (Rs.) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          placeholder="e.g., 10x5x2 cm"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          placeholder="Enter color"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size
                        </label>
                        <input
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          placeholder="Enter size"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Product Images Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Product Images
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Images (Max 5)
                      </label>
                      <input
                        type="file"
                        name="images"
                        onChange={handleInputChange}
                        accept="image/*"
                        multiple
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Accepted formats: JPG, PNG, GIF, WEBP (Max size: 5MB per
                        file)
                      </p>

                      {/* Image Previews */}
                      {(imagePreviews.length > 0 ||
                        existingImages.length > 0) && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Images:
                          </p>
                          <div className="flex flex-wrap gap-4">
                            {/* Existing images */}
                            {existingImages.map((img, index) => (
                              <div
                                key={`existing-${index}`}
                                className="relative"
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, index, true)
                                }
                                onDragOver={(e) =>
                                  handleDragOver(e, index, true)
                                }
                                onDrop={(e) => handleDrop(e, index, true)}
                                style={{
                                  opacity:
                                    isDragging &&
                                    draggedItem?.index === index &&
                                    draggedItem?.isExisting
                                      ? 0.5
                                      : 1,
                                  cursor: "move",
                                  transition: "opacity 0.2s",
                                }}
                              >
                                <img
                                  src={`${BASE_URL}${img}`}
                                  alt={`Preview ${index + 1}`}
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index, true)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}

                            {/* New image previews */}
                            {imagePreviews
                              .slice(existingImages.length)
                              .map((preview, index) => {
                                const actualIndex =
                                  existingImages.length + index;
                                return (
                                  <div
                                    key={`new-${actualIndex}`}
                                    className="relative"
                                    draggable
                                    onDragStart={(e) =>
                                      handleDragStart(e, actualIndex, false)
                                    }
                                    onDragOver={(e) =>
                                      handleDragOver(e, actualIndex, false)
                                    }
                                    onDrop={(e) =>
                                      handleDrop(e, actualIndex, false)
                                    }
                                    style={{
                                      opacity:
                                        isDragging &&
                                        draggedItem?.index === actualIndex &&
                                        !draggedItem?.isExisting
                                          ? 0.5
                                          : 1,
                                      cursor: "move",
                                      transition: "opacity 0.2s",
                                    }}
                                  >
                                    <img
                                      src={preview}
                                      alt={`Preview ${actualIndex + 1}`}
                                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveImage(actualIndex)
                                      }
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-[#8DC53E] hover:bg-[#76A337] text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {editingProduct ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {editingProduct ? "Update Product" : "Add Product"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProduct;
