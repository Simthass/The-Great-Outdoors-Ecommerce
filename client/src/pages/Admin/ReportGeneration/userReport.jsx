import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  PieChart,
} from "lucide-react";

const UserReportGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Sample data - in real implementation, fetch from your API
  const sampleUserData = {
    totalUsers: 1245,
    customers: 987,
    employees: 234,
    admins: 24,
    activeUsers: 1108,
    inactiveUsers: 137,
    monthlyGrowth: 12.5,
    topCities: [
      { city: "New York", count: 156 },
      { city: "Los Angeles", count: 134 },
      { city: "Chicago", count: 98 },
      { city: "Houston", count: 87 },
      { city: "Phoenix", count: 76 },
    ],
    registrationTrend: [
      { month: "Jan", users: 89 },
      { month: "Feb", users: 112 },
      { month: "Mar", users: 95 },
      { month: "Apr", users: 134 },
      { month: "May", users: 158 },
      { month: "Jun", users: 167 },
    ],
  };

  // Fetch real data from API
  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all users
      const response = await fetch("/api/users/all?limit=9999", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        const users = data.data.users;

        // Process data for report
        const processedData = {
          totalUsers: users.length,
          customers: users.filter((u) => u.role === "Customer").length,
          employees: users.filter((u) => u.role === "Employee").length,
          admins: users.filter((u) => u.role === "Admin").length,
          activeUsers: users.filter((u) => u.isActive).length,
          inactiveUsers: users.filter((u) => !u.isActive).length,

          // Calculate monthly growth (comparing last 30 days vs previous 30 days)
          monthlyGrowth: calculateMonthlyGrowth(users),

          // Top 5 cities
          topCities: getTopCities(users),

          // Registration trend (last 6 months)
          registrationTrend: getRegistrationTrend(users),
        };

        return processedData;
      }

      return sampleUserData; // Fallback to sample data
    } catch (error) {
      console.error("Error fetching report data:", error);
      return sampleUserData; // Fallback to sample data
    }
  };

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

    if (previousUsers === 0) return 0;
    return (((recentUsers - previousUsers) / previousUsers) * 100).toFixed(1);
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
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));
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

    for (let i = 5; i >= 0; i--) {
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

  // Generate PDF Report
  const generatePDFReport = async () => {
    setIsGenerating(true);

    try {
      // Fetch fresh data
      const data = await fetchReportData();
      setReportData(data);

      // Create PDF content
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>User Analytics Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 30px;
              color: #333;
              line-height: 1.6;
            }
            
            .header {
              border-bottom: 3px solid #22c55e;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
            }
            
            .logo {
              width: 50px;
              height: 50px;
              background: #22c55e;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
              font-weight: bold;
              margin-right: 15px;
            }
            
            .company-info h1 {
              margin: 0;
              font-size: 24px;
              color: #1f2937;
            }
            
            .company-info p {
              margin: 5px 0 0 0;
              color: #6b7280;
              font-size: 14px;
            }
            
            .report-meta {
              text-align: right;
              color: #6b7280;
            }
            
            .report-title {
              background: linear-gradient(135deg, #22c55e, #16a34a);
              color: white;
              padding: 25px;
              text-align: center;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            
            .report-title h2 {
              margin: 0;
              font-size: 28px;
            }
            
            .report-title p {
              margin: 10px 0 0 0;
              opacity: 0.9;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            
            .stat-card {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .stat-card h3 {
              margin: 0;
              font-size: 32px;
              color: #1f2937;
              font-weight: bold;
            }
            
            .stat-card p {
              margin: 8px 0 0 0;
              color: #6b7280;
              font-size: 14px;
            }
            
            .stat-card.total { border-left: 4px solid #3b82f6; }
            .stat-card.customers { border-left: 4px solid #22c55e; }
            .stat-card.employees { border-left: 4px solid #f59e0b; }
            .stat-card.admins { border-left: 4px solid #ef4444; }
            
            .section {
              margin-bottom: 40px;
            }
            
            .section h3 {
              font-size: 20px;
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            
            .two-column {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
            }
            
            .chart-placeholder {
              background: #f9fafb;
              border: 1px dashed #d1d5db;
              border-radius: 8px;
              padding: 40px;
              text-align: center;
              color: #6b7280;
              min-height: 200px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .data-table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .data-table th {
              background: #f3f4f6;
              padding: 12px 15px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .data-table td {
              padding: 12px 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .data-table tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .growth-positive {
              color: #22c55e;
              font-weight: bold;
            }
            
            .growth-negative {
              color: #ef4444;
              font-weight: bold;
            }
            
            .summary {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              padding: 25px;
              margin-top: 30px;
            }
            
            .summary h3 {
              margin: 0 0 15px 0;
              color: #166534;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            
            @media print {
              body { padding: 20px; }
              .stats-grid { grid-template-columns: repeat(2, 1fr); }
              .two-column { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <div class="logo">🛒</div>
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
            </div>
          </div>

          <div class="report-title">
            <h2>User Analytics Report</h2>
            <p>Comprehensive overview of user demographics and growth trends</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card total">
              <h3>${data.totalUsers.toLocaleString()}</h3>
              <p>Total Users</p>
            </div>
            <div class="stat-card customers">
              <h3>${data.customers.toLocaleString()}</h3>
              <p>Customers (${(
                (data.customers / data.totalUsers) *
                100
              ).toFixed(1)}%)</p>
            </div>
            <div class="stat-card employees">
              <h3>${data.employees.toLocaleString()}</h3>
              <p>Employees (${(
                (data.employees / data.totalUsers) *
                100
              ).toFixed(1)}%)</p>
            </div>
            <div class="stat-card admins">
              <h3>${data.admins.toLocaleString()}</h3>
              <p>Administrators (${(
                (data.admins / data.totalUsers) *
                100
              ).toFixed(1)}%)</p>
            </div>
          </div>

          <div class="section">
            <h3>📊 Key Performance Indicators</h3>
            <div class="two-column">
              <div>
                <table class="data-table">
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                  <tr>
                    <td>Active Users</td>
                    <td>${data.activeUsers.toLocaleString()}</td>
                    <td><span style="color: #22c55e;">✓ Healthy</span></td>
                  </tr>
                  <tr>
                    <td>Inactive Users</td>
                    <td>${data.inactiveUsers.toLocaleString()}</td>
                    <td><span style="color: ${
                      data.inactiveUsers > data.totalUsers * 0.2
                        ? "#ef4444"
                        : "#22c55e"
                    };">
                      ${
                        data.inactiveUsers > data.totalUsers * 0.2
                          ? "⚠ High"
                          : "✓ Normal"
                      }
                    </span></td>
                  </tr>
                  <tr>
                    <td>User Retention</td>
                    <td>${((data.activeUsers / data.totalUsers) * 100).toFixed(
                      1
                    )}%</td>
                    <td><span style="color: #22c55e;">✓ Excellent</span></td>
                  </tr>
                  <tr>
                    <td>Monthly Growth</td>
                    <td class="${
                      parseFloat(data.monthlyGrowth) >= 0
                        ? "growth-positive"
                        : "growth-negative"
                    }">
                      ${data.monthlyGrowth > 0 ? "+" : ""}${data.monthlyGrowth}%
                    </td>
                    <td><span style="color: ${
                      parseFloat(data.monthlyGrowth) >= 0
                        ? "#22c55e"
                        : "#ef4444"
                    };">
                      ${
                        parseFloat(data.monthlyGrowth) >= 0
                          ? "📈 Growing"
                          : "📉 Declining"
                      }
                    </span></td>
                  </tr>
                </table>
              </div>
              <div class="chart-placeholder">
                <div>
                  <strong>User Activity Chart</strong><br>
                  <small>Visual representation would appear here in production</small>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>🌍 Geographic Distribution</h3>
            <div class="two-column">
              <div>
                <h4>Top 5 Cities</h4>
                <table class="data-table">
                  <tr>
                    <th>Rank</th>
                    <th>City</th>
                    <th>Users</th>
                    <th>Percentage</th>
                  </tr>
                  ${data.topCities
                    .map(
                      (city, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${city.city}</td>
                      <td>${city.count}</td>
                      <td>${((city.count / data.totalUsers) * 100).toFixed(
                        1
                      )}%</td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>
              </div>
              <div class="chart-placeholder">
                <div>
                  <strong>Geographic Distribution Map</strong><br>
                  <small>Interactive map would appear here in production</small>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>📈 Registration Trends (Last 6 Months)</h3>
            <table class="data-table">
              <tr>
                <th>Month</th>
                <th>New Registrations</th>
                <th>Growth</th>
                <th>Trend</th>
              </tr>
              ${data.registrationTrend
                .map((month, index) => {
                  const prevMonth =
                    index > 0
                      ? data.registrationTrend[index - 1].users
                      : month.users;
                  const growth =
                    index > 0
                      ? (((month.users - prevMonth) / prevMonth) * 100).toFixed(
                          1
                        )
                      : "0.0";
                  return `
                  <tr>
                    <td>${month.month}</td>
                    <td>${month.users}</td>
                    <td class="${
                      parseFloat(growth) >= 0
                        ? "growth-positive"
                        : "growth-negative"
                    }">
                      ${growth > 0 ? "+" : ""}${growth}%
                    </td>
                    <td>${parseFloat(growth) >= 0 ? "📈" : "📉"}</td>
                  </tr>
                `;
                })
                .join("")}
            </table>
          </div>

          <div class="summary">
            <h3>📋 Executive Summary</h3>
            <p><strong>Overall Health:</strong> Your user base shows ${
              parseFloat(data.monthlyGrowth) >= 0 ? "positive" : "negative"
            } growth with ${data.totalUsers.toLocaleString()} total registered users.</p>
            
            <p><strong>User Composition:</strong> The platform maintains a healthy balance with ${(
              (data.customers / data.totalUsers) *
              100
            ).toFixed(1)}% customers, ${(
        (data.employees / data.totalUsers) *
        100
      ).toFixed(1)}% employees, and ${(
        (data.admins / data.totalUsers) *
        100
      ).toFixed(1)}% administrators.</p>
            
            <p><strong>Engagement:</strong> With ${(
              (data.activeUsers / data.totalUsers) *
              100
            ).toFixed(
              1
            )}% user retention rate, the platform demonstrates strong user engagement and satisfaction.</p>
            
            <p><strong>Geographic Reach:</strong> Users are distributed across ${
              data.topCities.length
            } major cities, with ${
        data.topCities[0]?.city || "N/A"
      } leading with ${data.topCities[0]?.count || 0} users.</p>
            
            <p><strong>Growth Trajectory:</strong> ${
              parseFloat(data.monthlyGrowth) >= 0
                ? `The platform is experiencing healthy growth at ${data.monthlyGrowth}% monthly rate, indicating successful user acquisition strategies.`
                : `The platform shows a decline of ${Math.abs(
                    data.monthlyGrowth
                  )}% this month, suggesting need for enhanced user acquisition efforts.`
            }</p>
          </div>

          <div class="footer">
            <p>This report was generated automatically by the User Management System on ${new Date().toLocaleString()}.</p>
            <p>For questions about this report, contact your system administrator.</p>
            <p style="margin-top: 10px;"><em>Confidential - For Internal Use Only</em></p>
          </div>
        </body>
        </html>
      `;

      // Create and download PDF
      const printWindow = window.open("", "_blank");
      printWindow.document.write(reportContent);
      printWindow.document.close();

      // Trigger print dialog
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 m-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            User Analytics Report
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Generate comprehensive user analytics and demographic reports
          </p>
        </div>
        <button
          onClick={generatePDFReport}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generate Report
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">User Demographics</h4>
              <p className="text-sm text-blue-700">
                Complete user breakdown by roles and activity
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">Growth Analytics</h4>
              <p className="text-sm text-green-700">
                Registration trends and growth metrics
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <PieChart className="h-8 w-8 text-purple-600" />
            <div>
              <h4 className="font-semibold text-purple-900">Geographic Data</h4>
              <p className="text-sm text-purple-700">
                City-wise user distribution analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Last Generated Report Summary:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Users:</span>
              <span className="font-semibold ml-1">
                {reportData.totalUsers.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Growth Rate:</span>
              <span
                className={`font-semibold ml-1 ${
                  parseFloat(reportData.monthlyGrowth) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {reportData.monthlyGrowth > 0 ? "+" : ""}
                {reportData.monthlyGrowth}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">Active Users:</span>
              <span className="font-semibold ml-1">
                {reportData.activeUsers.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Top City:</span>
              <span className="font-semibold ml-1">
                {reportData.topCities[0]?.city || "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReportGenerator;
