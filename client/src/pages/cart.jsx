import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Configure axios to always send cookies
axios.defaults.withCredentials = true;

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCart = async () => {
      try {
        console.log("Fetching cart..."); // Debug log
        const response = await axios.get(`${API_URL}/cart`, {
          withCredentials: true,
        });
        console.log("Cart response:", response.data); // Debug log

        // Transform the data to ensure consistent structure
        const cartData = response.data || { items: [] };

        const processedItems = cartData.items.map((item) => {
          console.log("Processing item:", item); // Debug log
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
        setError("Failed to load cart. Please try again.");
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [API_URL]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await axios.put(
        `${API_URL}/cart/update/${itemId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      setCart(response.data);
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${itemId}`, {
        withCredentials: true,
      });
      setCart(response.data);
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading your cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl mb-4">Your cart is empty</p>
        <button
          onClick={handleContinueShopping}
          className="bg-[#8DC53E] text-white px-6 py-2 rounded-lg hover:bg-[#7AB32E] transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // Fix the price calculation - use product.price instead of item.price
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

                  {/* Price - Fixed to use product.price */}
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

            {/* Shipping Address */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Shipping Address</span>
                <button className="text-[#8DC53E] hover:underline font-medium">
                  Change Address
                </button>
              </div>
              <div className="text-gray-700">
                <p>No 35, CCH Lane,</p>
                <p>Kattankudy - 06, Batticaloa.</p>
              </div>
            </div>

            {/* Place Order Button */}
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#8DC53E] text-white text-xl font-semibold py-4 rounded-lg hover:bg-[#7AB32E] transition-colors duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
