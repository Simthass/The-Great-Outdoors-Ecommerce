import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";
import * as htmlToImage from "html-to-image";
import {
  Calendar,
  Download,
  FileText,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  Star,
} from "lucide-react";

const ProductReports = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const reportRef = useRef(null);

  // Refs for each chart to convert to image
  const categoryChartRef = useRef(null);
  const priceChartRef = useRef(null);
  const brandChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const topSellingChartRef = useRef(null);
  const categorySalesChartRef = useRef(null);
  const monthlySalesChartRef = useRef(null);

  // Color schemes for charts - using standard hex colors
  const COLORS = [
    "#8DC53E", // Green
    "#34D399", // Emerald
    "#60A5FA", // Blue
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#10B981", // Green
  ];
  const RADIAN = Math.PI / 180;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Add this useEffect to inject PDF-friendly styles
  useEffect(() => {
    // Inject PDF-friendly styles
    const pdfStyles = `
    <style id="pdf-friendly-styles">
      .chart-container * {
        color: #374151 !important;
      }
      .recharts-text {
        fill: #374151 !important;
      }
      .recharts-cartesian-axis-tick-value {
        fill: #6B7280 !important;
      }
      .recharts-legend-item-text {
        color: #374151 !important;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    </style>
  `;

    if (!document.getElementById("pdf-friendly-styles")) {
      document.head.insertAdjacentHTML("beforeend", pdfStyles);
    }

    return () => {
      const styles = document.getElementById("pdf-friendly-styles");
      if (styles) styles.remove();
    };
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/reports/sales-analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        console.error("Failed to fetch analytics:", result.message);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const generatePDFReport = async () => {
    if (!reportRef.current || !analyticsData) return;

    setGenerating(true);

    try {
      // Step 1: Convert all chart SVGs to image data URLs
      const chartImages = {};
      const chartRefs = {
        categoryDistribution: categoryChartRef,
        priceRanges: priceChartRef,
        brandAnalysis: brandChartRef,
        productStatus: statusChartRef,
        topSellingProducts: topSellingChartRef,
        categorySales: categorySalesChartRef,
        monthlySales: monthlySalesChartRef,
      };

      for (const key in chartRefs) {
        if (chartRefs[key].current) {
          try {
            const dataUrl = await htmlToImage.toPng(chartRefs[key].current);
            chartImages[key] = dataUrl;
          } catch (err) {
            console.error(`Failed to convert chart ${key} to image:`, err);
            chartImages[key] = null;
          }
        }
      }

      // Step 2: Create a simplified, printable version of the report with images
      const createPrintableReport = () => {
        const printDiv = document.createElement("div");
        printDiv.style.cssText = `
          font-family: Arial, sans-serif;
          padding: 20px;
          background: white;
          color: #333;
          line-height: 1.4;
          max-width: 800px;
          margin: 0 auto;
        `;

        const reportDate = new Date().toLocaleDateString();
        const dateRangeText = `${dateRange.startDate} to ${dateRange.endDate}`;

        const keyMetricsHTML = `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Key Metrics</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
              <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                <h3 style="margin: 0 0 5px 0; color: #333;">Total Products</h3>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #059669;">${
                  analyticsData.reportMetadata?.totalProducts || 0
                }</p>
              </div>
              <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                <h3 style="margin: 0 0 5px 0; color: #333;">Categories</h3>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3B82F6;">${
                  analyticsData.reportMetadata?.totalCategories || 0
                }</p>
              </div>
              <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                <h3 style="margin: 0 0 5px 0; color: #333;">Inventory Value</h3>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #F59E0B;">Rs. ${
                  analyticsData.inventoryValue?.totalInventoryValue
                    ? (
                        analyticsData.inventoryValue.totalInventoryValue /
                        1000000
                      ).toFixed(1) + "M"
                    : "0.0M"
                }</p>
              </div>
              <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                <h3 style="margin: 0 0 5px 0; color: #333;">Featured Products</h3>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #8B5CF6;">${
                  analyticsData.specialProducts?.featuredCount || 0
                }</p>
              </div>
            </div>
          </div>
        `;

        const chartHtml = (title, image, width = "100%", height = "auto") => {
          if (!image) return "";
          return `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
              <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">${title}</h2>
              <div style="text-align: center;">
                <img src="${image}" style="width: ${width}; height: ${height}; max-width: 100%;" alt="${title} Chart" />
              </div>
            </div>
          `;
        };

        const topSellingTable =
          analyticsData.topSellingProducts &&
          analyticsData.topSellingProducts.length > 0
            ? `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Top Selling Products</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Brand</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Units Sold</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${analyticsData.topSellingProducts
                  .slice(0, 10)
                  .map(
                    (product) => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      product.productName
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      product.brand
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${
                      product.totalQuantitySold
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rs. ${product.totalRevenue?.toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : "";

        const categoryTable =
          analyticsData.categoryDistribution &&
          analyticsData.categoryDistribution.length > 0
            ? `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Category Distribution</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Category</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Products</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Avg. Price</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Value</th>
                </tr>
              </thead>
              <tbody>
                ${analyticsData.categoryDistribution
                  .map(
                    (category) => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      category.categoryName
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${
                      category.productCount
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rs. ${
                      category.averagePrice?.toFixed(0) || 0
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rs. ${
                      category.totalValue?.toLocaleString() || 0
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : "";

        const brandTable =
          analyticsData.brandAnalysis && analyticsData.brandAnalysis.length > 0
            ? `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Top Brands</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Rank</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Brand</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Products</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Avg. Price</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Value</th>
                </tr>
              </thead>
              <tbody>
                ${analyticsData.brandAnalysis
                  .slice(0, 10)
                  .map(
                    (brand, index) => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${
                      index + 1
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      brand._id
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${
                      brand.productCount
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rs. ${
                      brand.averagePrice?.toFixed(0) || 0
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rs. ${
                      brand.totalValue?.toLocaleString() || 0
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : "";

        const summaryHtml = `
          <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 5px; text-align: center;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
              <div>
                <div style="font-size: 18px; font-weight: bold; color: #333;">Rs. ${
                  analyticsData.inventoryValue?.totalInventoryValue
                    ? (
                        analyticsData.inventoryValue.totalInventoryValue /
                        1000000
                      ).toFixed(2) + "M"
                    : "0.00M"
                }</div>
                <div style="font-size: 12px; color: #666;">Total Inventory Value</div>
              </div>
              <div>
                <div style="font-size: 18px; font-weight: bold; color: #333;">Rs. ${
                  analyticsData.inventoryValue?.averageProductPrice?.toFixed(
                    0
                  ) || 0
                }</div>
                <div style="font-size: 12px; color: #666;">Average Product Price</div>
              </div>
              <div>
                <div style="font-size: 18px; font-weight: bold; color: #333;">${
                  (analyticsData.brandAnalysis || []).length
                }</div>
                <div style="font-size: 12px; color: #666;">Active Brands</div>
              </div>
            </div>
            <div style="margin-top: 15px; font-size: 11px; color: #999;">
              Report generated on ${new Date(
                analyticsData.reportMetadata?.generatedAt || new Date()
              ).toLocaleString()}
            </div>
          </div>
        `;

        printDiv.innerHTML = `
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
            <h1 style="color: #333; margin: 0 0 10px 0; font-size: 24px;">Product Analytics Report</h1>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Generated on: ${reportDate}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Period: ${dateRangeText}</p>
          </div>
          
          ${keyMetricsHTML}

          ${chartHtml("Products by Category", chartImages.categoryDistribution)}
          ${chartHtml("Price Range Distribution", chartImages.priceRanges)}
          ${chartHtml("Top Brands by Product Count", chartImages.brandAnalysis)}
          ${chartHtml("Product Status Distribution", chartImages.productStatus)}
          ${chartHtml("Top Selling Products", chartImages.topSellingProducts)}
          ${chartHtml("Category Sales Revenue", chartImages.categorySales)}
          ${chartHtml("Monthly Sales Trend", chartImages.monthlySales)}

          ${topSellingTable}
          ${categoryTable}
          ${brandTable}
          ${summaryHtml}
        `;
        return printDiv;
      };

      // Create the printable content
      const printableContent = createPrintableReport();

      // Create options for html2pdf
      const options = {
        margin: 10,
        filename: `Product_Analytics_Report_${
          new Date().toISOString().split("T")[0]
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#FFFFFF",
          logging: false,
          letterRendering: true,
          allowTaint: false,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          avoid: "tr",
        },
      };

      // Step 3: Generate PDF
      await html2pdf().from(printableContent).set(options).save();

      setGenerating(false);
    } catch (error) {
      console.error("PDF generation error:", error);
      setGenerating(false);
      // Fallback to jsPDF only
      try {
        const doc = new jsPDF();
        let yPosition = 20;

        // Title
        doc.setFontSize(18);
        doc.text("Product Analytics Report", 20, yPosition);
        yPosition += 15;

        // Date
        doc.setFontSize(10);
        doc.text(
          `Generated: ${new Date().toLocaleDateString()}`,
          20,
          yPosition
        );
        yPosition += 10;

        // Key metrics
        doc.setFontSize(14);
        doc.text("Key Metrics", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.text(
          `Total Products: ${analyticsData.reportMetadata?.totalProducts || 0}`,
          20,
          yPosition
        );
        yPosition += 8;
        doc.text(
          `Total Categories: ${
            analyticsData.reportMetadata?.totalCategories || 0
          }`,
          20,
          yPosition
        );
        yPosition += 8;
        doc.text(
          `Featured Products: ${
            analyticsData.specialProducts?.featuredCount || 0
          }`,
          20,
          yPosition
        );
        yPosition += 8;

        if (analyticsData.inventoryValue?.totalInventoryValue) {
          doc.text(
            `Total Inventory Value: Rs. ${analyticsData.inventoryValue.totalInventoryValue.toLocaleString()}`,
            20,
            yPosition
          );
          yPosition += 8;
        }

        // Top Categories
        if (
          analyticsData.categoryDistribution &&
          analyticsData.categoryDistribution.length > 0
        ) {
          yPosition += 10;
          doc.setFontSize(14);
          doc.text("Top Categories", 20, yPosition);
          yPosition += 10;
          doc.setFontSize(10);

          analyticsData.categoryDistribution
            .slice(0, 10)
            .forEach((category, index) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              doc.text(
                `${index + 1}. ${category.categoryName}: ${
                  category.productCount
                } products (Rs. ${category.totalValue?.toLocaleString()})`,
                25,
                yPosition
              );
              yPosition += 8;
            });
        }

        // Top Brands
        if (
          analyticsData.brandAnalysis &&
          analyticsData.brandAnalysis.length > 0
        ) {
          if (yPosition > 220) {
            doc.addPage();
            yPosition = 20;
          }

          yPosition += 10;
          doc.setFontSize(14);
          doc.text("Top Brands", 20, yPosition);
          yPosition += 10;
          doc.setFontSize(10);

          analyticsData.brandAnalysis.slice(0, 10).forEach((brand, index) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(
              `${index + 1}. ${brand._id}: ${
                brand.productCount
              } products (Avg: Rs. ${brand.averagePrice?.toFixed(0)})`,
              25,
              yPosition
            );
            yPosition += 8;
          });
        }

        doc.save(
          `Product_Analytics_Report_Fallback_${
            new Date().toISOString().split("T")[0]
          }.pdf`
        );
      } catch (fallbackError) {
        console.error("Fallback PDF generation also failed:", fallbackError);
        alert(
          "PDF generation failed. Please try downloading the data as CSV instead."
        );
      }
    }
  };

  // Custom label function for pie charts
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null; // Hide labels for segments less than 5%

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Analytics
          </h2>
          <button
            onClick={fetchAnalytics}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Controls */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="mr-2" />
                Product Management Reports
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive analytics and insights
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateRangeChange("startDate", e.target.value)
                  }
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", e.target.value)
                  }
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={fetchAnalytics}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Update
                </button>
              </div>

              <button
                onClick={generatePDFReport}
                disabled={generating}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center text-sm font-medium"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto p-6" ref={reportRef}>
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.reportMetadata?.totalProducts || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.reportMetadata?.totalCategories || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Inventory Value
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  Rs.{" "}
                  {analyticsData.inventoryValue?.totalInventoryValue
                    ? (
                        analyticsData.inventoryValue.totalInventoryValue /
                        1000000
                      ).toFixed(1)
                    : "0.0"}
                  M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Featured Products
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.specialProducts?.featuredCount || 0}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Distribution */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border chart-container"
            ref={categoryChartRef}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Products by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.categoryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoryName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => [value, "Products"]} />
                <Bar
                  dataKey="productCount"
                  fill="#8DC53E"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Price Range Distribution */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border chart-container"
            ref={priceChartRef}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Price Range Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.priceRanges || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analyticsData.priceRanges || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Brand Performance */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border chart-container"
            ref={brandChartRef}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Top Brands by Product Count
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(analyticsData.brandAnalysis || []).slice(0, 8)}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="_id" width={80} />
                <Tooltip formatter={(value) => [value, "Products"]} />
                <Bar
                  dataKey="productCount"
                  fill="#34D399"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Status Distribution */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm border chart-container"
            ref={statusChartRef}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Product Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Featured",
                      value: analyticsData.specialProducts?.featuredCount || 0,
                      color: "#8B5CF6",
                    },
                    {
                      name: "Hot This Week",
                      value:
                        analyticsData.specialProducts?.hotThisWeekCount || 0,
                      color: "#EF4444",
                    },
                    {
                      name: "Regular",
                      value: analyticsData.specialProducts?.regularCount || 0,
                      color: "#6B7280",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    {
                      name: "Featured",
                      value: analyticsData.specialProducts?.featuredCount || 0,
                    },
                    {
                      name: "Hot This Week",
                      value:
                        analyticsData.specialProducts?.hotThisWeekCount || 0,
                    },
                    {
                      name: "Regular",
                      value: analyticsData.specialProducts?.regularCount || 0,
                    },
                  ].map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#8B5CF6", "#EF4444", "#6B7280"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Analytics Section */}
        {analyticsData.topSellingProducts &&
          analyticsData.topSellingProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="mr-2" />
                Sales Performance Analytics
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Selling Products */}
                <div
                  className="bg-white p-6 rounded-xl shadow-sm border chart-container"
                  ref={topSellingChartRef}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Top Selling Products
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analyticsData.topSellingProducts.slice(0, 5)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="productName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Units Sold"]} />
                      <Bar
                        dataKey="totalQuantitySold"
                        fill="#F59E0B"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Sales Performance */}
                <div
                  className="bg-white p-6 rounded-xl shadow-sm border chart-container"
                  ref={categorySalesChartRef}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Category Sales Revenue
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.categorySales || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="categoryName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [
                          `Rs. ${value.toLocaleString()}`,
                          "Revenue",
                        ]}
                      />
                      <Bar
                        dataKey="totalRevenue"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Sales Trend */}
              {analyticsData.monthlySales &&
                analyticsData.monthlySales.length > 0 && (
                  <div
                    className="bg-white p-6 rounded-xl shadow-sm border chart-container mb-8"
                    ref={monthlySalesChartRef}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Monthly Sales Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData.monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              year: "2-digit",
                            })
                          }
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(date) =>
                            new Date(date).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          }
                          formatter={(value, name) => [
                            name === "totalRevenue"
                              ? `Rs. ${value.toLocaleString()}`
                              : value,
                            name === "totalRevenue" ? "Revenue" : "Quantity",
                          ]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="totalRevenue"
                          stackId="1"
                          stroke="#8DC53E"
                          fill="#8DC53E"
                          fillOpacity={0.7}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
            </div>
          )}

        {/* Data Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Selling Products Table */}
          {analyticsData.topSellingProducts &&
            analyticsData.topSellingProducts.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Top Selling Products Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Product</th>
                        <th className="text-left p-3 font-semibold">Brand</th>
                        <th className="text-right p-3 font-semibold">Sold</th>
                        <th className="text-right p-3 font-semibold">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.topSellingProducts
                        .slice(0, 8)
                        .map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium text-gray-900 truncate max-w-40">
                                {product.productName}
                              </div>
                            </td>
                            <td className="p-3 text-gray-600">
                              {product.brand}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {product.totalQuantitySold}
                            </td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              Rs. {product.totalRevenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Category Performance Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Category Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-right p-3 font-semibold">Products</th>
                    <th className="text-right p-3 font-semibold">Avg. Price</th>
                    <th className="text-right p-3 font-semibold">
                      Total Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(analyticsData.categoryDistribution || []).map(
                    (category, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">
                            {category.categoryName}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {category.productCount}
                        </td>
                        <td className="p-3 text-right">
                          Rs. {category.averagePrice?.toFixed(0) || 0}
                        </td>
                        <td className="p-3 text-right font-semibold text-green-600">
                          Rs. {category.totalValue?.toLocaleString() || 0}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Brand Analysis Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Brand Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Rank</th>
                  <th className="text-left p-3 font-semibold">Brand</th>
                  <th className="text-right p-3 font-semibold">Products</th>
                  <th className="text-right p-3 font-semibold">Avg. Price</th>
                  <th className="text-right p-3 font-semibold">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(analyticsData.brandAnalysis || []).map((brand, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">
                        {brand._id}
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {brand.productCount}
                    </td>
                    <td className="p-3 text-right">
                      Rs. {brand.averagePrice?.toFixed(0) || 0}
                    </td>
                    <td className="p-3 text-right font-semibold text-green-600">
                      Rs. {brand.totalValue?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Recently Added Products
          </h3>
          <div className="space-y-3">
            {(analyticsData.recentProducts || []).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {product.productName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.brand} • {product.category?.categoryName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    Rs. {product.price?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                Rs.{" "}
                {analyticsData.inventoryValue?.totalInventoryValue
                  ? (
                      analyticsData.inventoryValue.totalInventoryValue / 1000000
                    ).toFixed(2)
                  : "0.00"}
                M
              </div>
              <div className="text-sm text-gray-600">Total Inventory Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                Rs.{" "}
                {analyticsData.inventoryValue?.averageProductPrice?.toFixed(
                  0
                ) || 0}
              </div>
              <div className="text-sm text-gray-600">Average Product Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(analyticsData.brandAnalysis || []).length}
              </div>
              <div className="text-sm text-gray-600">Active Brands</div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Report generated on{" "}
            {new Date(
              analyticsData.reportMetadata?.generatedAt || new Date()
            ).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReports;
