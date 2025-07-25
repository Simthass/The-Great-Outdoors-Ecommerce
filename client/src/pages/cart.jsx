import React from "react";

const Cart = () => {
  const cartItems = [
    {
      id: 1,
      image: "/products/product 1.jpg",
      name: "Rainleaf Microfiber Towel Perfect Travel & Gym & Camping Towel.",
      quantity: 2,
      price: 1500.0,
    },
    {
      id: 2,
      image: "/products/product 2.jpg",
      name: "Rainleaf Microfiber Towel Perfect Travel & Gym & Camping Towel with Extra Long Name That Should Be Truncated.",
      quantity: 1,
      price: 6000.0,
    },
    {
      id: 3,
      image: "/products/product 3.jpg",
      name: "Rainleaf Microfiber Towel Perfect Travel & Gym & Camping Towel.",
      quantity: 3,
      price: 12000.0,
    },
    {
      id: 4,
      image: "/products/product 4.jpg",
      name: "Rainleaf Microfiber Towel Perfect Travel & Gym & Camping Towel.",
      quantity: 3,
      price: 12000.0,
    },
  ];

  const itemPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 500.0;
  const totalCost = itemPrice + shipping;

  return (
    <div>
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center ">
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
                ({cartItems.length} Products)
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
            {cartItems.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center justify-between py-4">
                  {/* Product Image and Details */}
                  <div className="flex items-center flex-1">
                    <div className="w-24 h-20 mr-6 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <p className="text-base font-medium max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.name}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-center w-24">
                    <button className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium">-</span>
                    </button>
                    <span className="mx-4 text-lg font-medium">
                      {item.quantity}
                    </span>
                    <button className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium">+</span>
                    </button>
                  </div>

                  {/* Price */}
                  <div className="w-32 text-center">
                    <span className="text-lg font-medium">
                      {item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <div className="w-8 text-center">
                    <button className="text-xl font-bold hover:text-red-500 transition-colors">
                      ×
                    </button>
                  </div>
                </div>
                {index < cartItems.length - 1 && (
                  <hr className="border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Summary */}
        <div className="w-[440px] h-[640px] border border-gray-300 rounded-xl p-8">
          <h2 className="text-2xl font-medium mb-8">Summary</h2>

          <div className="space-y-6">
            {/* Item Price */}
            <div className="flex justify-between items-center">
              <span className="text-lg">
                Item Price ({cartItems.length} Items)
              </span>
              <span className="text-lg font-medium">
                {itemPrice.toFixed(2)}
              </span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center">
              <span className="text-lg">Shipping</span>
              <span className="text-lg font-medium">{shipping.toFixed(2)}</span>
            </div>

            <hr className="border-gray-300" />

            {/* Total Cost */}
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total Cost</span>
              <span className="text-xl font-bold">{totalCost.toFixed(2)}</span>
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
            <button className="w-full bg-[#8DC53E] text-white text-xl font-semibold py-4 rounded-lg hover:bg-[#7AB32E] transition-colors duration-200">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
