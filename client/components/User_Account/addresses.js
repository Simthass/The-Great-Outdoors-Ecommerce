// Sample saved addresses data
let savedAddresses = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        contactNumber: '+1 (555) 123-4567',
        city: 'new-york',
        zipCode: '10001'
    },
    {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        addressLine1: '456 Oak Avenue',
        addressLine2: '',
        contactNumber: '+1 (555) 987-6543',
        city: 'los-angeles',
        zipCode: '90210'
    }
];

// City and zip code mappings
const cityZipMappings = {
    'new-york': ['10001', '10002', '10003', '10004'],
    'los-angeles': ['90210', '90211', '90212', '90213'],
    'chicago': ['60601', '60602', '60603', '60604'],
    'houston': ['77001', '77002', '77003', '77004'],
    'phoenix': ['85001', '85002', '85003', '85004'],
    'philadelphia': ['19101', '19102', '19103', '19104'],
    'san-antonio': ['78201', '78202', '78203', '78204'],
    'san-diego': ['92101', '92102', '92103', '92104'],
    'dallas': ['75201', '75202', '75203', '75204'],
    'san-jose': ['95101', '95102', '95103', '95104']
};

const cityNames = {
    'new-york': 'New York',
    'los-angeles': 'Los Angeles',
    'chicago': 'Chicago',
    'houston': 'Houston',
    'phoenix': 'Phoenix',
    'philadelphia': 'Philadelphia',
    'san-antonio': 'San Antonio',
    'san-diego': 'San Diego',
    'dallas': 'Dallas',
    'san-jose': 'San Jose'
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    displaySavedAddresses();
    setupCityZipDependency();
});

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const addressForm = document.getElementById('addressForm');
    addressForm.addEventListener('submit', handleFormSubmission);

    // Cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    cancelBtn.addEventListener('click', handleCancel);

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

    // Form validation on blur
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
}

// Setup city-zip dependency
function setupCityZipDependency() {
    const citySelect = document.getElementById('city');
    const zipSelect = document.getElementById('zipCode');

    citySelect.addEventListener('change', function() {
        const selectedCity = this.value;
        
        // Clear zip code options
        zipSelect.innerHTML = '<option value="">Select Zip Code</option>';
        
        if (selectedCity && cityZipMappings[selectedCity]) {
            // Add zip codes for selected city
            cityZipMappings[selectedCity].forEach(zip => {
                const option = document.createElement('option');
                option.value = zip;
                option.textContent = `${zip} - ${cityNames[selectedCity]}`;
                zipSelect.appendChild(option);
            });
        }
    });
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    if (validateForm()) {
        const formData = new FormData(e.target);
        const addressData = {
            id: Date.now(), // Simple ID generation
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            addressLine1: formData.get('addressLine1'),
            addressLine2: formData.get('addressLine2') || '',
            contactNumber: formData.get('contactNumber'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode')
        };

        // Add to saved addresses
        savedAddresses.push(addressData);
        
        // Clear form
        e.target.reset();
        
        // Update display
        displaySavedAddresses();
        
        // Show success message
        showMessage('Address added successfully!', 'success');
    }
}

// Handle cancel button
function handleCancel() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        document.getElementById('addressForm').reset();
        clearAllErrors();
        showMessage('Form cleared', 'info');
    }
}

// Validate entire form
function validateForm() {
    const requiredFields = ['firstName', 'lastName', 'addressLine1', 'contactNumber', 'city', 'zipCode'];
    let isValid = true;

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });

    return isValid;
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    field.classList.remove('error');
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Specific field validations
    switch(fieldName) {
        case 'contactNumber':
            if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
        case 'firstName':
        case 'lastName':
            if (value && !/^[a-zA-Z\s]{2,}$/.test(value)) {
                isValid = false;
                errorMessage = 'Name must contain only letters and be at least 2 characters';
            }
            break;
    }

    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Clear field error
function clearError(e) {
    const field = e.target;
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// Clear all errors
function clearAllErrors() {
    document.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.error-message.show').forEach(error => {
        error.classList.remove('show');
    });
}

// Display saved addresses
function displaySavedAddresses() {
    const addressesGrid = document.getElementById('addressesGrid');
    
    if (savedAddresses.length === 0) {
        addressesGrid.innerHTML = `
            <div class="empty-addresses">
                <i class="fas fa-map-marker-alt"></i>
                <h3>No addresses saved yet</h3>
                <p>Add your first address using the form above.</p>
            </div>
        `;
        return;
    }

    addressesGrid.innerHTML = '';
    
    savedAddresses.forEach(address => {
        const addressCard = createAddressCard(address);
        addressesGrid.appendChild(addressCard);
    });
}

// Create address card element
function createAddressCard(address) {
    const card = document.createElement('div');
    card.className = 'address-card';
    card.innerHTML = `
        <div class="address-card-header">
            <div class="address-card-name">${address.firstName} ${address.lastName}</div>
            <div class="address-card-actions">
                <button class="address-action-btn edit" onclick="editAddress(${address.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="address-action-btn delete" onclick="deleteAddress(${address.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="address-details">
            <div class="address-line">${address.addressLine1}</div>
            ${address.addressLine2 ? `<div class="address-line">${address.addressLine2}</div>` : ''}
            <div class="address-line">${cityNames[address.city] || address.city}, ${address.zipCode}</div>
            <div class="contact-info">
                <i class="fas fa-phone"></i> ${address.contactNumber}
            </div>
        </div>
    `;
    return card;
}

// Edit address
function editAddress(id) {
    const address = savedAddresses.find(addr => addr.id === id);
    if (address) {
        // Populate form with address data
        document.getElementById('firstName').value = address.firstName;
        document.getElementById('lastName').value = address.lastName;
        document.getElementById('addressLine1').value = address.addressLine1;
        document.getElementById('addressLine2').value = address.addressLine2;
        document.getElementById('contactNumber').value = address.contactNumber;
        document.getElementById('city').value = address.city;
        
        // Trigger city change to populate zip codes
        document.getElementById('city').dispatchEvent(new Event('change'));
        
        // Set zip code after a short delay
        setTimeout(() => {
            document.getElementById('zipCode').value = address.zipCode;
        }, 100);
        
        // Remove from saved addresses (will be re-added on save)
        savedAddresses = savedAddresses.filter(addr => addr.id !== id);
        displaySavedAddresses();
        
        // Scroll to form
        document.querySelector('.address-form-container').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        showMessage('Address loaded for editing', 'info');
    }
}

// Delete address
function deleteAddress(id) {
    if (confirm('Are you sure you want to delete this address?')) {
        savedAddresses = savedAddresses.filter(addr => addr.id !== id);
        displaySavedAddresses();
        showMessage('Address deleted successfully', 'success');
    }
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
