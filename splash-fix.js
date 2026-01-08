// SPLASH SCREEN FIX - Load this FIRST before other scripts
console.log('🔧 Splash fix loaded');

// Override showScreen
window.showScreen = function(screenId) {
    console.log('🔄 showScreen called with:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('✅ Showing screen:', screenId);
    } else {
        console.error('❌ Screen not found:', screenId);
    }
    
    // Hide/show nav
    const nav = document.getElementById('bottom-nav');
    if (nav) {
        const hideNavScreens = ['splash-screen', 'welcome-screen', 'login-screen', 'signup-screen', 'onboarding-screen'];
        nav.style.display = hideNavScreens.includes(screenId) ? 'none' : 'flex';
    }
};

// Auto-transition from splash after 3 seconds
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Splash fix: DOM loaded');
    
    setTimeout(() => {
        console.log('⏰ Splash timeout - transitioning now!');
        const onboarded = localStorage.getItem('onboarded') === '1';
        
        if (onboarded) {
            console.log('✅ User onboarded -> home-dashboard');
            window.showScreen('home-dashboard');
        } else {
            console.log('✅ User NOT onboarded -> onboarding-screen');
            // FIXED: Show onboarding screen instead of welcome
            window.showScreen('onboarding-screen');
        }
    }, 3000);
});

console.log('✅ Splash fix initialized');

// TESTING: Clear onboarded flag to see onboarding screens
// Uncomment this line to reset and see onboarding:
// localStorage.removeItem('onboarded');

// Or add this to browser console: localStorage.removeItem('onboarded'); location.reload();
