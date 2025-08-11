import React from "react";
import { Link } from "react-router-dom"; // ✅ import Link

const AdminDashboard = () => {
  return (
    <div>
      <div className="w-full h-[150px] bg-[url(/page-name.png)] bg-cover bg-center bg-no-repeat flex flex-wrap items-center mb-20 ">
        <p className="text-[50px] pl-[70px] text-[#ffffff] m-[0px]">
          Admin Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mr-[75px] ml-[75px]">
        {/* User Management */}
        <Link to="/admin/users">
          <div
            className="relative rounded-xl shadow-lg h-44 bg-cover bg-center hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('/User-Mana.png')" }}
          >
            <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center rounded-xl">
              <h2 className="text-white text-lg font-semibold text-center px-2">
                User Management
              </h2>
            </div>
          </div>
        </Link>

        {/* Order Management */}
        <Link to="/Admin/Order">
          <div
            className="relative rounded-xl shadow-lg h-44 bg-cover bg-center hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('/Order-Management.png')" }}
          >
            <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center rounded-xl">
              <h2 className="text-white text-lg font-semibold text-center px-2">
                Order Management
              </h2>
            </div>
          </div>
        </Link>

        {/* Employee Management */}
        <Link to="/admin/employees">
          <div
            className="relative rounded-xl shadow-lg h-44 bg-cover bg-center hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('/Employee Management.png')" }}
          >
            <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center rounded-xl">
              <h2 className="text-white text-lg font-semibold text-center px-2">
                Employee Management
              </h2>
            </div>
          </div>
        </Link>

        {/* Product Management */}
        <Link to="/admin/products">
          <div
            className="relative rounded-xl shadow-lg h-44 bg-cover bg-center hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('/Product-Management.png')" }}
          >
            <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center rounded-xl">
              <h2 className="text-white text-lg font-semibold text-center px-2">
                Product Management
              </h2>
            </div>
          </div>
        </Link>

        {/* Inventory Management */}
        <Link to="/admin/inventory">
          <div
            className="relative rounded-xl shadow-lg h-44 bg-cover bg-center hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('/Inventory-Management.png')" }}
          >
            <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center rounded-xl">
              <h2 className="text-white text-lg font-semibold text-center px-2">
                Inventory Management
              </h2>
            </div>
          </div>
        </Link>

        {/* Review Management */}
        <Link to="/admin/reviews">
          <div
            className="relative rounded-xl shadow-lg h-44 bg-cover bg-center hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: "url('/Review-Management.png')" }}
          >
            <div className="absolute inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center rounded-xl">
              <h2 className="text-white text-lg font-semibold text-center px-2">
                Review Management
              </h2>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
