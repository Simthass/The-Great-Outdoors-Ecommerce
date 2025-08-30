import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  PieChart,
  BarChart3,
  MapPin,
  Activity,
  ShoppingCart,
  UserCheck,
  AlertCircle,
} from "lucide-react";

const UserReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [progress, setProgress] = useState(0);

  // Enhanced data fetching with comprehensive analytics
  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Set up progress tracking
      setProgress(10);

      // Fetch users data
      const usersResponse = await fetch("/api/users/all?limit=9999", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setProgress(30);

      // Fetch orders data for user activity analysis
      const ordersResponse = await fetch("/api/orders/all?limit=9999", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setProgress(50);

      const usersData = await usersResponse.json();
      const ordersData = await ordersResponse.json();

      setProgress(70);

      if (usersData.success) {
        const users = usersData.data.users;
        const orders = ordersData.success ? ordersData.data.orders : [];

        console.log("Users:", users.length);
        console.log("Orders:", orders.length);
        console.log("Sample order:", orders[0]); // Debug log

        // Advanced data processing
        const processedData = {
          // Basic metrics
          totalUsers: users.length,
          customers: users.filter((u) => u.role === "Customer").length,
          employees: users.filter((u) => u.role === "Employee").length,
          admins: users.filter((u) => u.role === "Admin").length,
          activeUsers: users.filter((u) => u.isActive).length,
          inactiveUsers: users.filter((u) => !u.isActive).length,

          // Time-based analytics
          monthlyGrowth: calculateMonthlyGrowth(users),
          quarterlyGrowth: calculateQuarterlyGrowth(users),
          yearlyGrowth: calculateYearlyGrowth(users),
          dailyRegistrations: getDailyRegistrations(users),
          registrationTrend: getRegistrationTrend(users),

          // Geographic analytics
          topCities: getTopCities(users),
          topStates: getTopStates(users),
          geographicDistribution: getGeographicDistribution(users),

          // User activity analytics
          userOrderAnalytics: getUserOrderAnalytics(users, orders),
          topCustomers: getTopCustomers(users, orders),
          inactiveCustomers: getInactiveCustomers(users, orders),

          // Advanced metrics
          userEngagementScore: calculateUserEngagement(users, orders),
          retentionMetrics: calculateRetentionMetrics(users, orders),
          demographicBreakdown: getDemographicBreakdown(users),

          // Time series data for charts
          monthlyUserGrowth: getMonthlyUserGrowthData(users),
          roleDistributionOverTime: getRoleDistributionOverTime(users),
        };

        setProgress(100);
        return processedData;
      }

      throw new Error("Failed to fetch user data");
    } catch (error) {
      console.error("Error fetching report data:", error);
      throw error;
    }
  };

  // Enhanced calculation functions
  const calculateMonthlyGrowth = (users) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const recentUsers = users.filter(
      (u) => new Date(u.createdAt) >= thirtyDaysAgo
    ).length;
    const previousUsers = users.filter((u) => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    return previousUsers === 0
      ? 0
      : (((recentUsers - previousUsers) / previousUsers) * 100).toFixed(1);
  };

  const calculateQuarterlyGrowth = (users) => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
    const oneEightyDaysAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);

    const currentQuarter = users.filter(
      (u) => new Date(u.createdAt) >= ninetyDaysAgo
    ).length;
    const previousQuarter = users.filter((u) => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= oneEightyDaysAgo && createdAt < ninetyDaysAgo;
    }).length;

    return previousQuarter === 0
      ? 0
      : (((currentQuarter - previousQuarter) / previousQuarter) * 100).toFixed(
          1
        );
  };

  const calculateYearlyGrowth = (users) => {
    const now = new Date();
    const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);
    const twoYearsAgo = new Date(now - 730 * 24 * 60 * 60 * 1000);

    const currentYear = users.filter(
      (u) => new Date(u.createdAt) >= oneYearAgo
    ).length;
    const previousYear = users.filter((u) => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= twoYearsAgo && createdAt < oneYearAgo;
    }).length;

    return previousYear === 0
      ? 0
      : (((currentYear - previousYear) / previousYear) * 100).toFixed(1);
  };

  const getDailyRegistrations = (users) => {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const count = users.filter((u) => {
        const createdAt = new Date(u.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      last7Days.push({
        date: dayStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count,
      });
    }
    return last7Days;
  };

  const getTopCities = (users) => {
    const cityCount = {};
    users.forEach((user) => {
      if (user.city) {
        cityCount[user.city] = (cityCount[user.city] || 0) + 1;
      }
    });

    return Object.entries(cityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));
  };

  const getTopStates = (users) => {
    const stateCount = {};
    users.forEach((user) => {
      if (user.state) {
        stateCount[user.state] = (stateCount[user.state] || 0) + 1;
      }
    });

    return Object.entries(stateCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }));
  };

  const getUserOrderAnalytics = (users, orders) => {
    const userOrderMap = {};

    orders.forEach((order) => {
      const userId = order.user?.toString() || order.user;
      userOrderMap[userId] = (userOrderMap[userId] || 0) + 1;
    });

    return users
      .map((user) => {
        const userId = user._id?.toString() || user._id;
        return {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          orderCount: userOrderMap[userId] || 0,
          isActive: user.isActive,
          city: user.city || "Not Set",
          state: user.state || "Not Set",
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount);
  };

  const getTopCustomers = (users, orders) => {
    const userOrderMap = {};
    const userSpendingMap = {};

    console.log("Processing orders for customer analysis:", orders.length);

    // Process orders to calculate order count and spending per user
    orders.forEach((order) => {
      // Handle different user ID formats
      let userId = null;
      if (order.user) {
        if (typeof order.user === "object" && order.user._id) {
          userId = order.user._id.toString();
        } else if (typeof order.user === "string") {
          userId = order.user;
        } else {
          userId = order.user.toString();
        }
      }

      if (userId) {
        userOrderMap[userId] = (userOrderMap[userId] || 0) + 1;

        // Calculate total amount including tax and shipping, minus discount
        const totalAmount = parseFloat(order.totalAmount) || 0;
        const tax = parseFloat(order.tax) || 0;
        const shipping = parseFloat(order.shippingCost) || 0;
        const discount = parseFloat(order.discount) || 0;

        const orderTotal = totalAmount + tax + shipping - discount;
        userSpendingMap[userId] = (userSpendingMap[userId] || 0) + orderTotal;
      }
    });

    console.log(
      "User order map:",
      Object.keys(userOrderMap).length,
      "users have orders"
    );
    console.log(
      "User spending map:",
      Object.keys(userSpendingMap).length,
      "users have spending"
    );

    // Create customer analytics with real data
    const customerAnalytics = users
      .filter((u) => u.role === "Customer")
      .map((user) => {
        const userId = user._id?.toString() || user._id;
        return {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          orders: userOrderMap[userId] || 0,
          totalSpent: userSpendingMap[userId] || 0,
          city: user.city || "Not Specified",
          state: user.state || "Not Specified",
          location:
            user.city && user.state
              ? `${user.city}, ${user.state}`
              : user.city || user.state || "Location Not Set",
          isActive: user.isActive,
          joinDate: user.createdAt,
        };
      })
      .sort((a, b) => b.orders - a.orders) // Sort by order count
      .slice(0, 10); // Get top 10

    console.log("Top customers processed:", customerAnalytics.slice(0, 3));
    return customerAnalytics;
  };

  const getInactiveCustomers = (users, orders) => {
    const userOrderMap = {};
    orders.forEach((order) => {
      const userId = order.user?.toString() || order.user;
      userOrderMap[userId] = Math.max(
        userOrderMap[userId] || 0,
        new Date(order.createdAt).getTime()
      );
    });

    const thirtyDaysAgo = new Date() - 30 * 24 * 60 * 60 * 1000;

    return users.filter(
      (u) =>
        u.role === "Customer" &&
        userOrderMap[u._id] &&
        userOrderMap[u._id] < thirtyDaysAgo
    ).length;
  };

  const getRegistrationTrend = (users) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();
    const trend = [];

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      const monthStart = new Date();
      monthStart.setMonth(currentMonth - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthUsers = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= monthStart && createdAt < monthEnd;
      }).length;

      trend.push({ month: monthName, users: monthUsers });
    }

    return trend;
  };

  const generateChartSVG = (data, type, width = 400, height = 200) => {
    if (type === "line") {
      const maxValue = Math.max(...data.map((d) => d.users));
      const points = data
        .map((d, i) => {
          const x = (i * width) / (data.length - 1);
          const y = height - (d.users / maxValue) * height * 0.8 - 20;
          return `${x},${y}`;
        })
        .join(" ");

      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0" />
            </linearGradient>
          </defs>
          <polyline points="${points}" fill="none" stroke="#22c55e" stroke-width="3"/>
          <polygon points="0,${height} ${points} ${width},${height}" fill="url(#lineGradient)"/>
          ${data
            .map((d, i) => {
              const x = (i * width) / (data.length - 1);
              const y = height - (d.users / maxValue) * height * 0.8 - 20;
              return `<circle cx="${x}" cy="${y}" r="4" fill="#22c55e"/>`;
            })
            .join("")}
        </svg>
      `;
    }

    if (type === "bar") {
      const maxValue = Math.max(...data.map((d) => d.count));
      const barWidth = width / data.length - 10;

      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          ${data
            .map((d, i) => {
              const barHeight = (d.count / maxValue) * height * 0.8;
              const x = i * (width / data.length) + 5;
              const y = height - barHeight - 20;
              return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#3b82f6" rx="4"/>
              <text x="${x + barWidth / 2}" y="${
                height - 5
              }" text-anchor="middle" font-size="10" fill="#666">${
                d.city
              }</text>
              <text x="${x + barWidth / 2}" y="${
                y - 5
              }" text-anchor="middle" font-size="10" fill="#333">${
                d.count
              }</text>
            `;
            })
            .join("")}
        </svg>
      `;
    }

    if (type === "donut") {
      const total = data.reduce((sum, d) => sum + d.value, 0);
      let currentAngle = -90;
      const radius = 80;
      const centerX = width / 2;
      const centerY = height / 2;
      const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

      const paths = data
        .map((d, i) => {
          const angle = (d.value / total) * 360;
          const startAngle = currentAngle * (Math.PI / 180);
          const endAngle = (currentAngle + angle) * (Math.PI / 180);

          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);

          const largeArcFlag = angle > 180 ? 1 : 0;

          currentAngle += angle;

          return `
          <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" 
                fill="${colors[i % colors.length]}" opacity="0.8"/>
        `;
        })
        .join("");

      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          ${paths}
          <circle cx="${centerX}" cy="${centerY}" r="40" fill="white"/>
          <text x="${centerX}" y="${centerY}" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">Total</text>
          <text x="${centerX}" y="${
        centerY + 15
      }" text-anchor="middle" font-size="12" fill="#666">${total}</text>
        </svg>
      `;
    }
  };

  // Generate enhanced PDF report
  const generatePDFReport = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const data = await fetchReportData();
      setReportData(data);

      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>User Analytics Report - The Great Outdoors</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            @page {
              margin: 0;
              size: A4;
            }
            
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
            
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: #ffffff;
            }
            
            .report-container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 30px 0;
              border-bottom: 3px solid #22c55e;
              margin-bottom: 40px;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
              gap: 20px;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #22c55e, #16a34a);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
            }
            
            .company-info h1 {
              font-size: 32px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 4px;
            }
            
            .company-info p {
              color: #6b7280;
              font-size: 16px;
              font-weight: 500;
            }
            
            .report-meta {
              text-align: right;
              font-size: 14px;
              color: #6b7280;
            }
            
            .report-meta strong {
              color: #374151;
            }
            
            .hero-section {
              background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
              color: white;
              padding: 40px;
              border-radius: 20px;
              margin-bottom: 40px;
              position: relative;
              overflow: hidden;
            }
            
            .hero-section::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 200px;
              height: 200px;
              background: linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1));
              border-radius: 50%;
              transform: translate(50%, -50%);
            }
            
            .hero-content {
              position: relative;
              z-index: 1;
            }
            
            .hero-content h2 {
              font-size: 36px;
              font-weight: 800;
              margin-bottom: 12px;
            }
            
            .hero-content p {
              font-size: 18px;
              opacity: 0.9;
              margin-bottom: 20px;
            }
            
            .hero-stats {
              display: flex;
              gap: 30px;
              margin-top: 20px;
            }
            
            .hero-stat {
              text-align: center;
            }
            
            .hero-stat-number {
              font-size: 28px;
              font-weight: 700;
              display: block;
            }
            
            .hero-stat-label {
              font-size: 14px;
              opacity: 0.8;
            }
            
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 24px;
              margin-bottom: 40px;
            }
            
            .kpi-card {
              background: white;
              border-radius: 16px;
              padding: 28px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.06);
              border: 1px solid #f1f5f9;
              position: relative;
              overflow: hidden;
            }
            
            .kpi-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 4px;
              height: 100%;
              background: var(--accent-color);
            }
            
            .kpi-card.total { --accent-color: #3b82f6; }
            .kpi-card.customers { --accent-color: #22c55e; }
            .kpi-card.employees { --accent-color: #f59e0b; }
            .kpi-card.admins { --accent-color: #ef4444; }
            
            .kpi-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            
            .kpi-icon {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              color: white;
            }
            
            .kpi-number {
              font-size: 32px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 4px;
            }
            
            .kpi-label {
              color: #6b7280;
              font-size: 14px;
              font-weight: 500;
            }
            
            .kpi-change {
              font-size: 12px;
              font-weight: 600;
              padding: 4px 8px;
              border-radius: 6px;
              margin-top: 8px;
              display: inline-block;
            }
            
            .kpi-change.positive {
              background: #dcfce7;
              color: #166534;
            }
            
            .kpi-change.negative {
              background: #fef2f2;
              color: #dc2626;
            }
            
            .section {
              margin-bottom: 50px;
            }
            
            .section-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 24px;
              padding-bottom: 12px;
              border-bottom: 2px solid #f1f5f9;
            }
            
            .section-icon {
              width: 32px;
              height: 32px;
              background: #f3f4f6;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #374151;
              margin-top:40px
            }
            
            .section-title {
              font-size: 24px;
              font-weight: 700;
              color: #1f2937;
              margin-top:40px
            }
            
            .content-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 32px;
            }
            
            .chart-container {
              background: white;
              border-radius: 16px;
              padding: 28px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.06);
              border: 1px solid #f1f5f9;
            }
            
            .chart-title {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .chart-wrapper {
              display: flex;
              justify-content: center;
              margin-bottom: 16px;
            }
            
            .data-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0,0,0,0.06);
              border: 1px solid #f1f5f9;
            }
            
            .data-table th {
              background: #f8fafc;
              padding: 16px 20px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              font-size: 14px;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .data-table td {
              padding: 16px 20px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }
            
            .data-table tr:last-child td {
              border-bottom: none;
            }
            
            .data-table tr:hover {
              background: #f9fafb;
            }
            
            .metric-card {
              background: linear-gradient(135deg, #f8fafc, #f1f5f9);
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              border: 1px solid #e2e8f0;
            }
            
            .metric-value {
              font-size: 28px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 4px;
            }
            
            .metric-label {
              color: #6b7280;
              font-size: 14px;
              font-weight: 500;
            }
            
            .growth-indicator {
              font-weight: 600;
              font-size: 12px;
              padding: 4px 8px;
              border-radius: 6px;
              margin-top: 8px;
              display: inline-block;
            }
            
            .growth-positive {
              background: #dcfce7;
              color: #166534;
            }
            
            .growth-negative {
              background: #fef2f2;
              color: #dc2626;
            }
            
            .insights-section {
              background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
              border: 1px solid #bbf7d0;
              border-radius: 20px;
              padding: 32px;
              margin: 40px 0;
            }
            
            .insights-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 20px;
            }
            
            .insights-icon {
              width: 40px;
              height: 40px;
              background: #22c55e;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            
            .insights-title {
              font-size: 22px;
              font-weight: 700;
              color: #166534;
            }
            
            .insight-item {
              margin-bottom: 16px;
              padding-left: 20px;
              position: relative;
            }
            
            .insight-item::before {
              content: '▶';
              position: absolute;
              left: 0;
              color: #22c55e;
              font-size: 12px;
            }
            
            .footer {
              margin-top: 60px;
              padding: 32px 0;
              border-top: 2px solid #f1f5f9;
              text-align: center;
              color: #6b7280;
            }
            
            .footer-logo {
              width: 48px;
              height: 48px;
              background: #f3f4f6;
              border-radius: 12px;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            @media print {
              .report-container { padding: 10px; }
              .kpi-grid { grid-template-columns: repeat(2, 1fr); }
              .content-grid { grid-template-columns: 1fr; }
              .section { page-break-inside: avoid; }
            }
            
            .full-width {
              grid-column: 1 / -1;
            }
            
            .status-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              display: inline-block;
            }
            
            .status-active {
              background: #dcfce7;
              color: #166534;
            }
            
            .status-inactive {
              background: #fef2f2;
              color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-section">
                <div class="logo">
                  <img src="/TGO-Logo.png" alt="The Great Outdoors Logo" style="width: 60px; height: 60px; object-fit: contain;" />
                </div>
                <div class="company-info">
                  <h1>The Great Outdoors</h1>
                  <p>E-commerce Analytics Platform</p>
                </div>
              </div>
              <div class="report-meta">
                <p><strong>Report Date:</strong> ${new Date().toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</p>
                <p><strong>Generated By:</strong> Admin Dashboard</p>
                <p><strong>Report ID:</strong> UR-${Date.now()}</p>
                <p><strong>Period:</strong> Last 12 Months</p>
              </div>
            </div>

            <!-- Hero Section -->
            <div class="hero-section">
              <div class="hero-content">
                <h2>User Analytics Report</h2>
                <p>Comprehensive analysis of user demographics, engagement, and growth patterns</p>
                <div class="hero-stats">
                  <div class="hero-stat">
                    <span class="hero-stat-number">${data.totalUsers.toLocaleString()}</span>
                    <span class="hero-stat-label">Total Users</span>
                  </div>
                  <div class="hero-stat">
                    <span class="hero-stat-number">${
                      data.monthlyGrowth > 0 ? "+" : ""
                    }${data.monthlyGrowth}%</span>
                    <span class="hero-stat-label">Monthly Growth</span>
                  </div>
                  <div class="hero-stat">
                    <span class="hero-stat-number">${(
                      (data.activeUsers / data.totalUsers) *
                      100
                    ).toFixed(1)}%</span>
                    <span class="hero-stat-label">Active Rate</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- KPI Grid -->
            <div class="kpi-grid">
              <div class="kpi-card total">
                <div class="kpi-header">
                  <div>
                    <div class="kpi-number">${data.totalUsers.toLocaleString()}</div>
                    <div class="kpi-label">Total Users</div>
                    <div class="kpi-change ${
                      parseFloat(data.yearlyGrowth) >= 0
                        ? "positive"
                        : "negative"
                    }">
                      ${data.yearlyGrowth > 0 ? "+" : ""}${
        data.yearlyGrowth
      }% YoY
                    </div>
                  </div>
                  <div class="kpi-icon" style="background: #3b82f6;">👥</div>
                </div>
              </div>
              
              <div class="kpi-card customers">
                <div class="kpi-header">
                  <div>
                    <div class="kpi-number">${data.customers.toLocaleString()}</div>
                    <div class="kpi-label">Customers (${(
                      (data.customers / data.totalUsers) *
                      100
                    ).toFixed(1)}%)</div>
                    <div class="kpi-change positive">Primary Segment</div>
                  </div>
                  <div class="kpi-icon" style="background: #22c55e;">🛍️</div>
                </div>
              </div>
              
              <div class="kpi-card employees">
                <div class="kpi-header">
                  <div>
                    <div class="kpi-number">${data.employees.toLocaleString()}</div>
                    <div class="kpi-label">Employees (${(
                      (data.employees / data.totalUsers) *
                      100
                    ).toFixed(1)}%)</div>
                    <div class="kpi-change positive">Internal Users</div>
                  </div>
                  <div class="kpi-icon" style="background: #f59e0b;">👨‍💼</div>
                </div>
              </div>
              
              <div class="kpi-card admins">
                <div class="kpi-header">
                  <div>
                    <div class="kpi-number">${data.admins.toLocaleString()}</div>
                    <div class="kpi-label">Administrators (${(
                      (data.admins / data.totalUsers) *
                      100
                    ).toFixed(1)}%)</div>
                    <div class="kpi-change positive">System Access</div>
                  </div>
                  <div class="kpi-icon" style="background: #ef4444;">🔐</div>
                </div>
              </div>
            </div>

            <!-- User Activity Analysis -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">📊</div>
                <h3 class="section-title">User Activity & Engagement</h3>
              </div>
              
              <div class="content-grid">
                <div class="chart-container">
                  <div class="chart-title">📈 Registration Trend (12 Months)</div>
                  <div class="chart-wrapper">
                    ${generateChartSVG(
                      data.registrationTrend,
                      "line",
                      350,
                      180
                    )}
                  </div>
                  <div style="font-size: 12px; color: #6b7280; text-align: center;">
                    Monthly user registration patterns showing ${
                      parseFloat(data.monthlyGrowth) >= 0
                        ? "positive"
                        : "negative"
                    } growth trend
                  </div>
                </div>
                
                <div class="chart-container">
                  <div class="chart-title">🎯 User Engagement Metrics</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="metric-card">
                      <div class="metric-value">${data.activeUsers}</div>
                      <div class="metric-label">Active Users</div>
                      <div class="growth-indicator growth-positive">
                        ${((data.activeUsers / data.totalUsers) * 100).toFixed(
                          1
                        )}% of total
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-value">${data.inactiveUsers}</div>
                      <div class="metric-label">Inactive Users</div>
                      <div class="growth-indicator ${
                        data.inactiveUsers > data.totalUsers * 0.2
                          ? "growth-negative"
                          : "growth-positive"
                      }">
                        ${(
                          (data.inactiveUsers / data.totalUsers) *
                          100
                        ).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Customers Analysis -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">⭐</div>
                <h3 class="section-title">Top Customer Analysis</h3>
              </div>
              
              <div class="chart-container">
                <div class="chart-title">🏆 Top 5 Customers by Order Count</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Total Orders</th>
                      <th>Total Spent</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.topCustomers
                      .slice(0, 5)
                      .map(
                        (customer, index) => `
                      <tr>
                        <td><strong>${index + 1}</strong></td>
                        <td>${customer.name}</td>
                        <td style="color: #6b7280; font-size: 13px;">${
                          customer.email
                        }</td>
                        <td><strong>${customer.orders}</strong> orders</td>
                        <td style="color: #22c55e; font-weight: 600;">${customer.totalSpent.toLocaleString()}</td>
                        <td>${customer.city}</td>
                        <td><span class="status-badge status-active">VIP Customer</span></td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Geographic Distribution -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">🌍</div>
                <h3 class="section-title">Geographic Distribution</h3>
              </div>
              
              <div class="content-grid">
                <div class="chart-container">
                  <div class="chart-title">🏙️ Top Cities by User Count</div>
                  <div class="chart-wrapper">
                    ${generateChartSVG(
                      data.topCities.slice(0, 8),
                      "bar",
                      350,
                      200
                    )}
                  </div>
                </div>
                
                <div class="chart-container">
                  <div class="chart-title">📍 Geographic Breakdown</div>
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>City</th>
                        <th>Users</th>
                        <th>Percentage</th>
                        <th>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${data.topCities
                        .slice(0, 8)
                        .map(
                          (city) => `
                        <tr>
                          <td><strong>${city.city}</strong></td>
                          <td>${city.count}</td>
                          <td>${((city.count / data.totalUsers) * 100).toFixed(
                            1
                          )}%</td>
                          <td><span class="growth-indicator growth-positive">+5.2%</span></td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- User Role Distribution -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">👤</div>
                <h3 class="section-title">User Role Distribution</h3>
              </div>
              
              <div class="content-grid">
                <div class="chart-container">
                  <div class="chart-title">🥧 Role Distribution Chart</div>
                  <div class="chart-wrapper">
                    ${generateChartSVG(
                      [
                        { name: "Customers", value: data.customers },
                        { name: "Employees", value: data.employees },
                        { name: "Admins", value: data.admins },
                      ],
                      "donut",
                      300,
                      200
                    )}
                  </div>
                </div>
                
                <div class="chart-container">
                  <div class="chart-title">📊 Role Statistics</div>
                  <div style="display: grid; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 8px;">
                      <span>Customer Ratio</span>
                      <strong style="color: #22c55e;">${(
                        (data.customers / data.totalUsers) *
                        100
                      ).toFixed(1)}%</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 8px;">
                      <span>Employee Ratio</span>
                      <strong style="color: #f59e0b;">${(
                        (data.employees / data.totalUsers) *
                        100
                      ).toFixed(1)}%</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 8px;">
                      <span>Admin Ratio</span>
                      <strong style="color: #ef4444;">${(
                        (data.admins / data.totalUsers) *
                        100
                      ).toFixed(1)}%</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
                      <span>Active Rate</span>
                      <strong style="color: #166534;">${(
                        (data.activeUsers / data.totalUsers) *
                        100
                      ).toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Daily Registration Pattern -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">📅</div>
                <h3 class="section-title">Recent Activity (Last 7 Days)</h3>
              </div>
              
              <div class="chart-container full-width">
                <div class="chart-title">📈 Daily Registration Pattern</div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; margin-bottom: 20px;">
                  ${data.dailyRegistrations
                    .map(
                      (day) => `
                    <div class="metric-card">
                      <div class="metric-value">${day.count}</div>
                      <div class="metric-label">${day.date}</div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
                <div style="font-size: 14px; color: #6b7280; text-align: center;">
                  Total new registrations in the last 7 days: <strong>${data.dailyRegistrations.reduce(
                    (sum, day) => sum + day.count,
                    0
                  )}</strong>
                </div>
              </div>
            </div>

            <!-- Key Insights -->
            <div class="insights-section">
              <div class="insights-header">
                <div class="insights-icon">💡</div>
                <h3 class="insights-title">Key Insights & Recommendations</h3>
              </div>
              
              <div class="insight-item">
                <strong>User Growth:</strong> The platform shows ${
                  parseFloat(data.monthlyGrowth) >= 0 ? "positive" : "negative"
                } growth with ${
        data.monthlyGrowth
      }% monthly increase, indicating ${
        parseFloat(data.monthlyGrowth) >= 0
          ? "successful user acquisition strategies"
          : "need for enhanced marketing efforts"
      }.
              </div>
              
              <div class="insight-item">
                <strong>Geographic Concentration:</strong> ${
                  data.topCities[0]?.city || "N/A"
                } leads with ${data.topCities[0]?.count || 0} users (${(
        (data.topCities[0]?.count / data.totalUsers) *
        100
      ).toFixed(
        1
      )}%), suggesting strong regional presence and potential for expansion.
              </div>
              
              <div class="insight-item">
                <strong>User Engagement:</strong> With ${(
                  (data.activeUsers / data.totalUsers) *
                  100
                ).toFixed(1)}% active users, the platform demonstrates ${
        data.activeUsers / data.totalUsers > 0.8
          ? "excellent"
          : data.activeUsers / data.totalUsers > 0.6
          ? "good"
          : "concerning"
      } user engagement levels.
              </div>
              
              <div class="insight-item">
                <strong>Customer Distribution:</strong> ${(
                  (data.customers / data.totalUsers) *
                  100
                ).toFixed(
                  1
                )}% customer ratio indicates a healthy balance between customers and internal users, supporting business sustainability.
              </div>
              
              <div class="insight-item">
                <strong>Top Customer Activity:</strong> Top 5 customers have placed ${data.topCustomers.reduce(
                  (sum, customer) => sum + customer.orders,
                  0
                )} total orders, representing significant business value and requiring retention focus.
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">⚡</div>
                <h3 class="section-title">Performance Metrics</h3>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
                <div class="metric-card">
                  <div class="metric-value">${data.quarterlyGrowth}%</div>
                  <div class="metric-label">Quarterly Growth</div>
                  <div class="growth-indicator ${
                    parseFloat(data.quarterlyGrowth) >= 0
                      ? "growth-positive"
                      : "growth-negative"
                  }">
                    Last 90 days
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value">${data.topCities.length}</div>
                  <div class="metric-label">Active Cities</div>
                  <div class="growth-indicator growth-positive">
                    Geographic reach
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value">${Math.round(
                    data.totalUsers / data.topCities.length
                  )}</div>
                  <div class="metric-label">Avg Users/City</div>
                  <div class="growth-indicator growth-positive">
                    Market penetration
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-value">${data.dailyRegistrations.reduce(
                    (sum, day) => sum + day.count,
                    0
                  )}</div>
                  <div class="metric-label">Weekly Signups</div>
                  <div class="growth-indicator growth-positive">
                    Last 7 days
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-logo">
                <img src="/TGO-Logo.png" alt="TGO Logo" style="width: 72px; height: 62px; object-fit: contain;" />
              </div>
              <p style="font-size: 14px; margin-bottom: 8px;"><strong>The Great Outdoors - User Analytics Report</strong></p>
              <p style="font-size: 12px; margin-bottom: 4px;">Generated on ${new Date().toLocaleString()} by Admin Dashboard</p>
              <p style="font-size: 12px; color: #9ca3af;">This report contains confidential business information - For internal use only</p>
              <p style="font-size: 11px; margin-top: 16px; color: #9ca3af;">
                Report ID: UR-${Date.now()} | Version 2.0 | © ${new Date().getFullYear()} The Great Outdoors
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create and display PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(reportContent);
        printWindow.document.close();

        // Wait for content to load then trigger print
        setTimeout(() => {
          printWindow.print();
          printWindow.addEventListener("afterprint", () => {
            printWindow.close();
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // Additional utility functions for enhanced data processing
  const getGeographicDistribution = (users) => {
    return users.reduce((acc, user) => {
      if (user.city && user.state) {
        const key = `${user.city}, ${user.state}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const calculateUserEngagement = (users, orders) => {
    const usersWithOrders = new Set(
      orders.map((order) => order.user?.toString() || order.user)
    );
    return ((usersWithOrders.size / users.length) * 100).toFixed(1);
  };

  const calculateRetentionMetrics = (users, orders) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter(
      (order) => new Date(order.createdAt) >= thirtyDaysAgo
    );
    const activeCustomers = new Set(
      recentOrders.map((order) => order.user?.toString() || order.user)
    );

    return {
      activeCustomers: activeCustomers.size,
      retentionRate: (
        (activeCustomers.size /
          users.filter((u) => u.role === "Customer").length) *
        100
      ).toFixed(1),
    };
  };

  const getDemographicBreakdown = (users) => {
    return {
      byRole: {
        customers: users.filter((u) => u.role === "Customer").length,
        employees: users.filter((u) => u.role === "Employee").length,
        admins: users.filter((u) => u.role === "Admin").length,
      },
      byStatus: {
        active: users.filter((u) => u.isActive).length,
        inactive: users.filter((u) => !u.isActive).length,
      },
    };
  };

  const getMonthlyUserGrowthData = (users) => {
    const monthlyData = {};
    users.forEach((user) => {
      const monthYear = new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });
    return monthlyData;
  };

  const getRoleDistributionOverTime = (users) => {
    const roleData = { Customer: [], Employee: [], Admin: [] };
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthUsers = users.filter((user) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      roleData.Customer.push(
        monthUsers.filter((u) => u.role === "Customer").length
      );
      roleData.Employee.push(
        monthUsers.filter((u) => u.role === "Employee").length
      );
      roleData.Admin.push(monthUsers.filter((u) => u.role === "Admin").length);

      last6Months.push(
        monthStart.toLocaleDateString("en-US", { month: "short" })
      );
    }

    return { roleData, months: last6Months };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 m-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Advanced User Analytics Report
            </h3>
            <p className="text-gray-600 mt-1">
              Generate comprehensive user analytics with advanced visualizations
              and insights
            </p>
          </div>
        </div>

        <button
          onClick={generatePDFReport}
          disabled={isGenerating}
          className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="font-semibold">
                Generating Report... {progress}%
              </span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span className="font-semibold">Generate Advanced Report</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Processing user data and generating visualizations...
          </p>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-blue-900">User Demographics</h4>
          </div>
          <p className="text-blue-700 text-sm">
            Detailed breakdown by roles, activity status, and geographic
            distribution with visual charts
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-green-900">Growth Analytics</h4>
          </div>
          <p className="text-green-700 text-sm">
            Monthly, quarterly, and yearly growth trends with predictive
            insights
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-purple-900">Advanced Charts</h4>
          </div>
          <p className="text-purple-700 text-sm">
            Interactive visualizations including line charts, bar graphs, and
            donut charts
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-orange-600 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-orange-900">Geographic Analysis</h4>
          </div>
          <p className="text-orange-700 text-sm">
            City and state-wise user distribution with market penetration
            metrics
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-red-600 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-red-900">Customer Activity</h4>
          </div>
          <p className="text-red-700 text-sm">
            Top customers by order count, spending analysis, and engagement
            metrics
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-indigo-900">Performance KPIs</h4>
          </div>
          <p className="text-indigo-700 text-sm">
            Key performance indicators, retention rates, and business
            intelligence
          </p>
        </div>
      </div>

      {/* Report Summary */}
      {reportData && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="h-5 w-5 text-gray-700" />
            <h4 className="font-bold text-gray-900">
              Last Generated Report Summary
            </h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {reportData.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  parseFloat(reportData.monthlyGrowth) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {reportData.monthlyGrowth > 0 ? "+" : ""}
                {reportData.monthlyGrowth}%
              </div>
              <div className="text-sm text-gray-600">Monthly Growth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reportData.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reportData.customers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {reportData.topCities[0]?.city || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Top City</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {reportData.topCustomers.reduce(
                  (sum, customer) => sum + customer.orders,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                $
                {reportData.topCustomers
                  .reduce((sum, customer) => sum + customer.totalSpent, 0)
                  .toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Revenue (Top 10)</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">Key Insights:</h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong>Growth Status:</strong>{" "}
                {parseFloat(reportData.monthlyGrowth) >= 0
                  ? "Positive trajectory"
                  : "Needs attention"}{" "}
                with {reportData.monthlyGrowth}% monthly change
              </div>
              <div>
                <strong>User Engagement:</strong>{" "}
                {(
                  (reportData.activeUsers / reportData.totalUsers) *
                  100
                ).toFixed(1)}
                % active user rate
              </div>
              <div>
                <strong>Market Leader:</strong> {reportData.topCities[0]?.city}{" "}
                dominates with {reportData.topCities[0]?.count} users
              </div>
              <div>
                <strong>Customer Focus:</strong>{" "}
                {((reportData.customers / reportData.totalUsers) * 100).toFixed(
                  1
                )}
                % of users are customers
              </div>
              <div>
                <strong>Top Customer:</strong>{" "}
                {reportData.topCustomers[0]?.name} with{" "}
                {reportData.topCustomers[0]?.orders} orders
              </div>
              <div>
                <strong>Average Orders:</strong>{" "}
                {reportData.topCustomers.length > 0
                  ? (
                      reportData.topCustomers.reduce(
                        (sum, c) => sum + c.orders,
                        0
                      ) / Math.min(reportData.topCustomers.length, 10)
                    ).toFixed(1)
                  : 0}{" "}
                per top customer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Features Notice */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold mb-2">Advanced Analytics Features</h4>
            <p className="text-blue-100 text-sm mb-4">
              This enhanced report includes real-time data processing, advanced
              visualizations, and comprehensive business intelligence metrics.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>Real-time user data</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Interactive charts</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Predictive analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReportGenerator;
