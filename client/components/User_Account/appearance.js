// Appearance Settings JavaScript

// Default settings
let currentSettings = {
    theme: 'default',
    displayMode: 'light',
    sidebarStyle: 'fixed',
    contentWidth: 'normal',
    enableAnimations: true,
    fontSize: 2, // 0=small, 1=medium, 2=large
    fontFamily: 'system',
    lineHeight: 1.6,
    highContrast: false,
    reduceMotion: false,
    focusIndicators: true
};

// Font size options
const fontSizes = ['Small', 'Medium', 'Large'];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadSavedSettings();
    setupEventListeners();
    updateLivePreview();
    updateFontSizeDisplay();
    updateLineHeightValue();
});

// Setup event listeners
function setupEventListeners() {
    // Theme selection
    const themeOptions = document.querySelectorAll('input[name="theme"]');
    themeOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.checked) {
                currentSettings.theme = this.value;
                updateLivePreview();
            }
        });
    });

    // Display mode selection
    const modeOptions = document.querySelectorAll('input[name="display-mode"]');
    modeOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.checked) {
                currentSettings.displayMode = this.value;
                updateLivePreview();
                applyDisplayMode(this.value);
            }
        });
    });

    // Layout settings
    document.getElementById('sidebarStyle').addEventListener('change', function() {
        currentSettings.sidebarStyle = this.value;
        updateLivePreview();
    });

    document.getElementById('contentWidth').addEventListener('change', function() {
        currentSettings.contentWidth = this.value;
        updateLivePreview();
    });

    document.getElementById('enableAnimations').addEventListener('change', function() {
        currentSettings.enableAnimations = this.checked;
        applyAnimationSettings(this.checked);
    });

    // Typography settings
    document.getElementById('fontFamily').addEventListener('change', function() {
        currentSettings.fontFamily = this.value;
        applyFontFamily(this.value);
        updateLivePreview();
    });

    document.getElementById('lineHeight').addEventListener('input', function() {
        currentSettings.lineHeight = parseFloat(this.value);
        updateLineHeightValue();
        applyLineHeight(this.value);
        updateLivePreview();
    });

    // Accessibility settings
    document.getElementById('highContrast').addEventListener('change', function() {
        currentSettings.highContrast = this.checked;
        applyHighContrast(this.checked);
        updateLivePreview();
    });

    document.getElementById('reduceMotion').addEventListener('change', function() {
        currentSettings.reduceMotion = this.checked;
        applyReducedMotion(this.checked);
    });

    document.getElementById('focusIndicators').addEventListener('change', function() {
        currentSettings.focusIndicators = this.checked;
        applyFocusIndicators(this.checked);
    });
}

// Font size controls
function changeFontSize(direction) {
    currentSettings.fontSize = Math.max(0, Math.min(2, currentSettings.fontSize + direction));
    updateFontSizeDisplay();
    applyFontSize();
    updateLivePreview();
}

function updateFontSizeDisplay() {
    document.getElementById('fontSizeDisplay').textContent = fontSizes[currentSettings.fontSize];
}

function updateLineHeightValue() {
    document.getElementById('lineHeightValue').textContent = currentSettings.lineHeight;
}

// Apply settings functions
function applyDisplayMode(mode) {
    const body = document.body;
    body.classList.remove('light-mode', 'dark-mode');
    
    if (mode === 'dark') {
        body.classList.add('dark-mode');
    } else if (mode === 'light') {
        body.classList.add('light-mode');
    } else if (mode === 'auto') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('dark-mode');
        } else {
            body.classList.add('light-mode');
        }
    }
}

function applyFontSize() {
    const sizes = ['14px', '16px', '18px'];
    document.documentElement.style.fontSize = sizes[currentSettings.fontSize];
}

function applyFontFamily(family) {
    const fonts = {
        'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'arial': 'Arial, sans-serif',
        'helvetica': 'Helvetica, Arial, sans-serif',
        'georgia': 'Georgia, serif',
        'times': '"Times New Roman", Times, serif'
    };
    
    document.documentElement.style.fontFamily = fonts[family] || fonts['system'];
}

function applyLineHeight(height) {
    document.documentElement.style.lineHeight = height;
}

