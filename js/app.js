/**
 * MAIN APPLICATION FILE
 * Initializes the Level Tennis application
 */

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('⚾ Level Tennis App Initialized');
  console.log('📊 Event tracking enabled');
  console.log('💾 Using localStorage for session management');

  // Initialize core modules
  updateNavAuth();
  updateCartCountUI();

  // Page-specific initialization happens in respective module files

  // Log app startup
  EventTracker.trackPageView(getCurrentPageName());
});

// Get current page name
function getCurrentPageName() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1) || 'home';
  return filename.replace('.html', '');
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[Error] Uncaught error:', event.error);
});

// Track when user closes/leaves page
window.addEventListener('beforeunload', () => {
  // Could track session end here if needed
  // EventTracker.logCustomEvent('page.unload', {});
});

// Setup CSS for nav auth menu
const style = document.createElement('style');
style.textContent = `
  .nav-auth-menu {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9rem;
  }
`;
document.head.appendChild(style);
