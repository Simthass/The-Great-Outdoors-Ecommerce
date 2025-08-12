import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Dropdown, Modal, Tabs, Tab } from "react-bootstrap";
import { Search, Filter, Eye, Edit, Trash2, Download, TrendingUp, Package, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import axios from "axios";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [stats, setStats] = useState({});
  const [paymentReport, setPaymentReport] = useState([]);
  const [activeKey, setActiveKey] = useState('orders');

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 10
  });

  // Update form for order status
  const [updateForm, setUpdateForm] = useState({
    orderStatus: '',
    paymentStatus: '',
    trackingNumber: '',
    carrier: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
    if (activeKey === 'reports') {
      fetchPaymentReport();
    }
  }, [filters, activeKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await axios.get(`http://localhost:5000/api/orders?${queryParams.toString()}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setError("Failed to fetch orders");
      // Fallback to mock data for demo
      setOrders(mockOrderData);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/admin/stats', {
        withCredentials: true
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch order stats", error);
      // Fallback to mock stats
      setStats({
        totalOrders: 125,
        totalRevenue: 25847.50,
        avgOrderValue: 206.78,
        pendingOrders: 15,
        processingOrders: 8,
        shippedOrders: 23,
        deliveredOrders: 67,
        cancelledOrders: 12
      });
    }
  };

  const fetchPaymentReport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/admin/payment-report', {
        withCredentials: true
      });
      if (response.data.success) {
        setPaymentReport(response.data.report);
      }
    } catch (error) {
      console.error("Failed to fetch payment report", error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setSelectedOrder(response.data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      toast.error("Failed to fetch order details");
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${selectedOrder._id}/status`,
        updateForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Order updated successfully");
        setShowUpdateModal(false);
        fetchOrders();
        fetchOrderStats();
        setSelectedOrder(response.data.order);
      }
    } catch (error) {
      console.error("Failed to update order", error);
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        { reason: 'Cancelled by admin' },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        fetchOrders();
        fetchOrderStats();
      }
    } catch (error) {
      console.error("Failed to cancel order", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger',
      'Refunded': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Paid': 'success',
      'Failed': 'danger',
      'Refunded': 'info'
    };
    return variants[status] || 'secondary';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    await fetchOrderDetails(order._id);
    setShowOrderModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setUpdateForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
      notes: order.notes || ''
    });
    setShowUpdateModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
      search: '',
      page: 1,
      limit: 10
    });
  };

  // Mock data for fallback
  const mockOrderData = [
    {
      _id: "001",
      orderId: "ORD-001",
      user: { firstName: "John", lastName: "Doe", email: "john@example.com" },
      totalAmount: 150,
      orderStatus: "Shipped",
      paymentStatus: "Paid",
      paymentMethod: "Credit Card",
      orderDate: new Date("2024-01-10"),
      items: [{ productName: "ElkHorn Compound Bow Set", quantity: 1, price: 150 }],
      shippingAddress: { city: "Toronto", province: "ON" }
    },
    {
      _id: "002",
      orderId: "ORD-002",
      user: { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
      totalAmount: 200,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "Cash On Delivery",
      orderDate: new Date("2024-01-11"),
      items: [{ productName: "Coleman Sundome Tents", quantity: 2, price: 100 }],
      shippingAddress: { city: "Vancouver", province: "BC" }
    },
  ];

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2">Order Management System</h1>
          <p className="text-muted">Manage customer orders, track payments, and generate reports</p>
        </Col>
      </Row>

      <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="mb-4">
        {/* Orders Management Tab */}
        <Tab eventKey="orders" title="Orders Management">
          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <ShoppingCart size={24} className="text-primary mb-2" />
                  <Card.Title className="h4">{stats.totalOrders || 0}</Card.Title>
                  <Card.Text className="text-muted">Total Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-success">
                <Card.Body>
                  <DollarSign size={24} className="text-success mb-2" />
                  <Card.Title className="h4">${(stats.totalRevenue || 0).toFixed(2)}</Card.Title>
                  <Card.Text className="text-muted">Total Revenue</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-info">
                <Card.Body>
                  <TrendingUp size={24} className="text-info mb-2" />
                  <Card.Title className="h4">${(stats.avgOrderValue || 0).toFixed(2)}</Card.Title>
                  <Card.Text className="text-muted">Average Order</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-warning">
                <Card.Body>
                  <Package size={24} className="text-warning mb-2" />
                  <Card.Title className="h4">{stats.pendingOrders || 0}</Card.Title>
                  <Card.Text className="text-muted">Pending Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text><Search size={16} /></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search orders..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Order Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Payment Status</Form.Label>
                    <Form.Select
                      value={filters.paymentStatus}
                      onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                    >
                      <option value="">All Payments</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={1} className="d-flex align-items-end">
                  <Button variant="outline-secondary" onClick={resetFilters}>
                    <Filter size={16} />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Orders Table */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Orders</h5>
              <Button variant="outline-primary" size="sm">
                <Download size={16} className="me-2" />
                Export
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="fw-bold">{order.orderId || order._id}</td>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}
                          </div>
                          <small className="text-muted">{order.user?.email}</small>
                        </div>
                      </td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td className="fw-bold">${order.totalAmount?.toFixed(2)}</td>
                      <td>
                        <Badge bg={getPaymentStatusBadge(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                        <br />
                        <small className="text-muted">{order.paymentMethod}</small>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleViewOrder(order)}>
                              <Eye size={14} className="me-2" />View Details
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditOrder(order)}>
                              <Edit size={14} className="me-2" />Update Status
                            </Dropdown.Item>
                            {['Pending', 'Processing'].includes(order.orderStatus) && (
                              <Dropdown.Item
                                className="text-danger"
                                onClick={() => cancelOrder(order._id)}
                              >
                                <Trash2 size={14} className="me-2" />Cancel Order
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Payment Reports Tab */}
        <Tab eventKey="reports" title="Payment Reports">
          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Payment Methods Summary</h5>
                </Card.Header>
                <Card.Body>
                  {paymentReport.map((method, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between">
                        <strong>{method._id}</strong>
                        <span>{method.totalTransactions} orders</span>
                      </div>
                      <div className="text-muted">
                        Revenue: ${method.totalRevenue?.toFixed(2)}
                      </div>
                      <hr />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Order Status Summary</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Pending Orders:</span>
                      <Badge bg="warning">{stats.pendingOrders || 0}</Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Processing Orders:</span>
                      <Badge bg="info">{stats.processingOrders || 0}</Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Shipped Orders:</span>
                      <Badge bg="primary">{stats.shippedOrders || 0}</Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Delivered Orders:</span>
                      <Badge bg="success">{stats.deliveredOrders || 0}</Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Cancelled Orders:</span>
                      <Badge bg="danger">{stats.cancelledOrders || 0}</Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details - {selectedOrder?.orderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Customer:</strong><br />
                  {selectedOrder.user ? 
                    `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : 'Guest'}<br />
                  <small className="text-muted">{selectedOrder.user?.email}</small>
                </Col>
                <Col md={6}>
                  <strong>Order Date:</strong><br />
                  {formatDate(selectedOrder.orderDate)}
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Status:</strong><br />
                  <Badge bg={getStatusBadge(selectedOrder.orderStatus)}>
                    {selectedOrder.orderStatus}
                  </Badge>
                </Col>
                <Col md={4}>
                  <strong>Payment:</strong><br />
                  <Badge bg={getPaymentStatusBadge(selectedOrder.paymentStatus)}>
                    {selectedOrder.paymentStatus}
                  </Badge><br />
                  <small>{selectedOrder.paymentMethod}</small>
                </Col>
                <Col md={4}>
                  <strong>Total:</strong><br />
                  <span className="h5">${selectedOrder.totalAmount?.toFixed(2)}</span>
                </Col>
              </Row>

              {selectedOrder.trackingNumber && (
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Tracking Number:</strong><br />
                    {selectedOrder.trackingNumber}
                  </Col>
                  <Col md={6}>
                    <strong>Carrier:</strong><br />
                    {selectedOrder.carrier}
                  </Col>
                </Row>
              )}

              <hr />
              <h6>Order Items</h6>
              <Table size="sm">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price?.toFixed(2)}</td>
                      <td>${(item.total || (item.price * item.quantity))?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {selectedOrder.shippingAddress && (
                <div>
                  <hr />
                  <h6>Shipping Address</h6>
                  <address>
                    {selectedOrder.shippingAddress.addressLine1}<br />
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <>{selectedOrder.shippingAddress.addressLine2}<br /></>
                    )}
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}<br />
                    {selectedOrder.shippingAddress.country}
                  </address>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Order Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order - {selectedOrder?.orderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Order Status</Form.Label>
                  <Form.Select
                    value={updateForm.orderStatus}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, orderStatus: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Status</Form.Label>
                  <Form.Select
                    value={updateForm.paymentStatus}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tracking Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={updateForm.trackingNumber}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    placeholder="Enter tracking number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Carrier</Form.Label>
                  <Form.Control
                    type="text"
                    value={updateForm.carrier}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, carrier: e.target.value }))}
                    placeholder="e.g., UPS, FedEx, Canada Post"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={updateForm.notes}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this update..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={updateOrderStatus}>
            Update Order
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Order;
