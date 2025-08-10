import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ComprehensiveAdminDashboard = () => {
  const [activeFrame, setActiveFrame] = useState("inventory"); // 'inventory' or 'order'
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Mock data matching the prototype
  const mockInventoryData = [
    {
      _id: "1",
      product: {
        _id: "p1",
        name: "ElkHorn Compound Bow Set",
        price: 20,
        imageUrl: "/products/product 1.jpg"
      },
      stockLevel: 3,
      lowStockThreshold: 5,
      reorderPoint: 10
    },
    {
      _id: "2",
      product: {
        _id: "p2",
        name: "Hawksbill Long Bow Set",
        price: 15,
        imageUrl: "/products/product 2.jpg"
      },
      stockLevel: 1,
      lowStockThreshold: 3,
      reorderPoint: 5
    },
    {
      _id: "3",
      product: {
        _id: "p3",
        name: "Sentinel Recurve Bow Set",
        price: 25,
        imageUrl: "/products/product 3.jpg"
      },
      stockLevel: 4,
      lowStockThreshold: 5,
      reorderPoint: 8
    },
    {
      _id: "4",
      product: {
        _id: "p4",
        name: "Upland Compound Bow Set",
        price: 30,
        imageUrl: "/products/product 4.jpg"
      },
      stockLevel: 2,
      lowStockThreshold: 4,
      reorderPoint: 7
    },
    {
      _id: "5",
      product: {
        _id: "p5",
        name: "Coleman Sundome Tents",
        price: 30,
        imageUrl: "/products/product 5.jpg"
      },
      stockLevel: 10,
      lowStockThreshold: 5,
      reorderPoint: 12
    },
    {
      _id: "6",
      product: {
        _id: "p6",
        name: "Decathlon Quechua 2 Seconds Easy 3-person Tent",
        price: 30,
        imageUrl: "/products/product 6.jpg"
      },
      stockLevel: 9,
      lowStockThreshold: 8,
      reorderPoint: 15
    },
    {
      _id: "7",
      product: {
        _id: "p7",
        name: "30L Backpack",
        price: 30,
        imageUrl: "/products/product 7.jpg"
      },
      stockLevel: 10,
      lowStockThreshold: 5,
      reorderPoint: 12
    },
    {
      _id: "8",
      product: {
        _id: "p8",
        name: "40L Backpack",
        price: 30,
        imageUrl: "/products/product 8.jpg"
      },
      stockLevel: 0,
      lowStockThreshold: 3,
      reorderPoint: 5
    },
    {
      _id: "9",
      product: {
        _id: "p9",
        name: "50L Backpack",
        price: 30,
        imageUrl: "/products/product 9.jpg"
      },
      stockLevel: 4,
      lowStockThreshold: 6,
      reorderPoint: 10
    }
  ];

  const mockOrderData = [
    {
      _id: "001",
      orderId: "#001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      totalAmount: 150,
      orderStatus: "Shipped",
      orderDate: new Date('2024-01-10'),
      items: [{ productName: "ElkHorn Compound Bow Set", quantity: 1, price: 150 }]
    },
    {
      _id: "002", 
      orderId: "#002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      totalAmount: 200,
      orderStatus: "Pending",
      orderDate: new Date('2024-01-11'),
      items: [{ productName: "Coleman Sundome Tents", quantity: 2, price: 100 }]
    },
    {
      _id: "003",
      orderId: "#003", 
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      totalAmount: 120,
      orderStatus: "Delivered",
      orderDate: new Date('2024-01-09'),
      items: [{ productName: "30L Backpack", quantity: 4, price: 30 }]
    },
    {
      _id: "004",
      orderId: "#004",
      customerName: "Emily Davis", 
      customerEmail: "emily@example.com",
      totalAmount: 90,
      orderStatus: "Cancelled",
      orderDate: new Date('2024-01-08'),
      items: [{ productName: "50L Backpack", quantity: 3, price: 30 }]
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInventory(mockInventoryData);
      setOrders(mockOrderData);
      
      // Calculate stats
      const totalProducts = mockInventoryData.length;
      const lowStock = mockInventoryData.filter(item => item.stockLevel <= item.lowStockThreshold).length;
      const outOfStock = mockInventoryData.filter(item => item.stockLevel === 0).length;
      
      setStats({ totalProducts, lowStock, outOfStock });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditValues({
      stockLevel: item.stockLevel,
      lowStockThreshold: item.lowStockThreshold,
      reorderPoint: item.reorderPoint
    });
  };

  const handleSave = async (itemId) => {
    try {
      setInventory(prev => 
        prev.map(item => 
          item._id === itemId 
            ? { ...item, ...editValues }
            : item
        )
      );
      
      setEditingId(null);
      setEditValues({});
      toast.success('Inventory updated successfully');
      
      // Recalculate stats
      const updatedInventory = inventory.map(item => 
        item._id === itemId ? { ...item, ...editValues } : item
      );
      const totalProducts = updatedInventory.length;
      const lowStock = updatedInventory.filter(item => item.stockLevel <= item.lowStockThreshold).length;
      const outOfStock = updatedInventory.filter(item => item.stockLevel === 0).length;
      setStats({ totalProducts, lowStock, outOfStock });
      
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getRowColor = (stockLevel, lowStockThreshold) => {
    if (stockLevel === 0) return "bg-red-200";
    if (stockLevel <= lowStockThreshold) return "bg-yellow-200";
    return "bg-white";
  };

  const getStockStatus = (stockLevel, lowStockThreshold) => {
    if (stockLevel === 0) return { text: "Out of Stock", color: "text-red-600" };
    if (stockLevel <= lowStockThreshold) return { text: "Low Stock", color: "text-yellow-600" };
    return { text: "In Stock", color: "text-green-600" };
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "shipped":
      case "delivered":
        return "text-green-600";
      case "pending":
      case "processing":
        return "text-yellow-600";
      case "cancelled":
      case "refunded":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
        {/* Left Frame - Inventory Dashboard */}
        <div className="w-1/2 bg-white">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Admin Dashboard</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveFrame("inventory")}
                  className={`px-3 py-1 text-sm rounded ${
                    activeFrame === "inventory" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Inventory Management
                </button>
                <button
                  onClick={() => setActiveFrame("order")}
                  className={`px-3 py-1 text-sm rounded ${
                    activeFrame === "order" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Order Management
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Dashboard */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Dashboard</h3>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border">
                <h4 className="text-gray-500 text-sm font-medium">Total Products</h4>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg shadow border">
                <h4 className="text-gray-500 text-sm font-medium">Low Stock</h4>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg shadow border">
                <h4 className="text-gray-500 text-sm font-medium">Out of Stock</h4>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
            </div>

            {/* Inventory Management Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h4 className="text-md font-semibold">Inventory Management</h4>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Product Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventory.map((item) => {
                      const isEditing = editingId === item._id;
                      
                      return (
                        <tr 
                          key={item._id} 
                          className={getRowColor(item.stockLevel, item.lowStockThreshold)}
                        >
                          <td className="px-4 py-2 text-gray-900">
                            {item.product.name}
                          </td>
                          <td className="px-4 py-2 text-gray-900">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editValues.stockLevel || ''}
                                onChange={(e) => setEditValues({
                                  ...editValues,
                                  stockLevel: parseInt(e.target.value) || 0
                                })}
                                className="w-16 px-1 py-1 border border-gray-300 rounded text-xs"
                              />
                            ) : (
                              item.stockLevel.toString().padStart(2, "0")
                            )}
                          </td>
                          <td className="px-4 py-2 text-gray-900">
                            ${item.product.price}
                          </td>
                          <td className="px-4 py-2">
                            {isEditing ? (
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleSave(item._id)}
                                  className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={handleCancel}
                                  className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-xs"
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

        {/* Right Frame - Order Management */}
        <div className="w-1/2 bg-white border-l">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Admin Dashboard</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                  Inventory Management
                </button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                  Order Management
                </button>
              </div>
            </div>
          </div>

          {/* Order Management */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Management</h3>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h4 className="text-md font-semibold">Order Management</h4>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Order ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Total Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {order.orderId}
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          {order.customerName}
                        </td>
                        <td className="px-4 py-2 text-gray-900">
                          ${order.totalAmount}
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;
