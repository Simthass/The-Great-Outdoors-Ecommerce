import XLSX from 'xlsx';
import moment from 'moment';
import { formatCurrency } from './reportUtils.js';

/**
 * Generate Excel workbook for order reports
 */
export const generateOrderReportExcel = (reportData, reportType) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    if (reportData.metrics) {
      const summarySheet = createSummarySheet(reportData.metrics, reportData.dateRange);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }
    
    // Orders sheet
    if (reportData.orders && reportData.orders.length > 0) {
      const ordersSheet = createOrdersSheet(reportData.orders);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');
    }
    
    // Product metrics sheet
    if (reportData.productMetrics && reportData.productMetrics.length > 0) {
      const productsSheet = createProductMetricsSheet(reportData.productMetrics);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Product Analysis');
    }
    
    // Customer metrics sheet
    if (reportData.metrics.topCustomers && reportData.metrics.topCustomers.length > 0) {
      const customersSheet = createCustomersSheet(reportData.metrics.topCustomers);
      XLSX.utils.book_append_sheet(workbook, customersSheet, 'Top Customers');
    }
    
    // Time series sheet
    if (reportData.timeSeriesData && reportData.timeSeriesData.length > 0) {
      const timeSeriesSheet = createTimeSeriesSheet(reportData.timeSeriesData);
      XLSX.utils.book_append_sheet(workbook, timeSeriesSheet, 'Trends');
    }
    
    // Order status breakdown sheet
    if (reportData.metrics.ordersByStatus) {
      const statusSheet = createOrderStatusSheet(reportData.metrics);
      XLSX.utils.book_append_sheet(workbook, statusSheet, 'Order Status');
    }
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
  } catch (error) {
    throw new Error(`Excel generation failed: ${error.message}`);
  }
};

/**
 * Create summary sheet
 */
const createSummarySheet = (metrics, dateRange) => {
  const summaryData = [
    ['The Great Outdoors - Order Report Summary'],
    [`Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}`],
    [`Period: ${dateRange ? `${dateRange.startDateString} to ${dateRange.endDateString}` : 'All time'}`],
    [],
    ['Key Metrics', 'Value'],
    ['Total Orders', metrics.totalOrders || 0],
    ['Total Revenue', metrics.totalRevenue || 0],
    ['Average Order Value', metrics.averageOrderValue || 0],
    ['Total Tax', metrics.totalTax || 0],
    ['Total Shipping', metrics.totalShipping || 0],
    ['Total Discounts', metrics.totalDiscount || 0],
    ['Unique Customers', metrics.uniqueCustomerCount || 0],
    [],
    ['Order Status Breakdown', 'Count']
  ];
  
  // Add order status data
  if (metrics.ordersByStatus) {
    Object.entries(metrics.ordersByStatus).forEach(([status, count]) => {
      summaryData.push([status, count]);
    });
  }
  
  summaryData.push([]);
  summaryData.push(['Payment Status Breakdown', 'Count']);
  
  // Add payment status data
  if (metrics.ordersByPaymentStatus) {
    Object.entries(metrics.ordersByPaymentStatus).forEach(([status, count]) => {
      summaryData.push([status, count]);
    });
  }
  
  summaryData.push([]);
  summaryData.push(['Payment Method Breakdown', 'Count']);
  
  // Add payment method data
  if (metrics.ordersByPaymentMethod) {
    Object.entries(metrics.ordersByPaymentMethod).forEach(([method, count]) => {
      summaryData.push([method, count]);
    });
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Apply formatting
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  
  // Make headers bold (this is a basic approach, full formatting requires more complex setup)
  worksheet['A1'].s = { font: { bold: true, sz: 14 } };
  worksheet['A5'].s = { font: { bold: true } };
  worksheet['B5'].s = { font: { bold: true } };
  
  return worksheet;
};

/**
 * Create orders sheet
 */
const createOrdersSheet = (orders) => {
  const headers = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'Customer Email',
    'Order Status',
    'Payment Status',
    'Payment Method',
    'Subtotal',
    'Tax',
    'Shipping',
    'Discount',
    'Grand Total',
    'Items Count',
    'Shipping Address',
    'Tracking Number',
    'Notes'
  ];
  
  const ordersData = orders.map(order => {
    const grandTotal = order.totalAmount + order.tax + order.shippingCost - order.discount;
    const customerName = order.user ? 
      (order.user.firstName && order.user.lastName ? 
        `${order.user.firstName} ${order.user.lastName}` : '') : '';
    const customerEmail = order.user ? order.user.email : '';
    const itemsCount = order.items ? order.items.length : 0;
    const shippingAddress = order.shippingAddress ? 
      `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.province}` : '';
    
    return [
      order.orderId || order._id.toString(),
      moment(order.orderDate).format('YYYY-MM-DD HH:mm:ss'),
      customerName,
      customerEmail,
      order.orderStatus,
      order.paymentStatus,
      order.paymentMethod,
      order.totalAmount || 0,
      order.tax || 0,
      order.shippingCost || 0,
      order.discount || 0,
      grandTotal,
      itemsCount,
      shippingAddress,
      order.trackingNumber || '',
      order.notes || ''
    ];
  });
  
  const sheetData = [headers, ...ordersData];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Auto-size columns
  const colWidths = headers.map(() => ({ wpx: 120 }));
  worksheet['!cols'] = colWidths;
  
  return worksheet;
};

