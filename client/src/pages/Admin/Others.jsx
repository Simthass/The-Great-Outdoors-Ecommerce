import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminOthers = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
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
    image: null,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url, response;

      if (formData.image) {
        // Use multipart endpoints for image uploads
        url = editingProduct
          ? `${API_URL}/products/${editingProduct._id}`
          : `${API_URL}/products`;

        const submitData = new FormData();
        submitData.append("category", formData.category);
        submitData.append("productName", formData.productName);
        submitData.append("description", formData.description);
        submitData.append("price", formData.price);
        submitData.append("brand", formData.brand);

        if (formData.weight && formData.weight.trim() !== "") {
          submitData.append("weight", formData.weight);
        }
        if (formData.dimensions && formData.dimensions.trim() !== "") {
          submitData.append("dimensions", formData.dimensions);
        }
        if (formData.color && formData.color.trim() !== "") {
          submitData.append("color", formData.color);
        }
        if (formData.size && formData.size.trim() !== "") {
          submitData.append("size", formData.size);
        }

        submitData.append("image", formData.image);

        const method = editingProduct ? "put" : "post";
        response = await axios[method](url, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        });
      } else {
        // Use JSON endpoints for no image
        url = editingProduct
          ? `${API_URL}/products/json/${editingProduct._id}`
          : `${API_URL}/products/json`;

        const jsonData = {
          category: formData.category,
          productName: formData.productName,
          description: formData.description,
          price: formData.price,
          brand: formData.brand,
        };

        if (formData.weight && formData.weight.trim() !== "") {
          jsonData.weight = formData.weight;
        }
        if (formData.dimensions && formData.dimensions.trim() !== "") {
          jsonData.dimensions = formData.dimensions;
        }
        if (formData.color && formData.color.trim() !== "") {
          jsonData.color = formData.color;
        }
        if (formData.size && formData.size.trim() !== "") {
          jsonData.size = formData.size;
        }

        const method = editingProduct ? "put" : "post";
        response = await axios[method](url, jsonData, {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        });
      }

      console.log("Product saved:", response.data);
      await fetchProducts();
      resetForm();
      setIsModalOpen(false);
      alert(`Product ${editingProduct ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;

      alert(`Error saving product: ${errorMessage}`);
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
      image: null,
    });

    // Set current image as preview
    if (product.imageUrl) {
      setImagePreview(`${BASE_URL}${product.imageUrl}`);
    } else {
      setImagePreview(null);
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        await fetchProducts();
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
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
      image: null,
    });
    setEditingProduct(null);
    setImagePreview(null);

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-[#8DC53E] hover:bg-[#76A337] text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add New Product
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={`${BASE_URL}${product.imageUrl}`}
                    alt={product.productName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error(
                        "Image failed to load:",
                        `${BASE_URL}${product.imageUrl}`
                      );
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "block";
                    }}
                  />
                ) : null}
                {!product.imageUrl && (
                  <span className="text-gray-400">No Image</span>
                )}
                <span className="text-gray-400 hidden">Image not found</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {product.productName}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-green-600 font-bold mb-2">
                  Rs. {product.price}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Brand: {product.brand}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleInputChange}
                        placeholder="e.g., 10x5x2 cm"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading
                        ? "Saving..."
                        : editingProduct
                        ? "Update"
                        : "Add"}{" "}
                      Product
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

export default AdminOthers;
