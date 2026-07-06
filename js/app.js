/**
 * FinWise AI - Shared UI Utilities & Configuration Handlers
 * Holds toast alerts, navigation scrolls, mobile menus, and dev configs.
 */

// Initialize shared global state
window.state = window.state || {};
window.state.settings = {
    claudeKey: '',
    sheetsUrl: '',
    forceDelay: true
};

// Auto-run settings loading on load
loadSettings();

function loadSettings() {
    const key = sessionStorage.getItem('finwise_claude_key');
    const url = sessionStorage.getItem('finwise_sheets_url');
    const delay = sessionStorage.getItem('finwise_force_delay');
    
    if (key) window.state.settings.claudeKey = key;
    if (url) window.state.settings.sheetsUrl = url;
    if (delay !== null) window.state.settings.forceDelay = (delay === 'true');
}

function saveSettingsConfig(e) {
    e.preventDefault();
    const keyInput = document.getElementById('settings-claude-key');
    const urlInput = document.getElementById('settings-sheets-url');
    const delayInput = document.getElementById('settings-force-delay');
    
    const key = keyInput ? keyInput.value.trim() : '';
    const url = urlInput ? urlInput.value.trim() : '';
    const delay = delayInput ? delayInput.checked : true;
    
    window.state.settings.claudeKey = key;
    window.state.settings.sheetsUrl = url;
    window.state.settings.forceDelay = delay;
    
    sessionStorage.setItem('finwise_claude_key', key);
    sessionStorage.setItem('finwise_sheets_url', url);
    sessionStorage.setItem('finwise_force_delay', delay);
    
    closeSettingsModal();
    showToast('Developer Configuration Loaded Successfully', 'success');
}

// Global modal triggers
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        // Hydrate values
        const keyInput = document.getElementById('settings-claude-key');
        const urlInput = document.getElementById('settings-sheets-url');
        const delayInput = document.getElementById('settings-force-delay');
        
        if (keyInput) keyInput.value = window.state.settings.claudeKey;
        if (urlInput) urlInput.value = window.state.settings.sheetsUrl;
        if (delayInput) delayInput.checked = window.state.settings.forceDelay;
        
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function openReportsModal() {
    const modal = document.getElementById('reports-modal');
    if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeReportsModal() {
    const modal = document.getElementById('reports-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function togglePasswordVisibility(id) {
    const el = document.getElementById(id);
    const eye = document.getElementById(id + '-eye');
    if (el) {
        if (el.type === 'password') {
            el.type = 'text';
            if (eye) eye.className = 'fa-solid fa-eye-slash';
        } else {
            el.type = 'password';
            if (eye) eye.className = 'fa-solid fa-eye';
        }
    }
}

// Toast alerts helper
function showToast(message, type = 'info') {
    const wrapper = document.getElementById('toast-wrapper');
    if (!wrapper) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;
    wrapper.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Bind DOM handlers
document.addEventListener('DOMContentLoaded', () => {
    // Sticky Scroll navigation
    const navbar = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 30) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
    });
    
    // Highlight active link based on window location pathname
    const navItems = document.querySelectorAll('.nav-item, .drawer-link-item');
    const path = window.location.pathname;
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && path.includes(href.replace('.html', ''))) {
            item.classList.add('active-nav');
        } else {
            item.classList.remove('active-nav');
        }
    });
    
    // Mobile Navigation Drawer Toggle controls
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const closeBtn = document.getElementById('mobile-drawer-close');
    const drawer = document.getElementById('mobile-drawer-menu');
    
    if (toggleBtn && drawer) {
        toggleBtn.addEventListener('click', () => {
            drawer.classList.add('open');
            drawer.setAttribute('aria-hidden', 'false');
            toggleBtn.setAttribute('aria-expanded', 'true');
        });
    }
    
    const closeDrawer = () => {
        if (drawer) {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
        }
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    
    // Bind developer configuration settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettingsConfig);
    }
    
    // Developer Settings menu clicks
    const openBtn = document.getElementById('open-settings-btn');
    if (openBtn) openBtn.addEventListener('click', openSettingsModal);
    
    const openBtnMobile = document.getElementById('open-settings-btn-mobile');
    if (openBtnMobile) openBtnMobile.addEventListener('click', openSettingsModal);
});

// Expose functions globally
window.showToast = showToast;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.openReportsModal = openReportsModal;
window.closeReportsModal = closeReportsModal;
window.togglePasswordVisibility = togglePasswordVisibility;
