// Sample notifications data
let notifications = [
    {
        id: 1,
        type: 'orders',
        title: 'Order Shipped',
        message: 'Your order #59217342 has been shipped and is on its way to you.',
        time: '2 hours ago',
        read: false,
        icon: 'fas fa-shipping-fast'
    },
    {
        id: 2,
        type: 'security',
        title: 'Security Alert',
        message: 'New login detected from Chrome on Windows. If this wasn\'t you, please secure your account.',
        time: '4 hours ago',
        read: false,
        icon: 'fas fa-shield-alt'
    },
    {
        id: 3,
        type: 'promotions',
        title: 'Special Offer',
        message: 'Get 20% off on your next order! Use code SAVE20 at checkout.',
        time: '1 day ago',
        read: true,
        icon: 'fas fa-tag'
    },
    {
        id: 4,
        type: 'orders',
        title: 'Order Delivered',
        message: 'Your order #59217344 has been delivered successfully.',
        time: '2 days ago',
        read: true,
        icon: 'fas fa-check-circle'
    },
    {
        id: 5,
        type: 'security',
        title: 'Password Changed',
        message: 'Your account password was successfully changed.',
        time: '3 days ago',
        read: true,
        icon: 'fas fa-key'
    },
    {
        id: 6,
        type: 'promotions',
        title: 'New Products Available',
        message: 'Check out our latest collection of summer essentials.',
        time: '5 days ago',
        read: true,
        icon: 'fas fa-star'
    },
    {
        id: 7,
        type: 'orders',
        title: 'Order Confirmed',
        message: 'Your order #59217348 has been confirmed and is being processed.',
        time: '1 week ago',
        read: true,
        icon: 'fas fa-check'
    },
    {
        id: 8,
        type: 'system',
        title: 'Account Updated',
        message: 'Your profile information has been updated successfully.',
        time: '1 week ago',
        read: true,
        icon: 'fas fa-user-edit'
    }
];

let currentFilter = 'all';
let displayedNotifications = 4; // Initial number of notifications to show

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    displayNotifications();
    updateUnreadCount();
});

// Setup event listeners
function setupEventListeners() {
    // Toggle switches for notification types
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', handleToggleChange);
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });

    // Toolbar actions
    document.getElementById('markAllRead').addEventListener('click', markAllAsRead);
    document.getElementById('clearAll').addEventListener('click', clearAllNotifications);
    document.getElementById('loadMore').addEventListener('click', loadMoreNotifications);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);

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

// Handle toggle switch changes
function handleToggleChange(e) {
    const toggle = e.target;
    const optionsId = toggle.id.replace('Notifications', 'Options');
    const optionsElement = document.getElementById(optionsId);
    
    if (optionsElement) {
        if (toggle.checked) {
            optionsElement.style.display = 'block';
            optionsElement.style.animation = 'slideDown 0.3s ease-out';
        } else {
            optionsElement.style.display = 'none';
            // Also uncheck all sub-options
            const subOptions = optionsElement.querySelectorAll('input[type="checkbox"]');
            subOptions.forEach(option => option.checked = false);
        }
    }
}

// Handle filter changes
function handleFilterChange(e) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    displayedNotifications = 4; // Reset to initial count
    displayNotifications();
}

