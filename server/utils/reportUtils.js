import moment from 'moment';

/**
 * Date range utilities for reports
 */
export const getDateRange = (period, customStart, customEnd) => {
  const now = moment();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = now.clone().startOf('day');
      endDate = now.clone().endOf('day');
      break;
    case 'yesterday':
      startDate = now.clone().subtract(1, 'day').startOf('day');
      endDate = now.clone().subtract(1, 'day').endOf('day');
      break;
    case 'week':
      startDate = now.clone().startOf('week');
      endDate = now.clone().endOf('week');
      break;
    case 'month':
      startDate = now.clone().startOf('month');
      endDate = now.clone().endOf('month');
      break;
    case 'quarter':
      startDate = now.clone().startOf('quarter');
      endDate = now.clone().endOf('quarter');
      break;
    case 'year':
      startDate = now.clone().startOf('year');
      endDate = now.clone().endOf('year');
      break;
    case 'last7days':
      startDate = now.clone().subtract(7, 'days').startOf('day');
      endDate = now.clone().endOf('day');
      break;
    case 'last30days':
      startDate = now.clone().subtract(30, 'days').startOf('day');
      endDate = now.clone().endOf('day');
      break;
    case 'last90days':
      startDate = now.clone().subtract(90, 'days').startOf('day');
      endDate = now.clone().endOf('day');
      break;
    case 'custom':
      startDate = customStart ? moment(customStart).startOf('day') : now.clone().subtract(30, 'days').startOf('day');
      endDate = customEnd ? moment(customEnd).endOf('day') : now.clone().endOf('day');
      break;
    default:
      startDate = now.clone().subtract(30, 'days').startOf('day');
      endDate = now.clone().endOf('day');
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    startDateString: startDate.format('YYYY-MM-DD'),
    endDateString: endDate.format('YYYY-MM-DD'),
    period
  };
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format currency values
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Group orders by time period
 */
export const groupOrdersByPeriod = (orders, period = 'day') => {
  const groups = {};
  
  orders.forEach(order => {
    let key;
    const orderDate = moment(order.orderDate);
    
    switch (period) {
      case 'hour':
        key = orderDate.format('YYYY-MM-DD HH:00');
        break;
      case 'day':
        key = orderDate.format('YYYY-MM-DD');
        break;
      case 'week':
        key = orderDate.format('YYYY-[W]WW');
        break;
      case 'month':
        key = orderDate.format('YYYY-MM');
        break;
      case 'year':
        key = orderDate.format('YYYY');
        break;
      default:
        key = orderDate.format('YYYY-MM-DD');
    }
    
    if (!groups[key]) {
      groups[key] = {
        period: key,
        orders: [],
        count: 0,
        revenue: 0,
        averageOrderValue: 0
      };
    }
    
    groups[key].orders.push(order);
    groups[key].count++;
    groups[key].revenue += (order.totalAmount + order.tax + order.shippingCost - order.discount);
  });
  
  // Calculate average order value for each group
  Object.keys(groups).forEach(key => {
    groups[key].averageOrderValue = groups[key].revenue / groups[key].count;
  });
  
  return groups;
};

/**
 * Calculate order metrics
 */
export const calculateOrderMetrics = (orders) => {
  const metrics = {
    totalOrders: orders.length,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalTax: 0,
    totalShipping: 0,
    totalDiscount: 0,
    ordersByStatus: {},
    ordersByPaymentStatus: {},
    ordersByPaymentMethod: {},
    topCustomers: {},
    uniqueCustomers: new Set(),
  };

  orders.forEach(order => {
    // Revenue calculations
    const orderRevenue = order.totalAmount + order.tax + order.shippingCost - order.discount;
    metrics.totalRevenue += orderRevenue;
    metrics.totalTax += order.tax || 0;
    metrics.totalShipping += order.shippingCost || 0;
    metrics.totalDiscount += order.discount || 0;

    // Status groupings
    metrics.ordersByStatus[order.orderStatus] = 
      (metrics.ordersByStatus[order.orderStatus] || 0) + 1;
    
    metrics.ordersByPaymentStatus[order.paymentStatus] = 
      (metrics.ordersByPaymentStatus[order.paymentStatus] || 0) + 1;
    
    metrics.ordersByPaymentMethod[order.paymentMethod] = 
      (metrics.ordersByPaymentMethod[order.paymentMethod] || 0) + 1;

    // Customer analysis
    if (order.user && order.user._id) {
      const customerId = order.user._id.toString();
      metrics.uniqueCustomers.add(customerId);
      
      if (!metrics.topCustomers[customerId]) {
        metrics.topCustomers[customerId] = {
          customerId,
          customerName: order.user.firstName && order.user.lastName ? 
            `${order.user.firstName} ${order.user.lastName}` : 
            order.user.email,
          orderCount: 0,
          totalSpent: 0,
        };
      }
      metrics.topCustomers[customerId].orderCount++;
      metrics.topCustomers[customerId].totalSpent += orderRevenue;
    }
  });

  // Calculate average order value
  metrics.averageOrderValue = metrics.totalOrders > 0 ? 
    metrics.totalRevenue / metrics.totalOrders : 0;

  // Convert top customers to array and sort
  metrics.topCustomers = Object.values(metrics.topCustomers)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  metrics.uniqueCustomerCount = metrics.uniqueCustomers.size;
  delete metrics.uniqueCustomers; // Remove Set object for JSON serialization

  return metrics;
};

