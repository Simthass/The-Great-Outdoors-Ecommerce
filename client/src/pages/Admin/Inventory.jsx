import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { 
  Edit3, Package, AlertTriangle, XCircle, Search, Filter, Plus, 
  TrendingUp, TrendingDown, RefreshCw, X, Save, ArrowUpDown,
  ChevronDown, ChevronUp, Download, Upload, FileText, Bell
} from 'lucide-react';

const InventoryDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Form state for Add/Edit modals
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    lowStockThreshold: '5',
    reorderPoint: '10',
    maxStockLevel: '',
    location: 'Warehouse A',
    supplier: '',
    category: ''
  });

  // API configuration
  const API_BASE_URL = 'http://localhost:5000/api/inventory';

// Load data from backend
// (removed duplicate declaration, see below for the actual function)

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      price: '',
      lowStockThreshold: '5',
      reorderPoint: '10',
      maxStockLevel: '',
      location: 'Warehouse A',
      supplier: '',
      category: ''
    });
  };

  // Handle Add Inventory
// In your handleAddInventory function
// In your handleAddInventory function
const handleAddInventory = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        reorderPoint: parseInt(formData.reorderPoint),
        maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : undefined,
        location: formData.location,
        supplier: formData.supplier,
        category: formData.category
      })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `Failed to add inventory: ${response.status} ${response.statusText}`);
    }
    
    await loadInventoryData();
    setShowAddModal(false);
    resetForm();
  } catch (error) {
    console.error('Failed to add inventory:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// In your loadInventoryData function
const loadInventoryData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}?status=${filterStatus}&search=${searchTerm}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to load inventory');
    }
    
    const data = await response.json();
    
    // Update this part to match the API response format
    setInventoryData(data.data || []);
    setStats({
      totalProducts: data.stats?.totalProducts || 0,
      lowStockItems: data.stats?.lowStockItems || 0,
      outOfStockItems: data.stats?.outOfStockItems || 0,
      totalValue: data.stats?.totalValue || 0,
    });
  } catch (error) {
    console.error('Failed to load inventory:', error);
    // Fallback to mock data if API fails
    setInventoryData(mockInventoryData);
    calculateStats(mockInventoryData);
    alert(`Warning: ${error.message}. Using mock data for demonstration.`);
  } finally {
    setLoading(false);
  }
};