// Display notifications based on current filter
function displayNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    
    let filteredNotifications = notifications;
    
    // Apply filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'unread') {
            filteredNotifications = notifications.filter(n => !n.read);
        } else {
            filteredNotifications = notifications.filter(n => n.type === currentFilter);
        }
    }
    
    // Show only the specified number of notifications
    const notificationsToShow = filteredNotifications.slice(0, displayedNotifications);
    
    if (notificationsToShow.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-notifications">
                <i class="fas fa-bell-slash"></i>
                <h3>No notifications found</h3>
                <p>You don't have any ${currentFilter === 'all' ? '' : currentFilter} notifications at the moment.</p>
            </div>
        `;
    } else {
        notificationsList.innerHTML = '';
        notificationsToShow.forEach(notification => {
            const notificationElement = createNotificationElement(notification);
            notificationsList.appendChild(notificationElement);
        });
    }
    
    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMore');
    if (filteredNotifications.length > displayedNotifications) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Create notification element
function createNotificationElement(notification) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification-item ${notification.read ? '' : 'unread'}`;
    notificationDiv.dataset.id = notification.id;
    
    notificationDiv.innerHTML = `
        <div class="notification-icon ${notification.type}">
            <i class="${notification.icon}"></i>
        </div>
        <div class="notification-content">
            <h4 class="notification-title">${notification.title}</h4>
            <p class="notification-message">${notification.message}</p>
            <span class="notification-time">${notification.time}</span>
        </div>
        <div class="notification-actions">
            ${!notification.read ? `<button class="notification-action" onclick="markAsRead(${notification.id})" title="Mark as read">
                <i class="fas fa-check"></i>
            </button>` : ''}
            <button class="notification-action" onclick="deleteNotification(${notification.id})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add click handler to mark as read when clicked
    notificationDiv.addEventListener('click', function(e) {
        if (!e.target.closest('.notification-actions') && !notification.read) {
            markAsRead(notification.id);
        }
    });
    
    return notificationDiv;
}

// Mark single notification as read
function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        displayNotifications();
        updateUnreadCount();
        showMessage('Notification marked as read', 'info');
    }
}

// Delete single notification
function deleteNotification(id) {
    if (confirm('Are you sure you want to delete this notification?')) {
        notifications = notifications.filter(n => n.id !== id);
        displayNotifications();
        updateUnreadCount();
        showMessage('Notification deleted', 'success');
    }
}

// Mark all notifications as read
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    displayNotifications();
    updateUnreadCount();
    showMessage('All notifications marked as read', 'success');
}

// Clear all notifications
function clearAllNotifications() {
    if (confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
        notifications = [];
        displayNotifications();
        updateUnreadCount();
        showMessage('All notifications cleared', 'success');
    }
}

// Load more notifications
function loadMoreNotifications() {
    displayedNotifications += 4;
    displayNotifications();
}

// Update unread notifications count
function updateUnreadCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update filter button text
    const unreadBtn = document.querySelector('.filter-btn[data-filter="unread"]');
    if (unreadBtn) {
        unreadBtn.textContent = `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`;
    }
    
    // You could also update a badge in the sidebar here
    updateSidebarBadge(unreadCount);
}

// Update sidebar notification badge
function updateSidebarBadge(count) {
    const notificationNavItem = document.querySelector('.nav-item.active');
    let badge = notificationNavItem.querySelector('.notification-badge');
    
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'notification-badge';
            notificationNavItem.style.position = 'relative';
            notificationNavItem.appendChild(badge);
        }
        badge.textContent = count > 99 ? '99+' : count;
    } else {
        if (badge) {
            badge.remove();
        }
    }
}

// Save notification settings
function saveSettings() {
    const settings = {
        email: {
            enabled: document.getElementById('emailNotifications').checked,
            orderUpdates: document.getElementById('orderUpdates').checked,
            promotions: document.getElementById('promotions').checked,
            accountSecurity: document.getElementById('accountSecurity').checked
        },
        sms: {
            enabled: document.getElementById('smsNotifications').checked,
            orderUpdates: document.getElementById('smsOrderUpdates').checked,
            accountAlerts: document.getElementById('smsAccountAlerts').checked
        },
        push: {
            enabled: document.getElementById('pushNotifications').checked,
            orderUpdates: document.getElementById('pushOrderUpdates').checked,
            messages: document.getElementById('pushMessages').checked
        }
    };
    
    // In a real app, this would be sent to the server
    console.log('Notification settings saved:', settings);
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    showMessage('Notification settings saved successfully!', 'success');
}

// Load saved settings
function loadSettings() {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Apply email settings
        document.getElementById('emailNotifications').checked = settings.email.enabled;
        document.getElementById('orderUpdates').checked = settings.email.orderUpdates;
        document.getElementById('promotions').checked = settings.email.promotions;
        document.getElementById('accountSecurity').checked = settings.email.accountSecurity;
        
        // Apply SMS settings
        document.getElementById('smsNotifications').checked = settings.sms.enabled;
        document.getElementById('smsOrderUpdates').checked = settings.sms.orderUpdates;
        document.getElementById('smsAccountAlerts').checked = settings.sms.accountAlerts;
        
        // Apply push settings
        document.getElementById('pushNotifications').checked = settings.push.enabled;
        document.getElementById('pushOrderUpdates').checked = settings.push.orderUpdates;
        document.getElementById('pushMessages').checked = settings.push.messages;
        
        // Update options visibility
        updateOptionsVisibility();
    }
}

// Update options visibility based on toggle states
function updateOptionsVisibility() {
    const toggles = [
        { toggle: 'emailNotifications', options: 'emailOptions' },
        { toggle: 'smsNotifications', options: 'smsOptions' },
        { toggle: 'pushNotifications', options: 'pushOptions' }
    ];
    
    toggles.forEach(({ toggle, options }) => {
        const toggleElement = document.getElementById(toggle);
        const optionsElement = document.getElementById(options);
        
        if (toggleElement && optionsElement) {
            optionsElement.style.display = toggleElement.checked ? 'block' : 'none';
        }
    });
}

// Navigation function
function navigateToPage(page) {
    window.location.href = page;
}

// Show message function
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

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});

// Simulate receiving new notifications
function simulateNewNotification() {
    const newNotification = {
        id: Date.now(),
        type: 'orders',
        title: 'New Order Update',
        message: 'Your recent order has a new status update.',
        time: 'Just now',
        read: false,
        icon: 'fas fa-info-circle'
    };
    
    notifications.unshift(newNotification);
    displayNotifications();
    updateUnreadCount();
    
    // Show browser notification if supported and enabled
    if (Notification.permission === 'granted' && document.getElementById('pushNotifications').checked) {
        new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico'
        });
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showMessage('Browser notifications enabled!', 'success');
            }
        });
    }
}

// Add notification permission request when push notifications are enabled
document.addEventListener('DOMContentLoaded', function() {
    const pushToggle = document.getElementById('pushNotifications');
    if (pushToggle) {
        pushToggle.addEventListener('change', function() {
            if (this.checked && 'Notification' in window) {
                requestNotificationPermission();
            }
        });
    }
});
