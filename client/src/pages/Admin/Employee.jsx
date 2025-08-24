import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Users,
  Package,
  Star,
  FileText,
  Search,
  Filter,
  ShoppingBag,
  Trash2,
  Edit,
  Plus,
  User,
  ChevronUp,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

// API configuration
const API_BASE_URL = "http://localhost:5000/api";

// Create axios-like API service
const api = {
  get: async (url, config = {}) => {
    const queryParams = config.params
      ? "?" + new URLSearchParams(config.params).toString()
      : "";
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${url}${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...config.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw { response: { data: error, status: response.status } };
    }

    return { data: await response.json() };
  },

  post: async (url, data) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw { response: { data: error, status: response.status } };
    }

    return { data: await response.json() };
  },

  put: async (url, data) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw { response: { data: error, status: response.status } };
    }

    return { data: await response.json() };
  },

  delete: async (url, config = {}) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
      body: config.data ? JSON.stringify(config.data) : undefined,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw { response: { data: error, status: response.status } };
    }

    return { data: await response.json() };
  },
};

// Main Employee Management Component
const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("All Positions");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSidebarPage] = useState("employees");
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const topRef = useRef(null);
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Available positions
  const availablePositions = [
    "Cashier",
    "Inventory manager",
    "Executive manager",
    "Cleaner",
    "Sales Associate",
  ];

  // Fetch user profile for sidebar
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
      if (data.success) {
        setUserProfile(data.data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Fetch employees from backend
  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page.toString(),
        limit: "10",
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedPosition !== "All Positions")
        params.position = selectedPosition;

      const response = await api.get("/employee", { params });
      setEmployees(response.data.data.employees || []);
      setCurrentPage(response.data.data.pagination.currentPage);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotalEmployees(response.data.data.pagination.totalEmployees);
    } catch (err) {
      console.error("Fetch employees error:", err);
      if (err.response?.status === 0 || err.message === "Failed to fetch") {
        setError(
          "Unable to connect to server. Please make sure the backend is running on http://localhost:5000"
        );
      } else {
        setError(err.response?.data?.error || "Failed to fetch employees");
      }
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchEmployees(1);
  }, []);

  useEffect(() => {
    fetchEmployees(1);
  }, [searchTerm, selectedPosition]);

  // Filter employees (now handled by backend)
  const filteredEmployees = employees;

  // Get unique positions for filter
  const positions = [
    "All Positions",
    ...new Set(employees.map((emp) => emp.position)),
  ];

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.position) errors.position = "Position is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Address is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      email: "",
      phoneNumber: "",
      address: "",
    });
    setFormErrors({});
    setError(null);
  };

  // Employee selection
  const handleSelectEmployee = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp._id));
    }
  };

  // CRUD operations
  const handleAddEmployee = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleSubmitAdd = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/employee", formData);

      fetchEmployees(currentPage);
      setShowAddModal(false);
      resetForm();
      alert("Employee added successfully!");
    } catch (err) {
      console.error("Add employee error:", err);
      if (err.response?.status === 0 || err.message === "Failed to fetch") {
        setError(
          "Unable to connect to server. Please make sure the backend is running on http://localhost:5000"
        );
      } else {
        setError(err.response?.data?.error || "Failed to add employee");
        if (err.response?.data?.errors) {
          setFormErrors(err.response.data.errors);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      address: employee.address,
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      await api.put(`/employee/${editingEmployee._id}`, formData);

      fetchEmployees(currentPage);
      setShowEditModal(false);
      setEditingEmployee(null);
      resetForm();
      alert("Employee updated successfully!");
    } catch (err) {
      console.error("Edit employee error:", err);
      if (err.response?.status === 0 || err.message === "Failed to fetch") {
        setError(
          "Unable to connect to server. Please make sure the backend is running on http://localhost:5000"
        );
      } else {
        setError(err.response?.data?.error || "Failed to update employee");
        if (err.response?.data?.errors) {
          setFormErrors(err.response.data.errors);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select employees to delete");
      return;
    }

    const employeeNames = employees
      .filter((emp) => selectedEmployees.includes(emp._id))
      .map((emp) => emp.name)
      .join(", ");

    if (window.confirm(`Are you sure you want to delete: ${employeeNames}?`)) {
      try {
        setLoading(true);
        setError(null);

        await api.post("/employee/bulk-delete", { ids: selectedEmployees });

        fetchEmployees(currentPage);
        setSelectedEmployees([]);
        alert("Employee(s) deleted successfully!");
      } catch (err) {
        console.error("Delete employee error:", err);
        if (err.response?.status === 0 || err.message === "Failed to fetch") {
          setError(
            "Unable to connect to server. Please make sure the backend is running on http://localhost:5000"
          );
        } else {
          setError(err.response?.data?.error || "Failed to delete employee(s)");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmployeeReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/employee/report");
      console.log("Employee Report:", response.data.data);
      alert("Employee report generated! Check console for details.");
    } catch (err) {
      console.error("Report error:", err);
      if (err.response?.status === 0 || err.message === "Failed to fetch") {
        setError(
          "Unable to connect to server. Please make sure the backend is running on http://localhost:5000"
        );
      } else {
        setError(err.response?.data?.error || "Failed to generate report");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingEmployee(null);
    resetForm();
  };

  // Handle page change with scroll to top
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEmployees(page);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to top button
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle sidebar navigation
  const handleNavClick = (key) => {};

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading && employees.length === 0) {
    return (
      <div>
        {/* Header */}
        <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
          <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
            Admin - Employee Management
          </p>
        </div>

        <div className="flex bg-gray-50 min-h-screen mt-6 rounded-2xl">
          {/* Sidebar Loading */}
          <aside className="bg-green-600 text-white h-screen sticky top-0 w-20 rounded-lg">
            <div className="animate-pulse p-4">
              <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-8"></div>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-green-500 rounded-lg mb-3"
                ></div>
              ))}
            </div>
          </aside>

          {/* Main Content Loading */}
          <div className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
          Admin - Employee Management
        </p>
      </div>

      <div className="flex bg-gray-50 min-h-screen mt-6 rounded-2xl">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentSidebarPage}
          onPageChange={handleNavClick}
          userProfile={userProfile}
        />

        {/* Main Content */}
        <div className="flex-1" ref={topRef}>
          {/* Stats */}
          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalEmployees}
                  </p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mx-6 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">
                ALL Employees
              </h1>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Employees"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-w-40 bg-white"
                >
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>

                <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      <input
                        type="checkbox"
                        checked={
                          selectedEmployees.length ===
                            filteredEmployees.length &&
                          filteredEmployees.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                      />
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      Name
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      Emp ID
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      Position
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      Phone Number
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      Address
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      Joined Date
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-8 text-center text-gray-500"
                      >
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                          Loading employees...
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="py-8 text-center text-gray-500"
                      >
                        {error
                          ? "Unable to load employees"
                          : "No employees found"}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee, index) => (
                      <tr
                        key={employee._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={() => handleSelectEmployee(employee._id)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {employee.name}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-600">
                            {employee.employeeId}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-600">
                            {employee.position}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-600">
                            {employee.phoneNumber}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-600">
                            {employee.address}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-600">
                            {formatDate(employee.joinedDate)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * 10 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, totalEmployees)}
                      </span>{" "}
                      of <span className="font-medium">{totalEmployees}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? "z-10 bg-green-50 border-green-500 text-green-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={handleAddEmployee}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Employee
                </button>

                <button
                  onClick={handleDeleteEmployee}
                  disabled={loading || selectedEmployees.length === 0}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Employee
                </button>

                <button
                  onClick={handleEmployeeReport}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Employee Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-700">
                Add New Employee
              </h2>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Position</option>
                    {availablePositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  {formErrors.position && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.position}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter phone number"
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter address"
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAdd}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-700">
                Edit Employee
              </h2>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Position</option>
                    {availablePositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  {formErrors.position && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.position}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitEdit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Updating..." : "Update Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {currentPage > 1 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 z-50"
          title="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default EmployeeManagement;
