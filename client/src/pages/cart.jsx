// Cart.jsx - FIXED VERSION
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ADDED REDUX
import axios from "axios";
import { getAuthToken, isLoggedIn } from "../utils/auth";

// Configure axios to always send cookies
axios.defaults.withCredentials = true;

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const navigate = useNavigate();

  // GET AUTHENTICATION STATE FROM REDUX
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  // CHECK AUTHENTICATION ON COMPONENT MOUNT
  useEffect(() => {
    console.log("Cart: Auth state:", { isAuthenticated, user });
    console.log("Cart: Token exists:", !!getAuthToken());

    if (!isAuthenticated || !getAuthToken()) {
      console.log("Cart: User not authenticated, redirecting to login");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    fetchCart();
    fetchAddresses();
  }, [isAuthenticated, navigate]);

  // Configure axios interceptor to include auth token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  const fetchCart = async () => {
    try {
      console.log("Fetching cart...");
      const token = getAuthToken();

      if (!token) {
        navigate("/login", { state: { from: "/cart" } });
        return;
      }

      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log("Cart response:", response.data);

      const cartData = response.data || { items: [] };
      const processedItems = cartData.items.map((item) => {
        return {
          ...item,
          product: item.product || {
            _id: item.product?._id || "unknown",
            productName: item.product?.productName || "Unknown Product",
            price: item.product?.price || 0,
            imageUrl: item.product?.imageUrl || "/products/placeholder.jpg",
            brand: item.product?.brand || "",
          },
        };
      });

      setCart({
        ...cartData,
        items: processedItems,
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        setError("Failed to load cart. Please try again.");
      }
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate("/login", { state: { from: "/cart" } });
        return;
      }

      setAddressLoading(true);
      const response = await axios.get(`${API_URL}/settings/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const addressList = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setAddresses(addressList);

      const defaultAddress = addressList.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0]);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        setError("Failed to load addresses. Please try again.");
      }
    } finally {
      setAddressLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/cart/update/${itemId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setCart(response.data);
    } catch (err) {
      console.error("Error updating quantity:", err);
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        alert("Failed to update quantity. Please try again.");
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCart(response.data);
    } catch (err) {
      console.error("Error removing item:", err);
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: "/cart" } });
      } else {
        alert("Failed to remove item. Please try again.");
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated || !getAuthToken()) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }

    navigate("/checkout");
  };

  const handleChangeAddressClick = () => {
    if (!isAuthenticated || !getAuthToken()) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    setShowAddressModal(true);
  };

  const handleAddAddress = () => {
    navigate("/settings/addresses");
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleRefreshAddresses = async () => {
    await fetchAddresses();
  };

  const handleLoginRedirect = () => {
    navigate("/login", { state: { from: "/cart" } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading your cart...</div>
      </div>
    );
  }

  if (!isAuthenticated || !getAuthToken()) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl mb-4 text-red-500">
          Please log in to view your cart
        </p>
        <button
          onClick={() => navigate("/login", { state: { from: "/cart" } })}
          className="bg-[#8DC53E] text-white px-6 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl mb-4">Your cart is empty</p>
        <button
          onClick={() => navigate("/shop")}
          className="bg-[#8DC53E] text-white px-6 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const itemPrice = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shipping = 500.0;
  const totalCost = itemPrice + shipping;

  return (
    <div>
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">Cart</p>
      </div>
      <div className="flex justify-between mx-[75px] mt-12 mb-8 gap-8">
        {/* Left Section - Cart Items */}
        <div className="flex-1 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">
              Shopping Cart{" "}
              <span className="text-xl font-light">
                ({cart.items.length}{" "}
                {cart.items.length === 1 ? "Product" : "Products"})
              </span>
            </h1>

            {/* Table Headers */}
            <div className="flex justify-between items-center text-xl font-medium mb-4">
              <div className="flex-1">Product Details</div>
              <div className="w-24 text-center">Count</div>
              <div className="w-32 text-center">Price</div>
              <div className="w-8"></div>
            </div>
            <hr className="border-gray-300 mb-6" />
          </div>

          {/* Cart Items */}
          <div className="space-y-6">
            {cart.items.map((item, index) => (
              <div key={item._id}>
                <div className="flex items-center justify-between py-4">
                  {/* Product Image and Details */}
                  <div className="flex items-center flex-1">
                    <div className="w-24 h-20 mr-6 flex-shrink-0">
                      <img
                        src={
                          item.product.imageUrl
                            ? `${BASE_URL}${item.product.imageUrl}`
                            : "/products/placeholder.jpg"
                        }
                        alt={item.product.productName}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = "/products/placeholder.jpg";
                        }}
                      />
                    </div>
                    <p className="text-base font-medium max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.product.productName}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-center w-24">
                    <button
                      className={`w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center transition-colors ${
                        item.quantity <= 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <span className="text-sm font-medium">-</span>
                    </button>
                    <span className="mx-4 text-lg font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        handleQuantityChange(item._id, item.quantity + 1)
                      }
                    >
                      <span className="text-sm font-medium">+</span>
                    </button>
                  </div>

                  {/* Price */}
                  <div className="w-32 text-center">
                    <span className="text-lg font-medium">
                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <div className="w-8 text-center">
                    <button
                      className="text-xl font-bold hover:text-red-500 transition-colors"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                {index < cart.items.length - 1 && (
                  <hr className="border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Summary */}
        <div className="w-[440px] h-[640px] border border-gray-300 rounded-xl p-8 sticky top-4">
          <h2 className="text-2xl font-medium mb-8">Summary</h2>

          <div className="space-y-6">
            {/* Item Price */}
            <div className="flex justify-between items-center">
              <span className="text-lg">
                Item Price ({cart.items.length}{" "}
                {cart.items.length === 1 ? "Item" : "Items"})
              </span>
              <span className="text-lg font-medium">
                Rs. {itemPrice.toFixed(2)}
              </span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center">
              <span className="text-lg">Shipping</span>
              <span className="text-lg font-medium">
                Rs. {shipping.toFixed(2)}
              </span>
            </div>

            <hr className="border-gray-300" />

            {/* Total Cost */}
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total Cost</span>
              <span className="text-xl font-bold">
                Rs. {totalCost.toFixed(2)}
              </span>
            </div>

            <hr className="border-gray-300 my-8" />

            {/* Shipping Address Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Shipping Address</span>
                <button
                  className="text-[#8DC53E] hover:underline font-medium text-sm"
                  onClick={handleChangeAddressClick}
                >
                  Change Address
                </button>
              </div>

              {/* Address Loading State */}
              {addressLoading && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#8DC53E]"></div>
                  <span className="text-sm">Loading addresses...</span>
                </div>
              )}

              {/* Selected Address Display */}
              {selectedAddress && !addressLoading && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-800">
                          {selectedAddress.addressType}
                        </span>
                        {selectedAddress.isDefault && (
                          <span className="bg-[#8DC53E] text-white text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">
                        {selectedAddress.addressLine1}
                      </p>
                      {selectedAddress.addressLine2 && (
                        <p className="text-gray-700 text-sm">
                          {selectedAddress.addressLine2}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm">
                        {selectedAddress.city}, {selectedAddress.province}{" "}
                        {selectedAddress.postalCode}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedAddress.country}
                      </p>
                      {selectedAddress.phoneNumber && (
                        <p className="text-gray-600 text-sm">
                          Phone: {selectedAddress.phoneNumber}
                        </p>
                      )}
                      {selectedAddress.instructions && (
                        <p className="text-gray-500 text-sm mt-1">
                          Instructions: {selectedAddress.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No Address Selected State */}
              {!selectedAddress && !addressLoading && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      No address selected
                    </p>
                    <button
                      onClick={handleAddAddress}
                      className="text-[#8DC53E] hover:underline mt-2 text-sm font-medium"
                    >
                      + Add Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className={`w-full text-xl font-semibold py-4 rounded-lg transition-colors duration-200 ${
                selectedAddress
                  ? "bg-[#8DC53E] text-white hover:bg-[#7AB32E] cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!selectedAddress}
            >
              {!selectedAddress
                ? "Please Select an Address"
                : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Select Delivery Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Refresh Button */}
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={handleRefreshAddresses}
                disabled={addressLoading}
                className="text-sm text-[#8DC53E] hover:underline flex items-center space-x-1 disabled:opacity-50"
              >
                {addressLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-[#8DC53E]"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <span>🔄 Refresh Addresses</span>
                )}
              </button>

              <button
                onClick={handleAddAddress}
                className="bg-[#8DC53E] text-white px-4 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors text-sm font-medium flex items-center space-x-1"
              >
                <span>+</span>
                <span>Add New Address</span>
              </button>
            </div>

            {/* Addresses List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddress && selectedAddress._id === address._id
                        ? "border-[#8DC53E] bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-800">
                            {address.addressType}
                          </span>
                          {address.isDefault && (
                            <span className="bg-[#8DC53E] text-white text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">
                          {address.addressLine1}
                        </p>
                        {address.addressLine2 && (
                          <p className="text-gray-700 text-sm">
                            {address.addressLine2}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm">
                          {address.city}, {address.province}{" "}
                          {address.postalCode}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {address.country}
                        </p>
                        {address.phoneNumber && (
                          <p className="text-gray-600 text-sm">
                            Phone: {address.phoneNumber}
                          </p>
                        )}
                        {address.instructions && (
                          <p className="text-gray-500 text-sm mt-1">
                            Instructions: {address.instructions}
                          </p>
                        )}
                      </div>
                      {selectedAddress &&
                        selectedAddress._id === address._id && (
                          <div className="ml-2">
                            <span className="text-[#8DC53E] text-xl">✓</span>
                          </div>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-gray-500 text-center py-4 text-lg">
                    No addresses found
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Add your first address to continue with checkout
                  </p>
                  <button
                    onClick={handleAddAddress}
                    className="bg-[#8DC53E] text-white px-6 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors font-medium"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowAddressModal(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
