import PDFDocument from 'pdfkit';
import moment from 'moment';
import { formatCurrency } from './reportUtils.js';

/**
 * Generate PDF report for orders
 */
export const generateOrderReportPDF = (reportData, reportType) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      addHeader(doc, reportType, reportData);
      
      // Report summary
      addReportSummary(doc, reportData);
      
      // Charts section (text-based representation)
      if (reportData.timeSeriesData && reportData.timeSeriesData.length > 0) {
        doc.addPage();
        addTimeSeriesChart(doc, reportData.timeSeriesData);
      }
      
      // Detailed data tables
      if (reportData.orders && reportData.orders.length > 0) {
        doc.addPage();
        addOrdersTable(doc, reportData.orders);
      }
      
      if (reportData.productMetrics && reportData.productMetrics.length > 0) {
        doc.addPage();
        addProductMetricsTable(doc, reportData.productMetrics);
      }
      
      if (reportData.metrics.topCustomers && reportData.metrics.topCustomers.length > 0) {
        doc.addPage();
        addTopCustomersTable(doc, reportData.metrics.topCustomers);
      }
      
      // Footer
      addFooter(doc);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add header to PDF
 */
const addHeader = (doc, reportType, reportData) => {
  const pageWidth = doc.page.width - 100;
  
  // Company logo placeholder
  doc.rect(50, 50, 60, 60).stroke();
  doc.fontSize(10).text('LOGO', 70, 75);
  
  // Company info
  doc.fontSize(20)
     .text('The Great Outdoors', 120, 60);
  
  doc.fontSize(12)
     .text('E-Commerce Report System', 120, 85);
  
  // Report title
  doc.fontSize(16)
     .text(`${reportType} Report`, 50, 130);
  
  // Date range
  const dateInfo = reportData.reportInfo || reportData.dateRange;
  if (dateInfo) {
    doc.fontSize(12)
       .text(`Period: ${dateInfo.dateRange || dateInfo.period}`, 50, 155);
    doc.text(`Generated: ${dateInfo.generated || moment().format('YYYY-MM-DD HH:mm:ss')}`, 50, 175);
  }
  
  // Divider line
  doc.moveTo(50, 200)
     .lineTo(pageWidth + 50, 200)
     .stroke();
};

/**
 * Add report summary section
 */
const addReportSummary = (doc, reportData) => {
  const metrics = reportData.metrics;
  if (!metrics) return;
  
  let yPos = 220;
  
  doc.fontSize(14)
     .text('Executive Summary', 50, yPos);
  
  yPos += 30;
  
  // Key metrics in columns
  const col1X = 50;
  const col2X = 300;
  
  doc.fontSize(12);
  
  // Column 1
  doc.text('Total Orders:', col1X, yPos);
  doc.text(metrics.totalOrders?.toLocaleString() || '0', col1X + 100, yPos);
  
  yPos += 20;
  doc.text('Total Revenue:', col1X, yPos);
  doc.text(formatCurrency(metrics.totalRevenue || 0), col1X + 100, yPos);
  
  yPos += 20;
  doc.text('Avg Order Value:', col1X, yPos);
  doc.text(formatCurrency(metrics.averageOrderValue || 0), col1X + 100, yPos);
  
  // Column 2
  yPos = 250; // Reset for column 2
  doc.text('Total Tax:', col2X, yPos);
  doc.text(formatCurrency(metrics.totalTax || 0), col2X + 100, yPos);
  
  yPos += 20;
  doc.text('Shipping Fees:', col2X, yPos);
  doc.text(formatCurrency(metrics.totalShipping || 0), col2X + 100, yPos);
  
  yPos += 20;
  doc.text('Discounts:', col2X, yPos);
  doc.text(formatCurrency(metrics.totalDiscount || 0), col2X + 100, yPos);
  
  // Order status breakdown
  yPos += 40;
  doc.fontSize(12)
     .text('Order Status Breakdown:', 50, yPos);
  
  yPos += 20;
  if (metrics.ordersByStatus) {
    Object.entries(metrics.ordersByStatus).forEach(([status, count]) => {
      doc.text(`• ${status}:`, 70, yPos);
      doc.text(`${count} orders`, 200, yPos);
      yPos += 15;
    });
  }
};

/**
 * Add time series chart (text representation)
 */
const addTimeSeriesChart = (doc, timeSeriesData) => {
  doc.fontSize(14)
     .text('Revenue Trend', 50, 50);
  
  let yPos = 80;
  
  doc.fontSize(10);
  
  // Headers
  doc.text('Date', 50, yPos);
  doc.text('Orders', 150, yPos);
  doc.text('Revenue', 220, yPos);
  doc.text('Avg Order Value', 320, yPos);
  
  yPos += 20;
  
  // Draw line
  doc.moveTo(50, yPos - 5)
     .lineTo(450, yPos - 5)
     .stroke();
  
  // Data rows
  timeSeriesData.slice(0, 25).forEach((data, index) => { // Limit to prevent page overflow
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }
    
    doc.text(moment(data.date).format('MMM DD'), 50, yPos);
    doc.text(data.orders.toString(), 150, yPos);
    doc.text(formatCurrency(data.revenue), 220, yPos);
    doc.text(formatCurrency(data.averageOrderValue), 320, yPos);
    
    yPos += 15;
  });
};