/**
 * Create product metrics sheet
 */
const createProductMetricsSheet = (productMetrics) => {
  const headers = [
    'Product ID',
    'Product Name',
    'SKU',
    'Total Quantity Sold',
    'Total Revenue',
    'Order Count',
    'Average Price',
    'Revenue per Order'
  ];
  
  const productsData = productMetrics.map(product => [
    product.productId,
    product.productName,
    product.sku || '',
    product.totalQuantitySold,
    product.totalRevenue,
    product.orderCount,
    product.averagePrice,
    product.totalRevenue / product.orderCount
  ]);
  
  const sheetData = [headers, ...productsData];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Auto-size columns
  const colWidths = headers.map(() => ({ wpx: 150 }));
  worksheet['!cols'] = colWidths;
  
  return worksheet;
};

/**
 * Create customers sheet
 */
const createCustomersSheet = (topCustomers) => {
  const headers = [
    'Customer ID',
    'Customer Name',
    'Order Count',
    'Total Spent',
    'Average Order Value',
    'Customer Rank'
  ];
  
  const customersData = topCustomers.map((customer, index) => [
    customer.customerId,
    customer.customerName,
    customer.orderCount,
    customer.totalSpent,
    customer.totalSpent / customer.orderCount,
    index + 1
  ]);
  
  const sheetData = [headers, ...customersData];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Auto-size columns
  const colWidths = headers.map(() => ({ wpx: 150 }));
  worksheet['!cols'] = colWidths;
  
  return worksheet;
};

/**
 * Create time series sheet
 */
const createTimeSeriesSheet = (timeSeriesData) => {
  const headers = [
    'Date',
    'Period',
    'Orders Count',
    'Revenue',
    'Average Order Value',
    'Cumulative Revenue'
  ];
  
  let cumulativeRevenue = 0;
  const timeSeriesArray = timeSeriesData.map(data => {
    cumulativeRevenue += data.revenue;
    return [
      data.date,
      data.period,
      data.orders,
      data.revenue,
      data.averageOrderValue,
      cumulativeRevenue
    ];
  });
  
  const sheetData = [headers, ...timeSeriesArray];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Auto-size columns
  const colWidths = headers.map(() => ({ wpx: 120 }));
  worksheet['!cols'] = colWidths;
  
  return worksheet;
};

/**
 * Create order status breakdown sheet
 */