/**
 * Calculate product metrics from orders
 */
export const calculateProductMetrics = (orders) => {
  const productMetrics = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.productId ? item.productId.toString() : 'unknown';
      
      if (!productMetrics[productId]) {
        productMetrics[productId] = {
          productId,
          productName: item.productName,
          sku: item.sku || '',
          totalQuantitySold: 0,
          totalRevenue: 0,
          orderCount: 0,
          averagePrice: 0,
        };
      }
      
      productMetrics[productId].totalQuantitySold += item.quantity;
      productMetrics[productId].totalRevenue += item.total;
      productMetrics[productId].orderCount++;
    });
  });
  
  // Calculate average price and sort by revenue
  return Object.values(productMetrics)
    .map(product => {
      product.averagePrice = product.totalRevenue / product.totalQuantitySold;
      return product;
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
};

/**
 * Generate time series data for charts
 */
export const generateTimeSeriesData = (orders, period = 'day', dateRange) => {
  const { startDate, endDate } = dateRange;
  const timeFormat = period === 'hour' ? 'YYYY-MM-DD HH:00' : 
                    period === 'day' ? 'YYYY-MM-DD' :
                    period === 'week' ? 'YYYY-[W]WW' :
                    period === 'month' ? 'YYYY-MM' : 'YYYY';

  const data = [];
  const current = moment(startDate);
  const end = moment(endDate);

  while (current <= end) {
    const key = current.format(timeFormat);
    const periodOrders = orders.filter(order => {
      const orderDate = moment(order.orderDate);
      return orderDate.format(timeFormat) === key;
    });

    const revenue = periodOrders.reduce((sum, order) => {
      return sum + (order.totalAmount + order.tax + order.shippingCost - order.discount);
    }, 0);

    data.push({
      date: current.format('YYYY-MM-DD'),
      period: key,
      orders: periodOrders.length,
      revenue,
      averageOrderValue: periodOrders.length > 0 ? revenue / periodOrders.length : 0
    });

    current.add(1, period);
  }

  return data;
};

/**
 * Calculate growth metrics
 */
export const calculateGrowthMetrics = (currentMetrics, previousMetrics) => {
  return {
    revenueGrowth: calculatePercentageChange(
      currentMetrics.totalRevenue, 
      previousMetrics.totalRevenue
    ),
    orderGrowth: calculatePercentageChange(
      currentMetrics.totalOrders, 
      previousMetrics.totalOrders
    ),
    customerGrowth: calculatePercentageChange(
      currentMetrics.uniqueCustomerCount, 
      previousMetrics.uniqueCustomerCount
    ),
    avgOrderValueGrowth: calculatePercentageChange(
      currentMetrics.averageOrderValue, 
      previousMetrics.averageOrderValue
    ),
  };
};

/**
 * Validate report parameters
 */
export const validateReportParams = (params) => {
  const errors = [];
  
  if (params.period === 'custom') {
    if (!params.startDate) errors.push('Start date is required for custom period');
    if (!params.endDate) errors.push('End date is required for custom period');
    
    if (params.startDate && params.endDate) {
      const start = moment(params.startDate);
      const end = moment(params.endDate);
      
      if (!start.isValid()) errors.push('Invalid start date format');
      if (!end.isValid()) errors.push('Invalid end date format');
      if (start.isAfter(end)) errors.push('Start date must be before end date');
      
      // Limit date range to 1 year for performance
      if (end.diff(start, 'days') > 365) {
        errors.push('Date range cannot exceed 365 days');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format report data for export
 */
export const formatReportForExport = (reportData, reportType) => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  
  return {
    reportInfo: {
      title: `${reportType} Report`,
      generated: timestamp,
      period: reportData.dateRange?.period || 'custom',
      dateRange: reportData.dateRange ? 
        `${reportData.dateRange.startDateString} to ${reportData.dateRange.endDateString}` : 
        'All time'
    },
    ...reportData
  };
};

export default {
  getDateRange,
  calculatePercentageChange,
  formatCurrency,
  formatPercentage,
  groupOrdersByPeriod,
  calculateOrderMetrics,
  calculateProductMetrics,
  generateTimeSeriesData,
  calculateGrowthMetrics,
  validateReportParams,
  formatReportForExport
};