function applyAnimationSettings(enabled) {
    if (enabled) {
        document.documentElement.style.setProperty('--transition-duration', '0.3s');
    } else {
        document.documentElement.style.setProperty('--transition-duration', '0s');
    }
}

function applyHighContrast(enabled) {
    document.body.classList.toggle('high-contrast', enabled);
}

function applyReducedMotion(enabled) {
    document.body.classList.toggle('reduce-motion', enabled);
}

function applyFocusIndicators(enabled) {
    document.body.classList.toggle('enhanced-focus', enabled);
}

// Update live preview
function updateLivePreview() {
    const preview = document.getElementById('livePreview');
    if (!preview) return;

    // Apply theme colors
    const themes = {
        default: { primary: '#7dc242', secondary: '#66a337' },
        blue: { primary: '#2196f3', secondary: '#1976d2' },
        purple: { primary: '#9c27b0', secondary: '#7b1fa2' },
        orange: { primary: '#ff9800', secondary: '#f57c00' }
    };

    const currentTheme = themes[currentSettings.theme];
    preview.style.setProperty('--primary-color', currentTheme.primary);
    preview.style.setProperty('--secondary-color', currentTheme.secondary);

    // Update preview elements
    const previewSidebar = preview.querySelector('.preview-sidebar-full');
    const previewButtons = preview.querySelectorAll('.preview-button');
    
    if (previewSidebar) {
        previewSidebar.style.backgroundColor = currentTheme.primary;
    }

    previewButtons.forEach(button => {
        button.style.backgroundColor = currentTheme.primary;
    });

    // Apply display mode to preview
    preview.classList.remove('light-preview', 'dark-preview');
    if (currentSettings.displayMode === 'dark') {
        preview.classList.add('dark-preview');
    } else {
        preview.classList.add('light-preview');
    }
}

// Save settings
function saveAppearanceSettings() {
    localStorage.setItem('appearanceSettings', JSON.stringify(currentSettings));
    
    // Apply all settings immediately
    applyAllSettings();
    
    showMessage('Appearance settings saved successfully!', 'success');
}

// Load saved settings
function loadSavedSettings() {
    const saved = localStorage.getItem('appearanceSettings');
    if (saved) {
        currentSettings = { ...currentSettings, ...JSON.parse(saved) };
        
        // Update form elements
        document.getElementById(`theme-${currentSettings.theme}`).checked = true;
        document.getElementById(`mode-${currentSettings.displayMode}`).checked = true;
        document.getElementById('sidebarStyle').value = currentSettings.sidebarStyle;
        document.getElementById('contentWidth').value = currentSettings.contentWidth;
        document.getElementById('enableAnimations').checked = currentSettings.enableAnimations;
        document.getElementById('fontFamily').value = currentSettings.fontFamily;
        document.getElementById('lineHeight').value = currentSettings.lineHeight;
        document.getElementById('highContrast').checked = currentSettings.highContrast;
        document.getElementById('reduceMotion').checked = currentSettings.reduceMotion;
        document.getElementById('focusIndicators').checked = currentSettings.focusIndicators;
        
        applyAllSettings();
    }
}

// Apply all settings
function applyAllSettings() {
    applyDisplayMode(currentSettings.displayMode);
    applyFontSize();
    applyFontFamily(currentSettings.fontFamily);
    applyLineHeight(currentSettings.lineHeight);
    applyAnimationSettings(currentSettings.enableAnimations);
    applyHighContrast(currentSettings.highContrast);
    applyReducedMotion(currentSettings.reduceMotion);
    applyFocusIndicators(currentSettings.focusIndicators);
    updateLivePreview();
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all appearance settings to default?')) {
        currentSettings = {
            theme: 'default',
            displayMode: 'light',
            sidebarStyle: 'fixed',
            contentWidth: 'normal',
            enableAnimations: true,
            fontSize: 1,
            fontFamily: 'system',
            lineHeight: 1.6,
            highContrast: false,
            reduceMotion: false,
            focusIndicators: true
        };
        
        localStorage.removeItem('appearanceSettings');
        location.reload(); // Reload to reset everything
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
