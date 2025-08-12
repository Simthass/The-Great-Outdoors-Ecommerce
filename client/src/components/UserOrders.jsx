import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Alert, Pagination } from 'react-bootstrap';
import { Eye, Package, MapPin, CreditCard, Calendar, Truck, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUserOrders();
  }, [currentPage]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/my-orders?page=${currentPage}&limit=10`, {
        withCredentials: true
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to view your orders');
        navigate('/login');
      } else {
        toast.error('Failed to load orders');
        // Fallback to mock data for demo
        setOrders(mockOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        { reason: 'Cancelled by customer' },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchUserOrders(); // Refresh orders list
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
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
      month: 'long',
      day: 'numeric'
    });
  };

  const canCancelOrder = (order) => {
    return ['Pending', 'Processing'].includes(order.orderStatus);
  };

  // Mock data for fallback
  const mockOrders = [
    {
      _id: '1',
      orderId: 'ORD-123456',
      orderDate: new Date('2024-01-15'),
      totalAmount: 245.67,
      orderStatus: 'Delivered',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      items: [
        { productName: 'Hiking Backpack 40L', quantity: 1, price: 89.99, image: '/products/backpack.jpg' },
        { productName: 'Camping Tent 4-Person', quantity: 1, price: 155.68, image: '/products/tent.jpg' }
      ],
      shippingAddress: {
        addressLine1: '123 Main Street',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 3A8',
        country: 'Canada'
      },
      trackingNumber: '1Z999AA1234567890',
      carrier: 'UPS'
    },
    {
      _id: '2',
      orderId: 'ORD-123455',
      orderDate: new Date('2024-01-10'),
      totalAmount: 67.50,
      orderStatus: 'Shipped',
      paymentStatus: 'Paid',
      paymentMethod: 'PayPal',
      items: [
        { productName: 'Water Bottle 1L', quantity: 2, price: 25.00, image: '/products/bottle.jpg' },
        { productName: 'Trail Mix 500g', quantity: 1, price: 17.50, image: '/products/snack.jpg' }
      ],
      shippingAddress: {
        addressLine1: '123 Main Street',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5V 3A8',
        country: 'Canada'
      },
      trackingNumber: 'CP123456789',
      carrier: 'Canada Post'
    }
  ];

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your orders...</p>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info" className="text-center">
          <Package size={48} className="mb-3" />
          <h4>No Orders Found</h4>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <Button variant="primary" onClick={() => navigate('/shop')}>
            Start Shopping
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="h2">My Orders</h1>
          <p className="text-muted">Track and manage your order history</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Package className="me-2" size={20} />
                Order History
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <div className="fw-bold">{order.orderId || `#${order._id.slice(-6)}`}</div>
                          <small className="text-muted">
                            <Calendar size={12} className="me-1" />
                            {formatDate(order.orderDate)}
                          </small>
                        </td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td>
                          <div>
                            {order.items?.slice(0, 2).map((item, index) => (
                              <div key={index} className="small">
                                {item.productName} × {item.quantity}
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <small className="text-muted">
                                +{order.items.length - 2} more items
                              </small>
                            )}
                          </div>
                        </td>
                        <td className="fw-bold">
                          ${(order.totalAmount + (order.tax || 0) + (order.shippingCost || 0) - (order.discount || 0)).toFixed(2)}
                        </td>
                        <td>
                          <Badge bg={getPaymentStatusBadge(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                          <br />
                          <small className="text-muted">{order.paymentMethod}</small>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(order.orderStatus)} className="mb-1">
                            {order.orderStatus}
                          </Badge>
                          {order.trackingNumber && (
                            <div>
                              <small className="text-muted">
                                <Truck size={12} className="me-1" />
                                {order.trackingNumber}
                              </small>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => fetchOrderDetails(order._id)}
                            >
                              <Eye size={14} className="me-1" />
                              View
                            </Button>
                            {canCancelOrder(order) && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => cancelOrder(order._id)}
                              >
                                <RotateCcw size={14} className="me-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                />
              </Pagination>
            </div>
          )}
        </Col>
      </Row>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details - {selectedOrder?.orderId || `#${selectedOrder?._id?.slice(-6)}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              {/* Order Status */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Order Status:</strong>
                    <Badge bg={getStatusBadge(selectedOrder.orderStatus)} className="ms-2">
                      {selectedOrder.orderStatus}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <strong>Payment Status:</strong>
                    <Badge bg={getPaymentStatusBadge(selectedOrder.paymentStatus)} className="ms-2">
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Order Date:</strong><br />
                    {formatDate(selectedOrder.orderDate)}
                  </div>
                  <div className="mb-3">
                    <strong>Payment Method:</strong><br />
                    <CreditCard size={16} className="me-1" />
                    {selectedOrder.paymentMethod}
                  </div>
                </Col>
              </Row>

              {/* Tracking Information */}
              {selectedOrder.trackingNumber && (
                <Alert variant="info">
                  <div className="d-flex align-items-center">
                    <Truck className="me-2" />
                    <div>
                      <strong>Tracking Information</strong><br />
                      <span>Tracking Number: {selectedOrder.trackingNumber}</span><br />
                      <span>Carrier: {selectedOrder.carrier}</span>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Order Items */}
              <div className="mb-4">
                <h6>
                  <Package className="me-2" size={20} />
                  Order Items
                </h6>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="d-flex align-items-center py-2 border-bottom">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.productName}
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      className="rounded me-3"
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{item.productName}</div>
                      <small className="text-muted">
                        Qty: {item.quantity} × ${item.price?.toFixed(2)}
                      </small>
                    </div>
                    <div className="fw-bold">
                      ${(item.total || (item.price * item.quantity))?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mb-4">
                <h6>Order Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax?.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.shippingCost > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>${selectedOrder.shippingCost?.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount:</span>
                    <span>-${selectedOrder.discount?.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between h5">
                  <strong>Total:</strong>
                  <strong>
                    ${((selectedOrder.totalAmount || 0) + (selectedOrder.tax || 0) + 
                       (selectedOrder.shippingCost || 0) - (selectedOrder.discount || 0)).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h6>
                    <MapPin className="me-2" size={20} />
                    Shipping Address
                  </h6>
                  <address className="mb-0">
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
          {selectedOrder && canCancelOrder(selectedOrder) && (
            <Button
              variant="danger"
              onClick={() => {
                setShowOrderModal(false);
                cancelOrder(selectedOrder._id);
              }}
            >
              <RotateCcw size={16} className="me-2" />
              Cancel Order
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserOrders;
