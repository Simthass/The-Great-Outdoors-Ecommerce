// Sample data for active sessions and security activity
const sessions = [
    { id: 1, device: 'Chrome on Windows', location: 'New York, USA', current: true, lastUsed: 'Just now' },
    { id: 2, device: 'Firefox on Mac', location: 'San Francisco, USA', current: false, lastUsed: '2 days ago' },
    { id: 3, device: 'Edge on Windows', location: 'London, UK', current: false, lastUsed: '5 days ago' }
];

const securityActivity = [
    { id: 1, icon: 'success', title: 'Password Changed', message: 'Your password was changed successfully.', time: 'Just now' },
    { id: 2, icon: 'warning', title: 'Failed Login Attempt', message: 'There was a failed login attempt from Tokyo, Japan.', time: '3 hours ago' },
    { id: 3, icon: 'info', title: 'New Device Login', message: 'Your account was accessed from a new device.', time: '1 day ago' }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    populateSessions();
    populateSecurityActivity();
    setupPasswordStrengthChecker();
    setupPrivacySettings();
});

// Populate active sessions
function populateSessions() {
    const sessionsList = document.getElementById('sessionsList');
    
    if (sessions.length === 0) {
        sessionsList.innerHTML = '
            <div class="empty-sessions">
                <i class="fas fa-history"></i>
                <h3>No active sessions found</h3>
                <p>You are not logged in on any other devices.</p>
            </div>
        ';
        return;
    }
    
    sessionsList.innerHTML = '';
    sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item';
        
        sessionItem.innerHTML = `
            <div class="session-info">
                <h4>${session.device}</h4>
                <p>${session.location}</p>
                ${session.current ? '<span class="session-current">Current Session</span>' : ''}
            </div>
            <div class="session-actions">
                <button class="btn-secondary" onclick="terminateSession(${session.id})">Sign Out</button>
            </div>
        `;
        
        sessionsList.appendChild(sessionItem);
    });
}

// Terminate a session
function terminateSession(sessionId) {
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex > -1) {
        sessions.splice(sessionIndex, 1);
        populateSessions();
        showMessage('Session signed out successfully', 'success');
    }
}

// Populate security activity
function populateSecurityActivity() {
    const activityList = document.getElementById('activityList');
    
    if (securityActivity.length === 0) {
        activityList.innerHTML = '
            <div class="empty-activity">
                <i class="fas fa-list-alt"></i>
                <h3>No recent security activity</h3>
                <p>Your account is secure with no suspicious activity.</p>
            </div>
        ';
        return;
    }
    
    activityList.innerHTML = '';
    securityActivity.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <div class="activity-icon ${activity.icon}">
                <i class="fas fa-${activity.icon === 'success' ? 'check-circle' : (activity.icon === 'warning' ? 'exclamation-triangle' : 'info-circle')}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Setup password strength checker
function setupPasswordStrengthChecker() {
    const newPasswordInput = document.getElementById('newPassword');
    const passwordStrength = document.getElementById('passwordStrength');

    newPasswordInput.addEventListener('input', function() {
        const value = newPasswordInput.value;
        const strength = getPasswordStrength(value);
        passwordStrength.className = 'password-strength ' + strength;
        if (!passwordStrength.firstChild) {
            const strengthBar = document.createElement('div');
            strengthBar.className = 'strength-bar';
            passwordStrength.appendChild(strengthBar);
        }
    });
}

// Password strength logic
function getPasswordStrength(password) {
    let strength = 'weak';
    if (password.length > 7) {
        if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
            strength = 'strong';
        } else if ((/[a-z]/.test(password) && /[A-Z]/.test(password)) || (/[a-z]/.test(password) && /[0-9]/.test(password)) || (/[A-Z]/.test(password) && /[0-9]/.test(password))) {
            strength = 'medium';
        }
    }
    return strength;
}

// Save privacy settings
function setupPrivacySettings() {
    const profileVisibilitySelect = document.getElementById('profileVisibility');
    const shareOrderHistoryToggle = document.getElementById('shareOrderHistory');
    const allowDataCollectionToggle = document.getElementById('allowDataCollection');
    
    const savedSettings = localStorage.getItem('privacySettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        profileVisibilitySelect.value = settings.profileVisibility;
        shareOrderHistoryToggle.checked = settings.shareOrderHistory;
        allowDataCollectionToggle.checked = settings.allowDataCollection;
    }
}

function savePrivacySettings() {
    const settings = {
        profileVisibility: document.getElementById('profileVisibility').value,
        shareOrderHistory: document.getElementById('shareOrderHistory').checked,
        allowDataCollection: document.getElementById('allowDataCollection').checked
    };

    localStorage.setItem('privacySettings', JSON.stringify(settings));
    showMessage('Privacy settings saved successfully!', 'success');
}

// Toggle password visibility
function togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Download security activity log
function downloadSecurityLog() {
    const logContent = "data:text/plain;charset=utf-8," + encodeURIComponent(securityActivity.map(activity => `${activity.title}: ${activity.message} (${activity.time})`).join('\n'));
    const link = document.createElement('a');
    link.setAttribute("href", logContent);
    link.setAttribute("download", "security_log.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showMessage('Security log downloaded', 'success');
}

// Setup two-factor authentication (2FA)
function setupAuthenticator() {
    showModal('Authenticator App', '<p>Scan the QR code with your authentication app to set up 2FA.</p><div class="qr-code-container"><div class="qr-code"><i class="fas fa-qrcode fa-3x"></i></div></div><p><strong>Backup Codes</strong></p><div class="backup-codes"><h4>Here are your backup codes:</h4><div class="codes-list"><p>ABCD-EFGH-IJKL-MNOP</p><p>QRST-UVWX-YZAA-BBCC</p></div><p>Keep these codes safe to recover your account if needed.</p></div>');
}

function setupSMS() {
    const smsSetupContent = '<p>Enter your mobile phone number to receive a text message with a confirmation code.</p><input type="text" placeholder="Phone Number" class="form-control"><button class="btn btn-primary" style="margin-top: 15px;">Verify Number</button>';
    showModal('SMS Verification', smsSetupContent);
}

// Show modal
function showModal(title, content) {
    const modal = document.getElementById('twoFactorModal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `<h3>${title}</h3>${content}`;
    modal.classList.add('show');
}

// Close modal
function closeTwoFactorModal() {
    const modal = document.getElementById('twoFactorModal');
    modal.classList.remove('show');
}

// Terminate all sessions
function terminateAllSessions() {
    if (confirm('Are you sure you want to sign out of all sessions?')) {
        // Clear all sessions except the current one
        sessions.splice(1, sessions.length - 1);
        populateSessions();
        showMessage('Signed out of all devices', 'success');
    }
}

// Export account data
function exportAccountData() {
    const dataContent = "data:text/plain;charset=utf-8," + encodeURIComponent('Exported account data goes here...');
    const link = document.createElement('a');
    link.setAttribute("href", dataContent);
    link.setAttribute("download", "account_data.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showMessage('Account data exported', 'success');
}

// Delete account
function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        showMessage('Account deletion initiated', 'error');
    }
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

// Navigation function
function navigateToPage(page) {
    window.location.href = page;
}
