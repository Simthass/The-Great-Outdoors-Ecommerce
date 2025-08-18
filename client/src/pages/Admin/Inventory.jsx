import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Mock data for demonstration (replace with API call)
  const mockInventoryData = [
    {
      _id: "1",
      product: {
        _id: "p1",
        name: "ElkHorn Compound Bow Set",
        price: 20,
        imageUrl: "/products/product 1.jpg",
      },
      stockLevel: 3,
      lowStockThreshold: 5,
      reorderPoint: 10,
    },
    {
      _id: "2",
      product: {
        _id: "p2",
        name: "Hawksbill Long Bow Set",
        price: 15,
        imageUrl: "/products/product 2.jpg",
      },
      stockLevel: 1,
      lowStockThreshold: 3,
      reorderPoint: 5,
    },
    {
      _id: "3",
      product: {
        _id: "p3",
        name: "Sentinel Recurve Bow Set",
        price: 25,
        imageUrl: "/products/product 3.jpg",
      },
      stockLevel: 4,
      lowStockThreshold: 5,
      reorderPoint: 8,
    },
    {
      _id: "4",
      product: {
        _id: "p4",
        name: "Upland Compound Bow Set",
        price: 30,
        imageUrl: "/products/product 4.jpg",
      },
      stockLevel: 2,
      lowStockThreshold: 4,
      reorderPoint: 7,
    },
    {
      _id: "5",
      product: {
        _id: "p5",
        name: "Coleman Sundome Tents",
        price: 30,
        imageUrl: "/products/product 5.jpg",
      },
      stockLevel: 10,
      lowStockThreshold: 5,
      reorderPoint: 12,
    },
    {
      _id: "6",
      product: {
        _id: "p6",
        name: "Decathlon Quechua 2 Seconds Easy 3-person Tent",
        price: 30,
        imageUrl: "/products/product 6.jpg",
      },
      stockLevel: 9,
      lowStockThreshold: 8,
      reorderPoint: 15,
    },
    {
      _id: "7",
      product: {
        _id: "p7",
        name: "30L Backpack",
        price: 30,
        imageUrl: "/products/product 7.jpg",
      },
      stockLevel: 10,
      lowStockThreshold: 5,
      reorderPoint: 12,
    },
    {
      _id: "8",
      product: {
        _id: "p8",
        name: "40L Backpack",
        price: 30,
        imageUrl: "/products/product 8.jpg",
      },
      stockLevel: 0,
      lowStockThreshold: 3,
      reorderPoint: 5,
    },
    {
      _id: "9",
      product: {
        _id: "p9",
        name: "50L Backpack",
        price: 30,
        imageUrl: "/products/product 9.jpg",
      },
      stockLevel: 4,
      lowStockThreshold: 6,
      reorderPoint: 10,
    },
  ];

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For demonstration, using mock data
      // Replace this with actual API call:
      // const response = await fetch('/api/inventory', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setInventory(mockInventoryData);

      // Calculate stats
      const totalProducts = mockInventoryData.length;
      const lowStock = mockInventoryData.filter(
        (item) => item.stockLevel <= item.lowStockThreshold
      ).length;
      const outOfStock = mockInventoryData.filter(
        (item) => item.stockLevel === 0
      ).length;

      setStats({ totalProducts, lowStock, outOfStock });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Failed to fetch inventory data");
      toast.error("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditValues({
      stockLevel: item.stockLevel,
      lowStockThreshold: item.lowStockThreshold,
      reorderPoint: item.reorderPoint,
    });
  };

  const handleSave = async (itemId) => {
    try {
      // For demonstration purposes, update local state
      // Replace with actual API call:
      // const response = await fetch(`/api/inventory/${itemId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(editValues)
      // });

      setInventory((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, ...editValues } : item
        )
      );

      setEditingId(null);
      setEditValues({});
      toast.success("Inventory updated successfully");

      // Recalculate stats
      const updatedInventory = inventory.map((item) =>
        item._id === itemId ? { ...item, ...editValues } : item
      );
      const totalProducts = updatedInventory.length;
      const lowStock = updatedInventory.filter(
        (item) => item.stockLevel <= item.lowStockThreshold
      ).length;
      const outOfStock = updatedInventory.filter(
        (item) => item.stockLevel === 0
      ).length;
      setStats({ totalProducts, lowStock, outOfStock });
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update inventory");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const getRowColor = (stockLevel, lowStockThreshold) => {
    if (stockLevel === 0) return "bg-red-200";
    if (stockLevel <= lowStockThreshold) return "bg-yellow-200";
    return "bg-white";
  };

  const getStockStatus = (stockLevel, lowStockThreshold) => {
    if (stockLevel === 0)
      return { text: "Out of Stock", color: "text-red-600" };
    if (stockLevel <= lowStockThreshold)
      return { text: "Low Stock", color: "text-yellow-600" };
    return { text: "In Stock", color: "text-green-600" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={fetchInventoryData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
          Admin Dashboard
        </p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
            <nav className="space-y-2">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded">
                Inventory Management
              </div>
              <div className="text-gray-700 px-4 py-2 hover:bg-gray-50 rounded cursor-pointer">
                Order Management
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">
                Total Products
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalProducts}
              </p>
            </div>
            <div className="bg-yellow-100 p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Low Stock</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.lowStock}
              </p>
            </div>
            <div className="bg-red-100 p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">
                Out of Stock
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {stats.outOfStock}
              </p>
            </div>
          </div>

          {/* Inventory Management Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Inventory Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((item) => {
                    const isEditing = editingId === item._id;
                    const status = getStockStatus(
                      item.stockLevel,
                      item.lowStockThreshold
                    );

                    return (
                      <tr
                        key={item._id}
                        className={getRowColor(
                          item.stockLevel,
                          item.lowStockThreshold
                        )}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {item.product.imageUrl && (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            {item.product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editValues.stockLevel || ""}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  stockLevel: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            item.stockLevel.toString().padStart(2, "0")
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSave(item._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