/**
 * Add orders table
 */
const addOrdersTable = (doc, orders) => {
  doc.fontSize(14)
     .text('Recent Orders', 50, 50);
  
  let yPos = 80;
  
  doc.fontSize(9);
  
  // Headers
  doc.text('Order ID', 50, yPos);
  doc.text('Date', 120, yPos);
  doc.text('Customer', 180, yPos);
  doc.text('Status', 280, yPos);
  doc.text('Amount', 340, yPos);
  doc.text('Payment', 420, yPos);
  
  yPos += 20;
  
  // Draw line
  doc.moveTo(50, yPos - 5)
     .lineTo(500, yPos - 5)
     .stroke();
  
  // Data rows (limit to prevent page overflow)
  orders.slice(0, 30).forEach((order, index) => {
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }
    
    const orderTotal = order.totalAmount + order.tax + order.shippingCost - order.discount;
    const customerName = order.user ? 
      (order.user.firstName && order.user.lastName ? 
        `${order.user.firstName} ${order.user.lastName}` : 
        order.user.email) : 'N/A';
    
    doc.text(order.orderId || order._id.toString().slice(-8), 50, yPos);
    doc.text(moment(order.orderDate).format('MMM DD'), 120, yPos);
    doc.text(customerName.substring(0, 15), 180, yPos);
    doc.text(order.orderStatus, 280, yPos);
    doc.text(formatCurrency(orderTotal), 340, yPos);
    doc.text(order.paymentStatus, 420, yPos);
    
    yPos += 15;
  });
};

/**
 * Add product metrics table
 */
const addProductMetricsTable = (doc, productMetrics) => {
  doc.fontSize(14)
     .text('Top Products by Revenue', 50, 50);
  
  let yPos = 80;
  
  doc.fontSize(9);
  
  // Headers
  doc.text('Product Name', 50, yPos);
  doc.text('SKU', 200, yPos);
  doc.text('Qty Sold', 260, yPos);
  doc.text('Revenue', 320, yPos);
  doc.text('Avg Price', 400, yPos);
  
  yPos += 20;
  
  // Draw line
  doc.moveTo(50, yPos - 5)
     .lineTo(480, yPos - 5)
     .stroke();
  
  // Data rows
  productMetrics.slice(0, 30).forEach((product, index) => {
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }
    
    doc.text(product.productName.substring(0, 20), 50, yPos);
    doc.text(product.sku || 'N/A', 200, yPos);
    doc.text(product.totalQuantitySold.toString(), 260, yPos);
    doc.text(formatCurrency(product.totalRevenue), 320, yPos);
    doc.text(formatCurrency(product.averagePrice), 400, yPos);
    
    yPos += 15;
  });
};

/**
 * Add top customers table
 */
const addTopCustomersTable = (doc, topCustomers) => {
  doc.fontSize(14)
     .text('Top Customers', 50, 50);
  
  let yPos = 80;
  
  doc.fontSize(10);
  
  // Headers
  doc.text('Customer Name', 50, yPos);
  doc.text('Order Count', 250, yPos);
  doc.text('Total Spent', 350, yPos);
  
  yPos += 20;
  
  // Draw line
  doc.moveTo(50, yPos - 5)
     .lineTo(450, yPos - 5)
     .stroke();
  
  // Data rows
  topCustomers.slice(0, 20).forEach((customer, index) => {
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }
    
    doc.text(customer.customerName.substring(0, 30), 50, yPos);
    doc.text(customer.orderCount.toString(), 250, yPos);
    doc.text(formatCurrency(customer.totalSpent), 350, yPos);
    
    yPos += 15;
  });
};

/**
 * Add footer to PDF
 */
const addFooter = (doc) => {
  const pageHeight = doc.page.height;
  
  doc.fontSize(8)
     .text('Generated by The Great Outdoors E-Commerce System', 50, pageHeight - 100)
     .text(`Page ${doc.bufferedPageRange().start + 1}`, 450, pageHeight - 100);
};

/**
 * Generate simple sales summary PDF
 */
export const generateSalesSummaryPDF = (salesData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Simple sales summary
      doc.fontSize(18)
         .text('Sales Summary Report', 50, 50);
      
      doc.fontSize(12)
         .text(`Total Sales: ${formatCurrency(salesData.totalRevenue || 0)}`, 50, 100)
         .text(`Total Orders: ${salesData.totalOrders || 0}`, 50, 120)
         .text(`Average Order Value: ${formatCurrency(salesData.averageOrderValue || 0)}`, 50, 140)
         .text(`Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, 50, 180);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  generateOrderReportPDF,
  generateSalesSummaryPDF
};
