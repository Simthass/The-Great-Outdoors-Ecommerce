import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { CheckCircle, Package, MapPin, CreditCard, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      fetchOrder();
    }
  }, [orderId, order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'failed': return 'danger';
      case 'refunded': return 'info';
      default: return 'secondary';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Order not found</h4>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Alert>
      </Container>
    );
  }

  const subtotal = order.totalAmount || 0;
  const tax = order.tax || 0;
  const shipping = order.shippingCost || 0;
  const discount = order.discount || 0;
  const grandTotal = subtotal + tax + shipping - discount;

  return (
    <Container className="py-5">
      {/* Success Header */}
      <div className="text-center mb-5">
        <CheckCircle size={64} className="text-success mb-3" />
        <h1 className="text-success mb-2">Order Confirmed!</h1>
        <p className="lead text-muted">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>
      </div>

      <Row>
        <Col lg={8}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Order Details</h4>
              <div className="d-flex gap-2">
                <Badge bg={getStatusColor(order.orderStatus)}>
                  {order.orderStatus}
                </Badge>
                <Badge bg={getPaymentStatusColor(order.paymentStatus)}>
                  Payment: {order.paymentStatus}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Order ID:</strong> {order.orderId}
                </Col>
                <Col md={6}>
                  <strong>Order Date:</strong> {formatDate(order.orderDate)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Payment Method:</strong> {order.paymentMethod}
                </Col>
                {order.trackingNumber && (
                  <Col md={6}>
                    <strong>Tracking:</strong> {order.trackingNumber}
                  </Col>
                )}
              </Row>
              {order.notes && (
                <Row className="mb-3">
                  <Col>
                    <strong>Order Notes:</strong> {order.notes}
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Items */}
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0"><Package className="me-2" size={20} />Order Items</h4>
            </Card.Header>
            <Card.Body>
              {order.items && order.items.map((item, index) => (
                <div key={index} className="d-flex align-items-center py-3 border-bottom">
                  <img
                    src={item.image || '/placeholder.jpg'}
                    alt={item.productName}
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    className="rounded me-3"
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.productName}</h6>
                    <small className="text-muted">
                      SKU: {item.sku} | Qty: {item.quantity} | Price: ${item.price?.toFixed(2)}
                    </small>
                  </div>
                  <div className="text-end">
                    <strong>${(item.total || (item.price * item.quantity)).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Shipping Address */}
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0"><MapPin className="me-2" size={20} />Shipping Address</h4>
            </Card.Header>
            <Card.Body>
              <address className="mb-0">
                {order.shippingAddress?.addressLine1}<br />
                {order.shippingAddress?.addressLine2 && (
                  <>{order.shippingAddress.addressLine2}<br /></>
                )}
                {order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}<br />
                {order.shippingAddress?.country}
                {order.shippingAddress?.phoneNumber && (
                  <><br />Phone: {order.shippingAddress.phoneNumber}</>
                )}
              </address>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Order Total */}
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Order Summary</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between h5">
                <strong>Total:</strong>
                <strong>${grandTotal.toFixed(2)}</strong>
              </div>
            </Card.Body>
          </Card>

          {/* Next Steps */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0"><Clock className="me-2" size={20} />What's Next?</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Step 1</small>
                <div className="fw-semibold">Order Confirmation</div>
                <small>We'll send you an email confirmation</small>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Step 2</small>
                <div className="fw-semibold">Processing</div>
                <small>We'll prepare your items for shipment</small>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Step 3</small>
                <div className="fw-semibold">Shipping</div>
                <small>Your order will be shipped with tracking</small>
              </div>
              <div>
                <small className="text-muted d-block mb-1">Step 4</small>
                <div className="fw-semibold">Delivery</div>
                <small>Estimated delivery in 3-7 business days</small>
              </div>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              onClick={() => navigate('/shop')}
            >
              Continue Shopping
              <ArrowRight className="ms-2" size={16} />
            </Button>
            <Button 
              variant="outline-secondary"
              onClick={() => navigate('/profile')}
            >
              View All Orders
            </Button>
            <Button 
              variant="outline-info"
              onClick={() => window.print()}
            >
              Print Order
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderConfirmation;
