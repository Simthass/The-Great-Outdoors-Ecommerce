import React, { useState, useEffect } from "react";
import axios from "axios";

const InventoryLink = ({ product, onLinkUpdate }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(
    product.inventory || ""
  );
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventoryItems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    }
  };

  const handleLinkInventory = async () => {
    if (!selectedInventory) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/inventory/${selectedInventory}/link-product`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onLinkUpdate) onLinkUpdate();
      alert("Product linked to inventory successfully!");
    } catch (error) {
      console.error("Error linking inventory:", error);
      alert("Failed to link product to inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/products/${product._id}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedInventory("");
      if (onLinkUpdate) onLinkUpdate();
      alert("Inventory link removed successfully!");
    } catch (error) {
      console.error("Error unlinking inventory:", error);
      alert("Failed to remove inventory link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Inventory Link
      </h3>

      {product.inventory ? (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Linked to: {product.inventory.name} (Qty:{" "}
            {product.inventory.quantity})
          </p>
          <p className="text-sm font-medium mb-2">
            Status:{" "}
            <span
              className={
                product.stockStatus === "out_of_stock"
                  ? "text-red-600"
                  : product.stockStatus === "low_stock"
                  ? "text-amber-600"
                  : "text-green-600"
              }
            >
              {product.stockStatus === "out_of_stock"
                ? "Out of Stock"
                : product.stockStatus === "low_stock"
                ? "Low Stock"
                : "In Stock"}
            </span>
          </p>
          <button
            onClick={handleUnlinkInventory}
            disabled={loading}
            className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm font-medium hover:bg-red-200 disabled:opacity-70"
          >
            {loading ? "Processing..." : "Unlink Inventory"}
          </button>
        </div>
      ) : (
        <div>
          <select
            value={selectedInventory}
            onChange={(e) => setSelectedInventory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
          >
            <option value="">Select Inventory Item</option>
            {inventoryItems.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} (Qty: {item.quantity})
              </option>
            ))}
          </select>
          <button
            onClick={handleLinkInventory}
            disabled={!selectedInventory || loading}
            className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded text-sm font-medium hover:bg-blue-200 disabled:opacity-70"
          >
            {loading ? "Linking..." : "Link to Inventory"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryLink;
