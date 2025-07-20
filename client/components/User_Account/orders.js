// Orders data - in a real app, this would come from an API
const ordersData = [
    { id: '59217', number: '59217342', status: 'New order', items: 1, shipping: 'Standard', tracking: '94001001093611' },
    { id: '59213', number: '59217343', status: 'In production', items: 2, shipping: 'Priority', tracking: '94001001093611' },
    { id: '59219', number: '59217344', status: 'Shipped', items: 12, shipping: 'Express', tracking: '94001001093611' },
    { id: '59220', number: '59217345', status: 'Cancelled', items: 22, shipping: 'Express', tracking: '94001001093611' },
    { id: '59223', number: '59217348', status: 'Rejected', items: 32, shipping: 'Express', tracking: '94001001093611' },
    { id: '592182', number: '59217346', status: 'Draft', items: 41, shipping: 'Express', tracking: '94001001093611' },
    { id: '592182', number: '59217346', status: 'Draft', items: 41, shipping: 'Express', tracking: '94001001093611' },
    { id: '592182', number: '59217347', status: 'Draft', items: 41, shipping: 'Priority', tracking: '94001001093611' },
    { id: '592182', number: '59217347', status: 'Draft', items: 41, shipping: 'Express', tracking: '94001001093611' },
    { id: '592182', number: '59217347', status: 'Draft', items: 44, shipping: 'Express', tracking: '94001001093611' }
];

let currentPage = 1;
let filteredOrders = [...ordersData];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    displayOrders();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);

    // Filter functionality
    const orderIdFilter = document.getElementById('orderIdFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    orderIdFilter.addEventListener('change', handleFilter);
    statusFilter.addEventListener('change', handleFilter);

    // Edit buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) {
            handleEditOrder(e);
        }
    });

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Handle search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredOrders = ordersData.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.number.toLowerCase().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm) ||
        order.tracking.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    displayOrders();
    updatePagination();
}

// Handle filter functionality
function handleFilter() {
    const orderIdFilter = document.getElementById('orderIdFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredOrders = ordersData.filter(order => {
        const matchesOrderId = !orderIdFilter || order.id === orderIdFilter;
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesOrderId && matchesStatus;
    });
    
    currentPage = 1;
    displayOrders();
    updatePagination();
}

// Display orders in the table
function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);
    
    ordersToShow.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
    
    // Update results info
    updateResultsInfo();
}

// Create a table row for an order
function createOrderRow(order) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.number}</td>
        <td><span class="status-badge ${getStatusClass(order.status)}">${order.status}</span></td>
        <td>${order.items}</td>
        <td><span class="shipping-badge ${getShippingClass(order.shipping)}">${order.shipping}</span></td>
        <td>${order.tracking}</td>
        <td><button class="edit-btn" data-order-id="${order.id}"><i class="fas fa-edit"></i></button></td>
    `;
    
    return row;
}

// Get CSS class for status badge
function getStatusClass(status) {
    return status.toLowerCase().replace(' ', '-');
}

// Get CSS class for shipping badge
function getShippingClass(shipping) {
    return shipping.toLowerCase();
}

// Handle edit order action
function handleEditOrder(e) {
    const orderId = e.target.closest('.edit-btn').dataset.orderId;
    showMessage(`Edit order ${orderId} functionality would be implemented here`, 'info');
}

// Pagination functionality
function changePage(page) {
    const totalPages = Math.ceil(filteredOrders.length / 10);
    
    if (page === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (page === 'next' && currentPage < totalPages) {
        currentPage++;
    } else if (typeof page === 'number' && page >= 1 && page <= totalPages) {
        currentPage = page;
    }
    
    displayOrders();
    updatePagination();
}

// Update pagination buttons
function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / 10);
    const paginationContainer = document.querySelector('.pagination');
    
    // Clear existing pagination
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = () => changePage('prev');
    prevBtn.disabled = currentPage === 1;
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 1; i <= Math.min(totalPages, 10); i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        paginationContainer.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = () => changePage('next');
    nextBtn.disabled = currentPage === totalPages;
    paginationContainer.appendChild(nextBtn);
}

// Update results information
function updateResultsInfo() {
    const totalResults = filteredOrders.length;
    const startIndex = (currentPage - 1) * 10 + 1;
    const endIndex = Math.min(currentPage * 10, totalResults);
    
    const infoElement = document.querySelector('.pagination-info');
    infoElement.textContent = `Showing ${startIndex} to ${endIndex} of ${totalResults} results`;
}

// Navigation between pages
function navigateToPage(page) {
    window.location.href = page;
}

// Show message function (reused from main script)
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#f44336';
            break;
        case 'info':
            messageDiv.style.backgroundColor = '#2196F3';
            break;
        default:
            messageDiv.style.backgroundColor = '#333';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Export functionality (if needed)
function exportOrders() {
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Order ID,Order Number,Status,Items,Shipping Service,Tracking Code\n" +
        filteredOrders.map(order => 
            `${order.id},${order.number},${order.status},${order.items},${order.shipping},${order.tracking}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('Orders exported successfully!', 'success');
}
