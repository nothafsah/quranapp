// ==========================================
// NATIVE APP ENHANCEMENTS
// Adds haptic feedback, animations, and native feel
// Works alongside the original app.js
// ==========================================

// Wait for original app to initialize first
setTimeout(() => {
    console.log('🎨 Native enhancements loaded');
    
    // Add haptic feedback to all buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('.nav-item') || e.target.closest('.option-card')) {
            // Haptic vibration
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    }, true);
    
    // Update status bar time (if status bar exists)
    function updateTime() {
        const timeEl = document.getElementById('status-time');
        if (timeEl) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeEl.textContent = `${hours}:${minutes}`;
        }
    }
    
    updateTime();
    setInterval(updateTime, 60000);
    
    // Initialize mobile messaging enhancements
    initMobileMessaging();
    
}, 100);

// Mobile Messaging Enhancements
function initMobileMessaging() {
    const conversationItems = document.querySelectorAll('.conversation-item');
    const chatView = document.getElementById('chat-view');
    const conversationsList = document.querySelector('.conversations-list');
    const backBtn = document.querySelector('.back-btn-mobile');
    
    if (!chatView) return;
    
    function isMobile() {
        return window.innerWidth < 768;
    }
    
    conversationItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isMobile() && chatView && conversationsList) {
                chatView.classList.add('active');
                conversationsList.classList.add('hidden');
                if (backBtn) backBtn.style.display = 'flex';
            }
        });
    });
    
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (chatView && conversationsList) {
                chatView.classList.remove('active');
                conversationsList.classList.remove('hidden');
                backBtn.style.display = 'none';
            }
        });
    }
    
    window.addEventListener('resize', () => {
        if (!isMobile() && chatView && conversationsList) {
            chatView.classList.remove('active');
            conversationsList.classList.remove('hidden');
            if (backBtn) backBtn.style.display = 'none';
        }
    });
}

// Theme Toggle Enhancement
function toggleTheme() {
    document.body.classList.toggle('light');
    const newTheme = document.body.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
    
    console.log('🎨 Theme changed to:', newTheme);
}

// Make toggle available globally
window.toggleTheme = toggleTheme;

// Toast Notification System
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: var(--bg-dark);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

window.showToast = showToast;

// Prevent pull-to-refresh on mobile
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDelta = touchY - touchStartY;
    
    if (touchDelta > 0 && window.scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

// Disable zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

console.log('✅ Native app enhancements ready!');
