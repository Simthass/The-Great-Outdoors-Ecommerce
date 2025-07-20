// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });

    // Avatar upload functionality
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarImg = document.getElementById('avatar-img');

    avatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const profileData = {};
        
        for (let [key, value] of formData.entries()) {
            profileData[key] = value;
        }
        
        console.log('Profile data:', profileData);
        
        // Show success message
        showMessage('Profile updated successfully!', 'success');
    });

    // Cancel button functionality
    const cancelBtn = document.querySelector('.btn-cancel');
    cancelBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            profileForm.reset();
            showMessage('Changes cancelled', 'info');
        }
    });

    // Load sample data (in a real app, this would come from an API)
    loadSampleData();
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordEye = document.getElementById('password-eye');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordEye.classList.remove('fa-eye');
        passwordEye.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordEye.classList.remove('fa-eye-slash');
        passwordEye.classList.add('fa-eye');
    }
}

// Show message function
function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Style the message
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
    
    // Set background color based on type
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
    
    // Animate in
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Load sample data
function loadSampleData() {
    const sampleData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        address: '123 Main Street',
        contactNumber: '+1 (555) 123-4567',
        city: 'new-york',
        state: 'new-york'
    };
    
    // Fill form with sample data
    Object.keys(sampleData).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = sampleData[key];
        }
    });
}

// Form validation
function validateForm() {
    const requiredFields = ['firstName', 'lastName', 'email'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            field.style.borderColor = '#f44336';
            isValid = false;
        } else {
            field.style.borderColor = '#ccc';
        }
    });
    
    // Email validation
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
        email.style.borderColor = '#f44336';
        isValid = false;
    }
    
    return isValid;
}

// Add input event listeners for real-time validation
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#f44336';
            } else {
                this.style.borderColor = '#ccc';
            }
        });
    });
});

// Navigation function
function navigateToPage(page) {
    window.location.href = page;
}