const createOrderStatusSheet = (metrics) => {
  const statusData = [
    ['Order Status Analysis'],
    [],
    ['Status', 'Count', 'Percentage']
  ];
  
  const totalOrders = metrics.totalOrders || 0;
  
  if (metrics.ordersByStatus) {
    Object.entries(metrics.ordersByStatus).forEach(([status, count]) => {
      const percentage = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
      statusData.push([status, count, `${percentage}%`]);
    });
  }
  
  statusData.push([]);
  statusData.push(['Payment Status Analysis']);
  statusData.push([]);
  statusData.push(['Payment Status', 'Count', 'Percentage']);
  
  if (metrics.ordersByPaymentStatus) {
    Object.entries(metrics.ordersByPaymentStatus).forEach(([status, count]) => {
      const percentage = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
      statusData.push([status, count, `${percentage}%`]);
    });
  }
  
  statusData.push([]);
  statusData.push(['Payment Method Analysis']);
  statusData.push([]);
  statusData.push(['Payment Method', 'Count', 'Percentage']);
  
  if (metrics.ordersByPaymentMethod) {
    Object.entries(metrics.ordersByPaymentMethod).forEach(([method, count]) => {
      const percentage = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
      statusData.push([method, count, `${percentage}%`]);
    });
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(statusData);
  
  // Auto-size columns
  worksheet['!cols'] = [
    { wpx: 200 },
    { wpx: 100 },
    { wpx: 100 }
  ];
  
  return worksheet;
};

/**
 * Generate simple order list Excel
 */
export const generateOrderListExcel = (orders) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    const headers = [
      'Order ID',
      'Date',
      'Customer',
      'Email',
      'Status',
      'Payment Status',
      'Total Amount',
      'Items'
    ];
    
    const ordersData = orders.map(order => {
      const customerName = order.user ? 
        (order.user.firstName && order.user.lastName ? 
          `${order.user.firstName} ${order.user.lastName}` : order.user.email) : 'N/A';
      const customerEmail = order.user ? order.user.email : 'N/A';
      const totalAmount = order.totalAmount + order.tax + order.shippingCost - order.discount;
      const itemsList = order.items ? 
        order.items.map(item => `${item.productName} (${item.quantity})`).join('; ') : '';
      
      return [
        order.orderId || order._id.toString(),
        moment(order.orderDate).format('YYYY-MM-DD'),
        customerName,
        customerEmail,
        order.orderStatus,
        order.paymentStatus,
        totalAmount,
        itemsList
      ];
    });
    
    const sheetData = [headers, ...ordersData];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Auto-size columns
    const colWidths = [
      { wpx: 120 }, // Order ID
      { wpx: 100 }, // Date
      { wpx: 150 }, // Customer
      { wpx: 200 }, // Email
      { wpx: 100 }, // Status
      { wpx: 120 }, // Payment Status
      { wpx: 100 }, // Total Amount
      { wpx: 300 }  // Items
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
  } catch (error) {
    throw new Error(`Excel generation failed: ${error.message}`);
  }
};

/**
 * Generate product sales Excel report
 */
export const generateProductSalesExcel = (productMetrics) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    const headers = [
      'Rank',
      'Product Name',
      'SKU',
      'Quantity Sold',
      'Revenue',
      'Average Price',
      'Orders',
      'Revenue per Order'
    ];
    
    const productsData = productMetrics.map((product, index) => [
      index + 1,
      product.productName,
      product.sku || 'N/A',
      product.totalQuantitySold,
      product.totalRevenue,
      product.averagePrice,
      product.orderCount,
      (product.totalRevenue / product.orderCount).toFixed(2)
    ]);
    
    const sheetData = [
      ['Product Sales Report'],
      [`Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}`],
      [],
      headers,
      ...productsData
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Auto-size columns
    const colWidths = [
      { wpx: 60 },  // Rank
      { wpx: 250 }, // Product Name
      { wpx: 100 }, // SKU
      { wpx: 100 }, // Quantity
      { wpx: 120 }, // Revenue
      { wpx: 100 }, // Avg Price
      { wpx: 80 },  // Orders
      { wpx: 120 }  // Revenue per Order
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Sales');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
  } catch (error) {
    throw new Error(`Excel generation failed: ${error.message}`);
  }
};

export default {
  generateOrderReportExcel,
  generateOrderListExcel,
  generateProductSalesExcel
};
