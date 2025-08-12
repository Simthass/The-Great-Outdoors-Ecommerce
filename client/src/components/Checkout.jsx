import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { CreditCard, Truck, MapPin, Receipt } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({ items: [] });
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });

  const [formData, setFormData] = useState({
    // Shipping Address
    shippingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada',
      phoneNumber: ''
    },
    // Billing Address
    billingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada',
      phoneNumber: ''
    },
    // Payment
    paymentMethod: 'Cash On Delivery',
    paymentId: '',
    notes: '',
    couponCode: '',
    useSameAddress: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    calculateOrderSummary();
  }, [cart]);

  useEffect(() => {
    if (formData.useSameAddress) {
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.shippingAddress }
      }));
    }
  }, [formData.useSameAddress, formData.shippingAddress]);

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        withCredentials: true
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    }
  };

  const calculateOrderSummary = () => {
    if (!cart.items || cart.items.length === 0) {
      return;
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    const tax = subtotal * 0.13; // 13% tax
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const discount = 0; // Apply coupon logic here
    const total = subtotal + tax + shipping - discount;

    setOrderSummary({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleDirectInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate shipping address
    const requiredShippingFields = ['addressLine1', 'city', 'province', 'postalCode'];
    requiredShippingFields.forEach(field => {
      if (!formData.shippingAddress[field]?.trim()) {
        newErrors[`shippingAddress.${field}`] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    // Validate billing address if different from shipping
    if (!formData.useSameAddress) {
      requiredShippingFields.forEach(field => {
        if (!formData.billingAddress[field]?.trim()) {
          newErrors[`billingAddress.${field}`] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
        }
      });
    }

    // Validate postal code format (basic validation)
    const postalCodeRegex = /^[A-Za-z0-9\s\-]+$/;
    if (formData.shippingAddress.postalCode && !postalCodeRegex.test(formData.shippingAddress.postalCode)) {
      newErrors['shippingAddress.postalCode'] = 'Invalid postal code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.useSameAddress ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        paymentId: formData.paymentId,
        notes: formData.notes,
        couponCode: formData.couponCode
      };

      const response = await axios.post('http://localhost:5000/api/orders/create', orderData, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${response.data.order._id}`, {
          state: { order: response.data.order }
        });
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="info" className="text-center">
          <h4>Your cart is empty</h4>
          <p>Add some items to your cart before checkout.</p>
          <Button variant="primary" onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4><MapPin className="me-2" size={20} />Shipping Address</h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address Line 1 *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.shippingAddress.addressLine1}
                        onChange={(e) => handleInputChange('shippingAddress', 'addressLine1', e.target.value)}
                        isInvalid={!!errors['shippingAddress.addressLine1']}
                        placeholder="Street address, apartment, suite, etc."
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors['shippingAddress.addressLine1']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address Line 2</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.shippingAddress.addressLine2}
                        onChange={(e) => handleInputChange('shippingAddress', 'addressLine2', e.target.value)}
                        placeholder="Apartment, suite, unit, building, etc."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                        isInvalid={!!errors['shippingAddress.city']}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors['shippingAddress.city']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Province *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.shippingAddress.province}
                        onChange={(e) => handleInputChange('shippingAddress', 'province', e.target.value)}
                        isInvalid={!!errors['shippingAddress.province']}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors['shippingAddress.province']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.shippingAddress.postalCode}
                        onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
                        isInvalid={!!errors['shippingAddress.postalCode']}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors['shippingAddress.postalCode']}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Select
                        value={formData.shippingAddress.country}
                        onChange={(e) => handleInputChange('shippingAddress', 'country', e.target.value)}
                      >
                        <option value="Canada">Canada</option>
                        <option value="United States">United States</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.shippingAddress.phoneNumber}
                        onChange={(e) => handleInputChange('shippingAddress', 'phoneNumber', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Billing Address */}
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h4><Receipt className="me-2" size={20} />Billing Address</h4>
                <Form.Check
                  type="checkbox"
                  label="Same as shipping address"
                  checked={formData.useSameAddress}
                  onChange={(e) => handleDirectInputChange('useSameAddress', e.target.checked)}
                />
              </div>
            </Card.Header>
            {!formData.useSameAddress && (
              <Card.Body>
                <Form>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Address Line 1 *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.billingAddress.addressLine1}
                          onChange={(e) => handleInputChange('billingAddress', 'addressLine1', e.target.value)}
                          isInvalid={!!errors['billingAddress.addressLine1']}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors['billingAddress.addressLine1']}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Address Line 2</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.billingAddress.addressLine2}
                          onChange={(e) => handleInputChange('billingAddress', 'addressLine2', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>City *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.billingAddress.city}
                          onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                          isInvalid={!!errors['billingAddress.city']}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors['billingAddress.city']}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Province *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.billingAddress.province}
                          onChange={(e) => handleInputChange('billingAddress', 'province', e.target.value)}
                          isInvalid={!!errors['billingAddress.province']}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors['billingAddress.province']}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Postal Code *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.billingAddress.postalCode}
                          onChange={(e) => handleInputChange('billingAddress', 'postalCode', e.target.value)}
                          isInvalid={!!errors['billingAddress.postalCode']}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors['billingAddress.postalCode']}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            )}
          </Card>

          {/* Payment Method */}
          <Card className="mb-4">
            <Card.Header>
              <h4><CreditCard className="me-2" size={20} />Payment Method</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={formData.paymentMethod}
                  onChange={(e) => handleDirectInputChange('paymentMethod', e.target.value)}
                >
                  <option value="Cash On Delivery">Cash On Delivery</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Order Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleDirectInputChange('notes', e.target.value)}
                  placeholder="Special instructions for your order..."
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Order Summary */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h4>Order Summary</h4>
            </Card.Header>
            <Card.Body>
              {/* Cart Items */}
              <div className="mb-3">
                {cart.items.map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <img
                      src={item.product?.imageUrl || '/placeholder.jpg'}
                      alt={item.product?.productName || 'Product'}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      className="rounded me-3"
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{item.product?.productName}</div>
                      <small className="text-muted">Qty: {item.quantity}</small>
                    </div>
                    <div className="fw-bold">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <hr />

              {/* Price Breakdown */}
              <div className="mb-2 d-flex justify-content-between">
                <span>Subtotal:</span>
                <span>${orderSummary.subtotal}</span>
              </div>
              <div className="mb-2 d-flex justify-content-between">
                <span>Tax (13%):</span>
                <span>${orderSummary.tax}</span>
              </div>
              <div className="mb-2 d-flex justify-content-between">
                <span>Shipping:</span>
                <span>{orderSummary.shipping === '0.00' ? 'FREE' : `$${orderSummary.shipping}`}</span>
              </div>
              {orderSummary.discount !== '0.00' && (
                <div className="mb-2 d-flex justify-content-between text-success">
                  <span>Discount:</span>
                  <span>-${orderSummary.discount}</span>
                </div>
              )}

              <hr />

              <div className="h5 d-flex justify-content-between">
                <span>Total:</span>
                <span>${orderSummary.total}</span>
              </div>

              <Button
                variant="success"
                size="lg"
                className="w-100 mt-3"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Truck className="me-2" size={20} />
                    Place Order
                  </>
                )}
              </Button>

              <small className="text-muted mt-2 d-block text-center">
                By placing your order, you agree to our Terms & Conditions
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