// Add this function to your component
const handleEditInventory = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/${editingItem._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        reorderPoint: parseInt(formData.reorderPoint),
        maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : undefined,
        location: formData.location,
        supplier: formData.supplier,
        category: formData.category
      })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `Failed to update inventory: ${response.status} ${response.statusText}`);
    }
    
    await loadInventoryData();
    setShowEditModal(false);
    resetForm();
  } catch (error) {
    console.error('Failed to update inventory:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
  // Handle Delete Inventory
const handleDeleteInventory = async (id) => {
  if (!window.confirm('Are you sure you want to delete this item?')) return;
  
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }); 
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete inventory');
    }
    
    await loadInventoryData();
  } catch (error) {
    console.error('Failed to delete inventory:', error);
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
  // Open edit modal with item data
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      lowStockThreshold: item.lowStockThreshold?.toString() || '5',
      reorderPoint: item.reorderPoint?.toString() || '10',
      maxStockLevel: item.maxStockLevel?.toString() || '',
      location: item.location || 'Warehouse A',
      supplier: item.supplier || '',
      category: item.category || ''
    });
    setShowEditModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    resetForm();
  };

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Sort data
  const sortedData = [...inventoryData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Mock data for fallback - replace with actual API calls
  const mockInventoryData = [
    { id: 1, name: 'ElkHorn Compound Bow Set', quantity: 3, price: 20, status: 'low', lastRestocked: '2024-07-15', location: 'Warehouse A', lowStockThreshold: 5, reorderPoint: 10, supplier: 'Archery Pro' },
    { id: 2, name: 'HawksBill Long Bow Set', quantity: 1, price: 15, status: 'low', lastRestocked: '2024-07-10', location: 'Warehouse A', lowStockThreshold: 5, reorderPoint: 10, supplier: 'Archery Pro' },
    { id: 3, name: 'Sentinel Recurve Bow Set', quantity: 4, price: 25, status: 'low', lastRestocked: '2024-07-20', location: 'Warehouse B', lowStockThreshold: 5, reorderPoint: 10, supplier: 'Target Sports' },
    { id: 4, name: 'Upland Compound Bow Set', quantity: 2, price: 30, status: 'low', lastRestocked: '2024-07-18', location: 'Warehouse A', lowStockThreshold: 5, reorderPoint: 10, supplier: 'Archery Pro' },
    { id: 5, name: 'Coleman Sundome Tents', quantity: 10, price: 30, status: 'normal', lastRestocked: '2024-07-25', location: 'Warehouse C', lowStockThreshold: 5, reorderPoint: 10, supplier: 'Coleman Inc' },
  ];

  useEffect(() => {
    loadInventoryData();
  }, [searchTerm, filterStatus]);

  const calculateStats = (data) => {
    const totalProducts = data.length;
    const lowStockItems = data.filter(item => item.status === 'low').length;
    const outOfStockItems = data.filter(item => item.status === 'out').length;
    const totalValue = data.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    setStats({ totalProducts, lowStockItems, outOfStockItems, totalValue });
  };

  const filteredData = sortedData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getRowStyle = (status) => {
    switch (status) {
      case 'low':
        return 'bg-amber-50 border-l-4 border-amber-400';
      case 'out':
        return 'bg-red-50 border-l-4 border-red-400';
      default:
        return 'bg-white border-l-4 border-transparent';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      normal: { bg: 'bg-green-100', color: 'text-green-700', text: 'In Stock', icon: <Package size={14} /> },
      low: { bg: 'bg-amber-100', color: 'text-amber-700', text: 'Low Stock', icon: <AlertTriangle size={14} /> },
      out: { bg: 'bg-red-100', color: 'text-red-700', text: 'Out of Stock', icon: <XCircle size={14} /> }
    };
    
    const style = styles[status];
    return (
      <span className={`${style.bg} ${style.color} px-2.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        {style.icon}
        {style.text}
      </span>
    );
  };

const handleStockUpdate = async (id, newQuantity) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: newQuantity })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update stock');
    }
    
    await loadInventoryData();
  } catch (error) {
    console.error('Failed to update stock:', error);
    alert(error.message);
  } finally {
    setLoading(false);
  }
};

  const refreshData = () => {
    loadInventoryData();
  };

  const StatCard = ({ title, value, color, icon: Icon, trend }) => {
    const colorMap = {
      '#4f46e5': 'bg-indigo-100 text-indigo-700',
      '#e67c00': 'bg-amber-100 text-amber-700',
      '#d32f2f': 'bg-red-100 text-red-700',
      '#26a269': 'bg-green-100 text-green-700'
    };

    const textColorMap = {
      '#4f46e5': 'text-indigo-600',
      '#e67c00': 'text-amber-600',
      '#d32f2f': 'text-red-600',
      '#26a269': 'text-green-600'
    };

    const bgColor = `${color}20`;
    
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
            <h2 className={`${textColorMap[color]} text-2xl font-bold`}>
              {typeof value === 'number' && title === 'Total Value' ? `Rs ${value.toLocaleString()} LKR` : value}
            </h2>
          </div>
          <div className={`${colorMap[color]} p-3 rounded-lg flex items-center justify-center`}>
            <Icon size={20} />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header with background image */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center mb-10">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Inventory</p>
      </div>

      <div className="px-10 pb-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            color="#4f46e5"
            icon={Package}
            trend={5.2}
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockItems}
            color="#e67c00"
            icon={AlertTriangle}
            trend={-12.5}
          />
          <StatCard
            title="Out of Stock"
            value={stats.outOfStockItems}
            color="#d32f2f"
            icon={XCircle}
            trend={-8.3}
          />
          <StatCard
            title="Total Value"
            value={stats.totalValue}
            color="#26a269"
            icon={TrendingUp}
            trend={15.7}
          />
        </div>

        {/* Inventory Management Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Product Inventory
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {filteredData.length} of {inventoryData.length} products shown
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm w-full sm:min-w-[240px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="normal">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm flex items-center gap-2 transition-all hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-lg bg-[#7BC043] text-white font-medium text-sm flex items-center gap-2 transition-all hover:bg-[#6aab39]"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th 
                    className="px-4 py-4 text-left font-semibold text-gray-600 text-sm cursor-pointer select-none"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      Product Name
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-center font-semibold text-gray-600 text-sm cursor-pointer select-none"
                    onClick={() => requestSort('quantity')}
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      Quantity
                      {getSortIcon('quantity')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-center font-semibold text-gray-600 text-sm cursor-pointer select-none"
                    onClick={() => requestSort('price')}
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      Price
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-center font-semibold text-gray-600 text-sm cursor-pointer select-none"
                    onClick={() => requestSort('status')}
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-center font-semibold text-gray-600 text-sm cursor-pointer select-none"
                    onClick={() => requestSort('location')}
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      Location
                      {getSortIcon('location')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-gray-600 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-gray-500">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
                      <p>Loading inventory data...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-gray-500 text-base">
                      <Package size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No products found matching your criteria</p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterStatus('all');
                        }}
                        className="mt-4 px-4 py-2 bg-[#7BC043] text-white rounded-md text-sm font-medium hover:bg-[#6aab39]"
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id}
                      className={`${getRowStyle(item.status)} border-b border-gray-100 transition-colors`}
                    >
                      <td className="px-4 py-4 font-medium text-gray-800">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          Last restocked: {item.lastRestocked}
                        </div>
                      </td>
                      <td 
                        className="px-4 py-4 text-center font-semibold cursor-pointer"
                        onClick={() => {
                          const newQuantity = prompt(`Update quantity for ${item.name}:`, item.quantity);
                          if (newQuantity !== null && !isNaN(newQuantity)) {
                            handleStockUpdate(item.id, parseInt(newQuantity));
                          }
                        }}
                      >
                        <span className={item.quantity === 0 ? 'text-red-600' : item.quantity <= 4 ? 'text-amber-600' : 'text-green-600'}>
                          {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-gray-800">
                        Rs {item.price.toFixed(2)} LKR
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="px-4 py-4 text-center flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-2 bg-[#7BC043] text-white rounded text-xs font-medium flex items-center gap-1.5 transition-all hover:bg-[#6aab39]"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteInventory(item.id)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded text-xs font-medium flex items-center gap-1.5 transition-all hover:bg-red-200"
                        >
                          <X size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} />
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2.5"> 
              <button className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-left flex items-center gap-2.5 transition-all hover:bg-gray-100">
                <FileText size={16} />
                Generate Inventory Report
              </button>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={18} />
              Alerts & Notifications
            </h3>
            <div className="flex flex-col gap-3">
              {stats.outOfStockItems > 0 && (
                <div className="px-4 py-3 bg-red-50 rounded-lg flex items-center gap-2.5">
                  <XCircle size={16} className="text-red-600" />
                  <div>
                    <div className="text-sm font-medium text-red-600">
                      {stats.outOfStockItems} items out of stock
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Requires immediate attention
                    </div>
                  </div>
                </div>
              )}
              
              {stats.lowStockItems > 0 && (
                <div className="px-4 py-3 bg-amber-50 rounded-lg flex items-center gap-2.5">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <div>
                    <div className="text-sm font-medium text-amber-600">
                      {stats.lowStockItems} items low on stock
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Consider restocking soon
                    </div>
                  </div>
                </div>
              )}
              
              <div className="px-4 py-3 bg-green-50 rounded-lg flex items-center gap-2.5">
                <Package size={16} className="text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-600">
                    Inventory up to date
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Last updated just now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {showAddModal ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button 
                onClick={closeModals}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={showAddModal ? handleAddInventory : handleEditInventory}>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Location *
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer"
                    >
                      <option value="Warehouse A">Warehouse A</option>
                      <option value="Warehouse B">Warehouse B</option>
                      <option value="Warehouse C">Warehouse C</option>
                      <option value="Store Front">Store Front</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Low Stock Threshold *
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Reorder Point *
                    </label>
                    <input
                      type="number"
                      name="reorderPoint"
                      value={formData.reorderPoint}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                </div>
                
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-gray-500">
                    Max Stock Level (optional)
                  </label>
                  <input
                    type="number"
                    name="maxStockLevel"
                    value={formData.maxStockLevel}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Supplier (optional)
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                      Category (optional)
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded text-sm font-medium transition-all hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-[#7BC043] text-white rounded text-sm font-medium transition-all hover:bg-[#6aab39] disabled:opacity-70"
                >
                  {loading ? 'Processing...' : showAddModal ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;