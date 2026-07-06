/**
 * FinWise AI - Authentication Interceptor & Security Session Managers
 * Blocks unauthorized users from reading pages/ files.
 */

// Global state container initialized if not already existing
window.state = window.state || {};
window.state.auth = {
    isAuthenticated: false
};

// Check authentication boundaries instantly on script load
checkAuthStatus();

function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem('finwise_authenticated') === 'true';
    window.state.auth.isAuthenticated = isLoggedIn;
    
    // Evaluate if user is currently looking at subpages inside pages/ directory
    const isSubpage = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    
    if (isLoggedIn) {
        if (!isSubpage && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'))) {
            // Logged in: auto-navigate to main dashboard overview
            window.location.href = 'pages/dashboard.html';
        }
    } else {
        if (isSubpage) {
            // Unauthorized: boot back to landing screen
            window.location.href = '../index.html';
        }
    }
}

function handleLogin(email, password, submitBtn, formEl, forceDelaySetting) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    
    const delay = forceDelaySetting ? window.CONFIG.DELAYS.AUTH_GATE : 0;
    
    const triggerLogin = () => {
        if (email === 'admin@finwise.ai' && password === 'admin123') {
            sessionStorage.setItem('finwise_authenticated', 'true');
            window.state.auth.isAuthenticated = true;
            
            formEl.reset();
            
            // Navigate to main hub
            window.location.href = 'pages/dashboard.html';
        } else {
            if (window.showToast) {
                window.showToast('Authentication Failed: Invalid credentials', 'error');
            } else {
                alert('Authentication Failed: Invalid credentials');
            }
            const pwdInput = document.getElementById('login-password');
            if (pwdInput) {
                pwdInput.value = '';
                pwdInput.focus();
            }
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> <span>Authenticate Security Keys</span>';
    };
    
    if (delay > 0) {
        setTimeout(triggerLogin, delay);
    } else {
        triggerLogin();
    }
}

function handleLogout() {
    sessionStorage.removeItem('finwise_authenticated');
    window.state.auth.isAuthenticated = false;
    
    // Redirect to landing
    const isSubpage = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
    window.location.href = isSubpage ? '../index.html' : 'index.html';
}

// Bind listeners once DOM handles loading
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const submitBtn = document.getElementById('btn-login-submit');
            
            // Access delay configuration from constants.js
            const forceDelay = window.state.settings ? window.state.settings.forceDelay : true;
            handleLogin(email, password, submitBtn, loginForm, forceDelay);
        });
    }
    
    // Wire Sign Out selectors
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);
});
