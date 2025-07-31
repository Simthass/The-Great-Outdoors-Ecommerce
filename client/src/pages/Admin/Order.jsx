import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch orders from backend API
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders'); // Make sure this endpoint is defined in server/routes/orders.js
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="order-dashboard">
      <style>{`
        .order-dashboard {
          font-family: sans-serif;
          padding: 20px;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .order-header h2 {
          margin: 0;
        }
        .order-header nav a {
          margin-left: 20px;
          text-decoration: none;
          color: #555;
        }
        .order-table {
          margin-top: 20px;
          width: 100%;
          border-collapse: collapse;
        }
        .order-table th, .order-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .order-table th {
          background-color: #f4f4f4;
        }
      `}</style>

      <header className="order-header">
        <h2>Admin Dashboard</h2>
        <nav>
          <a href="#inventory">Inventory Management</a>
          <a href="#orders">Order Management</a>
        </nav>
      </header>

      <section className="order-management" id="orders">
        <h3>Order Management</h3>
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4">No orders found.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id || order.id}>
                    <td>{order._id || order.id}</td>
                    <td>{order.customerName || order.user?.name || 'N/A'}</td>
                    <td>${order.totalAmount || order.total || 0}</td>
                    <td>{order.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Order;