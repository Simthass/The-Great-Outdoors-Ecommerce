import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orderManagement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock order data for demonstration
  const mockOrderData = [
    {
      _id: "001",
      orderId: "#001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      totalAmount: 150,
      orderStatus: "Shipped",
      orderDate: new Date("2024-01-10"),
      items: [
        { productName: "ElkHorn Compound Bow Set", quantity: 1, price: 150 },
      ],
    },
    {
      _id: "002",
      orderId: "#002",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      totalAmount: 200,
      orderStatus: "Pending",
      orderDate: new Date("2024-01-11"),
      items: [
        { productName: "Coleman Sundome Tents", quantity: 2, price: 100 },
      ],
    },
    {
      _id: "003",
      orderId: "#003",
      customerName: "Mike Johnson",
      customerEmail: "mike@example.com",
      totalAmount: 120,
      orderStatus: "Delivered",
      orderDate: new Date("2024-01-09"),
      items: [{ productName: "30L Backpack", quantity: 4, price: 30 }],
    },
    {
      _id: "004",
      orderId: "#004",
      customerName: "Emily Davis",
      customerEmail: "emily@example.com",
      totalAmount: 90,
      orderStatus: "Cancelled",
      orderDate: new Date("2024-01-08"),
      items: [{ productName: "50L Backpack", quantity: 3, price: 30 }],
    },
  ];

  const stats = {
    totalProducts: 150,
    lowStock: 23,
    outOfStock: 5,
  };

  const inventoryItems = [
    {
      name: "ElkHorn Compound Bow Set",
      quantity: 3,
      price: 20,
      actions: "Edit",
    },
    { name: "Hawksbill Long Bow Set", quantity: 1, price: 15, actions: "Edit" },
    {
      name: "Sentinel Recurve Bow Set",
      quantity: 4,
      price: 25,
      actions: "Edit",
    },
    {
      name: "Upland Compound Bow Set",
      quantity: 2,
      price: 30,
      actions: "Edit",
    },
    { name: "Coleman Sundome Tents", quantity: 10, price: 30, actions: "Edit" },
    {
      name: "Decathlon Quechua 2 Seconds Easy 3-person Tent",
      quantity: 9,
      price: 30,
      actions: "Edit",
    },
    { name: "30L Backpack", quantity: 10, price: 30, actions: "Edit" },
    { name: "40L Backpack", quantity: 0, price: 30, actions: "Edit" },
    { name: "50L Backpack", quantity: 4, price: 30, actions: "Edit" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Load mock data
        setOrders(mockOrderData);
      } catch (error) {
        console.error("Failed to fetch orders", error);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Update local state for demonstration
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );

      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update order status", error);
      toast.error("Failed to update order status");
    }
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

  const getRowColor = (quantity) => {
    if (quantity === 0) return "bg-red-200";
    if (quantity <= 4) return "bg-yellow-200";
    return "bg-white";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="flex space-x-8 px-8 py-4">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "inventoryManagement"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("inventoryManagement")}
          >
            Inventory Management
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "orderManagement"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("orderManagement")}
          >
            Order Management
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
            <nav className="space-y-2">
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded">
                Inventory Dashboard
              </div>
              <div className="text-gray-700 px-4 py-2 hover:bg-gray-50 rounded cursor-pointer">
                Order Management
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "inventoryManagement" && (
            <div>
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
                  <h3 className="text-gray-500 text-sm font-medium">
                    Low Stock
                  </h3>
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
                  <h2 className="text-xl font-semibold">
                    Inventory Management
                  </h2>
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inventoryItems.map((item, index) => (
                        <tr key={index} className={getRowColor(item.quantity)}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity.toString().padStart(2, "0")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-900">
                              {item.actions}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orderManagement" && (
            <div>
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold">Order Management</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order._id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customerName || order.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${order.totalAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                              className={`text-sm font-medium px-2 py-1 rounded border ${getStatusColor(
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
