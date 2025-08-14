import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Percent,
  Truck,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartSummary, setCartSummary] = useState(null);
  const navigate = useNavigate();

  // Fetch cart data
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart summary with calculations
  const fetchCartSummary = async (coupon = null) => {
    try {
      const params = {};
      if (coupon || appliedCoupon) {
        params.couponCode = coupon || appliedCoupon.code;
      }
      
      const response = await axios.get('/api/cart/summary', { params });
      setCartSummary(response.data);
    } catch (error) {
      console.error('Error fetching cart summary:', error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchCartSummary();
  }, []);

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      const response = await axios.put(`/api/cart/item/${productId}`, {
        quantity: newQuantity
      });
      setCart(response.data.cart);
      fetchCartSummary(appliedCoupon?.code);
      toast.success('Cart updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    setUpdating(true);
    try {
      const response = await axios.delete(`/api/cart/item/${productId}`);
      setCart(response.data.cart);
      fetchCartSummary(appliedCoupon?.code);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    setUpdating(true);
    try {
      const response = await axios.delete('/api/cart/clear');
      setCart(response.data.cart);
      setCartSummary(null);
      setAppliedCoupon(null);
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  // Apply coupon code
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setUpdating(true);
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
    } finally {
      setUpdating(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    fetchCartSummary();
    toast.info('Coupon removed');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please log in to proceed with checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">{cart.itemCount} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    disabled={updating}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.images?.[0] || '/api/placeholder/80/80'}
                          alt={item.product?.name || 'Product'}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product?.brand} • SKU: {item.product?.sku}
                        </p>
                        <p className="text-lg font-semibold text-green-600 mt-2">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={updating}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-800 mt-2 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        {appliedCoupon.code} applied
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
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
                        onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={updating || !couponCode.trim()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Breakdown */}
              {cartSummary ? (
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
              ) : (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>
                </div>
              )}

              {/* Shipping Info */}
              <div className="bg-blue-50 p-3 rounded-lg mb-6">
                <div className="flex items-center text-blue-800">
                  <Truck className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {cartSummary?.summary?.subtotal > 100 ? 
                      'Free shipping on orders over $100!' : 
                      `Add ${formatCurrency(100 - (cartSummary?.summary?.subtotal || cart.total))} more for free shipping`
                    }
                  </span>
                </div>
              </div>

              {/* Security Info */}
              <div className="flex items-center text-gray-600 mb-6">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <span className="text-sm">Secure checkout with SSL encryption</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={updating}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </button>
                
                <Link
                  to="/products"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition duration-200 text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
