import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Lock,
  MapPin,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const Checkout = () => {
  const [cartSummary, setCartSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
    phoneNumber: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
    phoneNumber: ''
  });
  
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [notes, setNotes] = useState('');

  const navigate = useNavigate();

  // Fetch cart summary
  const fetchCartSummary = async (coupon = null) => {
    setLoading(true);
    try {
      const params = {};
      if (coupon || appliedCoupon) {
        params.couponCode = coupon || appliedCoupon.code;
      }
      
      const response = await axios.get('/api/cart/summary', { params });
      
      if (!response.data.items || response.data.items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      
      setCartSummary(response.data);
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      toast.error('Failed to load cart summary');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }
    
    fetchCartSummary();
  }, []);

  // Apply coupon code
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const response = await axios.post('/api/cart/coupon', {
        couponCode: couponCode.trim()
      });
      
      setAppliedCoupon(response.data.coupon);
      setCouponCode('');
      fetchCartSummary(response.data.coupon.code);
      toast.success(`Coupon applied! You saved ${formatCurrency(response.data.coupon.discount)}`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    fetchCartSummary();
    toast.info('Coupon removed');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      // Validate addresses
      if (!validateAddress(shippingAddress)) {
        toast.error('Please fill in all required shipping address fields');
        return;
      }
      
      if (!billingAddressSame && !validateAddress(billingAddress)) {
        toast.error('Please fill in all required billing address fields');
        return;
      }
      
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      await createOrder();
    }
  };

  // Validate address
  const validateAddress = (address) => {
    return address.addressLine1 && 
           address.city && 
           address.province && 
           address.postalCode && 
           address.country;
  };

  // Create order
  const createOrder = async () => {
    setProcessing(true);
    
    try {
      const orderData = {
        shippingAddress,
        billingAddress: billingAddressSame ? shippingAddress : billingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        notes
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrderId(response.data.order._id);
      setOrderCreated(true);
      toast.success('Order placed successfully!');
      
      // Clear cart after successful order
      await axios.delete('/api/cart/clear');
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  // Canadian provinces
  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-lg font-medium text-gray-900">{orderId}</p>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/orders"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-200 block text-center"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition duration-200 block text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="mt-4 flex items-center">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Shipping & Billing</span>
            </div>
            
            <div className="mx-4 h-px bg-gray-300 flex-1"></div>
            
            <div className={`flex items-center ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment & Review</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Shipping Address */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <MapPin className="h-5 w-5 text-green-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={shippingAddress.addressLine1}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={shippingAddress.addressLine2}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Province *
                        </label>
                        <select
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={shippingAddress.province}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, province: e.target.value }))}
                        >
                          <option value="">Select Province</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={shippingAddress.phoneNumber}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={billingAddressSame}
                          onChange={(e) => setBillingAddressSame(e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Same as shipping address</span>
                      </label>
                    </div>
                    
                    {!billingAddressSame && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={billingAddress.addressLine1}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={billingAddress.addressLine2}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Province *
                          </label>
                          <select
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={billingAddress.province}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, province: e.target.value }))}
                          >
                            <option value="">Select Province</option>
                            {provinces.map(province => (
                              <option key={province} value={province}>{province}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={billingAddress.postalCode}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={billingAddress.phoneNumber}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  {/* Payment Method */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {['Credit Card', 'Debit Card', 'PayPal', 'Cash On Delivery'].map(method => (
                        <label key={method} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-3 font-medium">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
                    <textarea
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Any special instructions for your order..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Order Review */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                    <div className="space-y-4">
                      {cartSummary?.items.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4">
                          <img
                            src={item.product?.images?.[0] || '/api/placeholder/60/60'}
                            alt={item.product?.name}
                            className="w-15 h-15 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.product?.name}</h3>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Back to Addresses
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={processing}
                  className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                    currentStep === 1 ? 'ml-auto' : ''
                  }`}
                >
                  {processing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {currentStep === 1 ? 'Continue to Payment' : 'Place Order'}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                {/* Coupon Code */}
                {currentStep === 1 && (
                  <div className="mb-6">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-800">
                          {appliedCoupon.code} applied
                        </span>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Coupon Code
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={applyCoupon}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Breakdown */}
                {cartSummary && (
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cartSummary.summary.itemCount} items)</span>
                      <span className="font-medium">{formatCurrency(cartSummary.summary.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (HST 13%)</span>
                      <span className="font-medium">{formatCurrency(cartSummary.summary.tax)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-600">Shipping</span>
                      </div>
                      <span className="font-medium">
                        {cartSummary.summary.shipping === 0 ? 'Free' : formatCurrency(cartSummary.summary.shipping)}
                      </span>
                    </div>
                    
                    {cartSummary.summary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatCurrency(cartSummary.summary.discount)}</span>
                      </div>
                    )}
                    
                    <hr className="my-4" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(cartSummary.summary.total)}</span>
                    </div>
                  </div>
                )}

                {/* Security Info */}
                <div className="flex items-center text-gray-600 text-sm">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Your payment information is secure</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
