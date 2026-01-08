// Global state (e.g., current user, hasanat)
let appState = {
    currentUser: { name: 'Ahmed', hasanatToday: 1250, totalHasanat: 42500, streak: 15 },
    currentScreen: 'splash-screen',
    onboardingData: {},
    totalDhikr: 0,
    focusSession: { active: false, startTime: null, duration: 0, hasanat: 0 },
    focusSurah: null,
    focusVerse: 1,
    // track whether user completed onboarding (persisted)
    onboarded: (localStorage.getItem('onboarded') === '1')
};

// API functions will be available from window after api.js loads

// Function to show a screen
function showScreen(screenId) {
    console.log('=== SHOWSCREEN CALLED ===');
    console.log('Requested screen:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        console.log('Removed active from:', s.id);
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    console.log('Target screen element:', targetScreen);
    
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Added active to:', screenId);
        appState.currentScreen = screenId;
        
        // Update UI for the new screen
        updateUI();
        
        // Update nav active state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const isActive = btn.dataset.screen === screenId;
            btn.classList.toggle('active', isActive);
            console.log('Nav button', btn.dataset.screen, 'active:', isActive);
        });
        
        // Hide nav on certain screens and until onboarding is complete
        const nav = document.getElementById('bottom-nav');
        const hideNavScreens = ['splash-screen', 'onboarding-screen', 'login-screen', 'signup-screen', 'reader-view', 'focus-session', 'create-group', 'create-competition'];
        // Hide nav while user hasn't completed onboarding
        nav.style.display = (hideNavScreens.includes(screenId) || !appState.onboarded) ? 'none' : 'flex';
        console.log('Nav display set to:', nav.style.display, 'for screen:', screenId, 'onboarded:', appState.onboarded);
        
        // Load data for specific screens
        if (screenId === 'daily-deen-feed') {
            loadFeed();
        } else if (screenId === 'prayer-calendar') {
            loadPrayerTimes();
        } else if (screenId === 'quran-index') {
            loadSurahList();
        } else if (screenId === 'analytics-screen') {
            loadAnalytics();
        } else if (screenId === 'achievements-screen') {
            loadAchievements();
        }
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Onboarding logic - MOVED TO DOMContentLoaded
// document.addEventListener('click', (e) => {
//     if (e.target.matches('[data-proficiency]')) {
//         appState.onboardingData.proficiency = e.target.dataset.proficiency;
//         document.getElementById('quiz-step-1').classList.add('hidden');
//         document.getElementById('quiz-step-2').classList.remove('hidden');
//     }
//     if (e.target.matches('[data-time]')) {
//         appState.onboardingData.time = e.target.dataset.time;
//         document.getElementById('quiz-step-2').classList.add('hidden');
//         document.getElementById('quiz-step-3').classList.remove('hidden');
//     }
// });

function completeOnboarding() {
    console.log('Completing onboarding...');
    const goalPages = document.getElementById('goal-pages').value;
    appState.onboardingData.goalPages = goalPages;
    console.log('Going to home dashboard...');
    // mark onboarding complete and persist
    appState.onboarded = true;
    try { localStorage.setItem('onboarded', '1'); } catch (e) { /* ignore */ }
    showScreen('home-dashboard');
}

// Navigation - MOVED TO DOMContentLoaded
// document.addEventListener('click', (e) => {
//     if (e.target.matches('.nav-btn')) {
//         console.log('Nav button clicked:', e.target.dataset.screen);
//         showScreen(e.target.dataset.screen);
//     }
// });

// Reading functions
function startNormalReading() {
    showScreen('reader-view');
    openReader(1, 0); // Load Al-Fatihah verse 1
}

async function loadQuranText(surah, page) {
    const text = await window.getSurahText(surah);
    document.getElementById('quran-text').textContent = text || 'Loading...';
    document.getElementById('current-surah').textContent = mockData.quran.surahs.find(s => s.number == surah)?.name || 'Surah';
    const recitedHasanatEl = document.getElementById('recited-hasanat');
    if (recitedHasanatEl) recitedHasanatEl.innerText = '0 hasanat';
}

// Focus mode
function startFocusSession() {
    const duration = parseInt(document.getElementById('focus-duration').value);
    const surah = document.getElementById('focus-surah').value;
    
    appState.focusSession = {
        active: true,
        startTime: Date.now(),
        duration: duration * 60 * 1000, // Convert to ms
        hasanat: 0
    };
    appState.focusSurah = surah;
    appState.focusVerse = 1;
    
    showScreen('focus-session');
    startFocusTimer();
    loadFocusVerse();
}

function startFocusTimer() {
    const timerEl = document.getElementById('session-timer');
    const hasanatEl = document.getElementById('session-hasanat');
    const interval = setInterval(() => {
        const elapsed = Date.now() - appState.focusSession.startTime;
        const remaining = Math.max(0, appState.focusSession.duration - elapsed);
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Simulate hasanat earning (10 per second for demo)
        appState.focusSession.hasanat = Math.floor(elapsed / 1000) * 10;
        hasanatEl.textContent = appState.focusSession.hasanat;
        
        if (remaining <= 0) {
            clearInterval(interval);
            endFocusSession();
        }
    }, 1000);
}

async function loadFocusVerse() {
    const text = await window.getVerseText(appState.focusSurah, appState.focusVerse);
    document.getElementById('focus-text').textContent = text || 'Loading...';
}

function endFocusSession() {
    appState.focusSession.active = false;
    appState.currentUser.hasanatToday += appState.focusSession.hasanat;
    appState.currentUser.totalHasanat += appState.focusSession.hasanat;
    updateUI();
    showScreen('home-dashboard');
}

// Dhikr functions
function incrementDhikr() {
    appState.totalDhikr++;
    updateDhikrUI();
}

function decrementDhikr() {
    if (appState.totalDhikr > 0) {
        appState.totalDhikr--;
    }
    updateDhikrUI();
}

function updateDhikrUI() {
    const totalEl = document.getElementById('dhikr-total-count');
    if (totalEl) {
        totalEl.textContent = appState.totalDhikr;
    }
}

// Update UI elements
function updateUI() {
    // compute today's hasanat from recited verses if available
    let todays = appState.currentUser.hasanatToday || 0;
    if (appState.currentUser && Array.isArray(appState.currentUser.recited)) {
        todays = appState.currentUser.recited.reduce((sum, r) => sum + (r.hasanat || 0), 0);
    }
    const total = appState.currentUser.totalHasanat || 0;
    const todayEl = document.getElementById('hasanat-today');
    if (todayEl) todayEl.textContent = todays.toLocaleString();
    const todaySmall = document.getElementById('hasanat-today-small');
    if (todaySmall) todaySmall.textContent = todays.toLocaleString();
    const totalSmall = document.getElementById('hasanat-total-small');
    if (totalSmall) totalSmall.textContent = (total).toLocaleString();
    document.getElementById('session-hasanat').textContent = appState.focusSession.hasanat;
    
    // Initialize messages when messages screen is shown
    if (appState.currentScreen === 'messages-screen') {
        initMessages();
    }
}

async function loadFeed() {
    const feed = await window.getFeed();
    const feedContainer = document.querySelector('.feed-container');
    feedContainer.innerHTML = '';
    feed.forEach(item => {
        const feedItem = document.createElement('div');
        feedItem.className = 'feed-item';
        feedItem.innerHTML = `
            <div class="user-info">${item.user}</div>
            <p>${item.message}</p>
            <div class="reactions">
                <button class="reaction-btn">🤲 ${item.reactions.subhanallah}</button>
                <button class="reaction-btn">🙏 ${item.reactions.ameen}</button>
            </div>
        `;
        feedContainer.appendChild(feedItem);
    });
}

async function loadPrayerTimes() {
    const times = await window.getPrayerTimes();
    const timesContainer = document.querySelector('.prayer-times');
    timesContainer.innerHTML = '';
    times.forEach(time => {
        const timeItem = document.createElement('div');
        timeItem.className = 'prayer-item';
        timeItem.innerHTML = `<span>${time.name}</span><span>${time.time}</span>`;
        timesContainer.appendChild(timeItem);
    });
}

async function loadSurahList() {
    const surahs = await window.getSurahs();
    const surahList = document.querySelector('.surah-list');
    surahList.innerHTML = '';
    surahs.forEach(surah => {
        const surahItem = document.createElement('div');
        surahItem.className = 'surah-item';
        surahItem.dataset.surah = surah.number;
        surahItem.innerHTML = `<span>${surah.name}</span><span>${surah.verses} verses</span>`;
        surahItem.onclick = () => {
            openReader(surah.number, 0);
            showScreen('reader-view');
        };
        surahList.appendChild(surahItem);
    });
}

// Reader: per-verse paging and recitation tracking
async function openReader(surahNumber, verseIndex) {
    const fullText = await window.getSurahText(surahNumber);
    // split verses by '*' delimiter used in mocks
    const verses = (fullText || '').split('*').map(v => v.trim()).filter(v => v.length > 0);
    appState.reader = { surahNumber: Number(surahNumber), verses: verses, index: verseIndex || 0 };
    const surahName = mockData.quran.surahs.find(s => s.number == surahNumber)?.name || 'Surah';
    document.getElementById('current-surah').textContent = surahName;
    document.getElementById('reader-surah-id').value = surahNumber;
    renderCurrentVerse();
}

function renderCurrentVerse() {
    if (!appState.reader) return;
    const idx = appState.reader.index;
    const verseText = appState.reader.verses[idx] || '';
    document.getElementById('quran-text').textContent = verseText;
    const current = idx + 1;
    const total = appState.reader.verses.length;
    const verseNumEl = document.getElementById('current-verse-num');
    if (verseNumEl) verseNumEl.textContent = `Verse ${current} / ${total}`;
    const recitedHasanatEl = document.getElementById('recited-hasanat');
    // show whether this verse was already recited
    const recitedKey = `${appState.reader.surahNumber}:${idx}`;
    const recitedList = (appState.currentUser.recited || []);
    const found = recitedList.find(r => r.key === recitedKey);
    if (recitedHasanatEl) recitedHasanatEl.innerText = found ? `${found.hasanat} hasanat` : '';
}

function nextVerse() {
    if (!appState.reader) return;
    if (appState.reader.index < appState.reader.verses.length - 1) {
        appState.reader.index++;
        renderCurrentVerse();
    } else {
        alert('You reached the end of this surah.');
    }
}

function prevVerse() {
    if (!appState.reader) return;
    if (appState.reader.index > 0) {
        appState.reader.index--;
        renderCurrentVerse();
    }
}

async function loadAnalytics() {
    // Mock analytics data - in real app, fetch from API
    // For now, just initialize charts if Chart.js is available
    console.log('Loading analytics...');
}

async function loadAchievements() {
    // Mock achievements data - in real app, fetch from API
    console.log('Loading achievements...');
}

// Messages functionality
function initMessages() {
    const sendButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        chatMessages.appendChild(messageElement);
        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    // load persisted user if available
    try {
        const stored = localStorage.getItem('currentUser');
        if (stored) appState.currentUser = JSON.parse(stored);
    } catch (e) {}
    showScreen('splash-screen');
    updateUI();
    
    // Auto-transition from splash screen after 3 seconds
    setTimeout(() => {
        console.log('Splash timeout - transitioning...');
        if (appState.onboarded) {
            console.log('User onboarded, going to home-dashboard');
            showScreen('home-dashboard');
        } else {
            console.log('User not onboarded, going to welcome-screen');
            showScreen('welcome-screen');
        }
    }, 3000);
    // ensure home hasanat summary displays updated totals immediately
    updateUI();
    
    // Navigation event listener - attach to nav element
    const nav = document.getElementById('bottom-nav');
    console.log('Nav element found:', nav);
    if (nav) {
        console.log('Attaching nav click listener...');
        
        // Test: log any click on the nav element
        nav.addEventListener('click', (e) => {
            console.log('=== NAV CLICK DETECTED ===');
            console.log('Event target:', e.target);
            console.log('Target classes:', e.target.className);
            console.log('Target dataset:', e.target.dataset);
            console.log('Event type:', e.type);
            console.log('Event phase:', e.eventPhase);
            
            if (e.target.classList.contains('nav-btn')) {
                console.log('✓ Nav button clicked:', e.target.dataset.screen);
                e.preventDefault();
                e.stopPropagation();
                showScreen(e.target.dataset.screen);
            } else {
                console.log('✗ Click was not on a nav button - checking parent...');
                // Check if parent is nav-btn
                const parentBtn = e.target.closest('.nav-btn');
                if (parentBtn) {
                    console.log('✓ Found nav button in parent:', parentBtn.dataset.screen);
                    e.preventDefault();
                    e.stopPropagation();
                    showScreen(parentBtn.dataset.screen);
                }
            }
        });
        console.log('Nav listener attached successfully');
    } else {
        console.error('Nav element not found!');
    }
    
    // Onboarding quiz event listeners
    document.addEventListener('click', (e) => {
        console.log('Document click detected on:', e.target.tagName, e.target.className, e.target.dataset.screen);
        
        // Handle data-screen buttons (navigation)
        if (e.target.matches('[data-screen]')) {
            e.preventDefault();
            const screenId = e.target.dataset.screen;
            console.log('Data-screen button clicked:', screenId);
            // If user is skipping onboarding by navigating to home, mark onboarding complete
            if (screenId === 'home-dashboard' && appState.currentScreen === 'onboarding-screen') {
                appState.onboarded = true;
                try { localStorage.setItem('onboarded', '1'); } catch (e) {}
                console.log('User skipped onboarding - marked onboarded');
            }
            showScreen(screenId);
            return;
        }
        
        // Handle data-action buttons
        if (e.target.matches('[data-action]')) {
            const action = e.target.dataset.action;
            console.log('Data-action button clicked:', action);
            if (action === 'start-onboarding-quiz') {
                // Show the first quiz step
                document.querySelector('.onboarding-hero-large')?.classList.add('hidden');
                document.getElementById('quiz-step-1')?.classList.remove('hidden');
                return;
            }
            if (action === 'complete-onboarding') {
                completeOnboarding();
            } else if (action === 'start-normal-reading') {
                startNormalReading();
            } else if (action === 'start-focus-session') {
                startFocusSession();
            } else if (action === 'end-focus-session') {
                endFocusSession();
            } else if (action === 'onboarding-next') {
                // Advance onboarding from time entry to goal step
                const minutesEl = document.getElementById('daily-minutes');
                const minutes = parseInt(minutesEl?.value || 0, 10);
                if (!minutes || minutes <= 0) {
                    alert('Please enter the number of minutes you can dedicate daily.');
                } else {
                    appState.onboardingData.time = minutes;
                    // move to step 3
                    document.getElementById('quiz-step-2').classList.add('hidden');
                    document.getElementById('quiz-step-3').classList.remove('hidden');
                    // prefill goal-pages with a simple heuristic (1 page per 5 minutes)
                    const estimatedPages = Math.max(1, Math.round(minutes / 5));
                    const goalEl = document.getElementById('goal-pages');
                    if (goalEl) goalEl.value = estimatedPages;
                }
            } else if (action === 'mark-recited') {
                console.log('mark-recited clicked');
                (async () => {
                    if (!appState.reader) return;
                    const idx = appState.reader.index;
                    const verseText = appState.reader.verses[idx] || '';
                    const letters = countArabicLetters(verseText || '');
                    const hasanatEarned = letters * 10;
                    appState.currentUser = appState.currentUser || { hasanatToday: 0, totalHasanat: 0, recited: [] };
                    appState.currentUser.hasanatToday = (appState.currentUser.hasanatToday || 0) + hasanatEarned;
                    appState.currentUser.totalHasanat = (appState.currentUser.totalHasanat || 0) + hasanatEarned;
                    const recitedKey = `${appState.reader.surahNumber}:${idx}`;
                    appState.currentUser.recited = appState.currentUser.recited || [];
                    appState.currentUser.recited.push({ key: recitedKey, hasanat: hasanatEarned });
                    try { localStorage.setItem('currentUser', JSON.stringify(appState.currentUser)); } catch (err) {}
                    const recitedHasanatEl = document.getElementById('recited-hasanat');
                    if (recitedHasanatEl) recitedHasanatEl.innerText = `${hasanatEarned} hasanat`;
                    updateUI();
                    // advance to next verse automatically
                    setTimeout(() => { nextVerse(); }, 400);
                })();
            }
            return;
        }
        
        // Onboarding quiz
        if (e.target.matches('[data-proficiency]')) {
            appState.onboardingData.proficiency = e.target.dataset.proficiency;
            document.getElementById('quiz-step-1').classList.add('hidden');
            document.getElementById('quiz-step-2').classList.remove('hidden');
        }
        if (e.target.matches('[data-time]')) {
            appState.onboardingData.time = e.target.dataset.time;
            document.getElementById('quiz-step-2').classList.add('hidden');
            document.getElementById('quiz-step-3').classList.remove('hidden');
        }
    });

    // Attach specific UI controls
    const nextBtn = document.getElementById('next-page');
    const prevBtn = document.getElementById('prev-page');
    if (nextBtn) nextBtn.addEventListener('click', () => nextVerse());
    if (prevBtn) prevBtn.addEventListener('click', () => prevVerse());

    // Load reciters into select (option value is reciter id)
    const reciterSelect = document.getElementById('reciter-select');
    if (reciterSelect && window.getReciters) {
        window.getReciters().then(list => {
            list.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.name;
                reciterSelect.appendChild(opt);
            });
        }).catch(() => {});
    }

    // Play reciter audio for current verse (per-verse playback)
    const playBtn = document.getElementById('play-reciter');
    if (playBtn) {
        playBtn.addEventListener('click', async () => {
            if (!appState.reader) { alert('Open a verse first.'); return; }
            const reciterId = document.getElementById('reciter-select')?.value;
            if (!reciterId) { alert('Select a reciter first'); return; }
            const surah = appState.reader.surahNumber;
            const verseIndex = appState.reader.index;
            const verseNumber = verseIndex + 1;
            const url = await window.getSurahAudio(reciterId, surah, verseNumber);
            if (!url) { alert('Audio not available for this verse.'); return; }

            if (appState.audio && !appState.audio.paused) {
                appState.audio.pause();
                playBtn.textContent = 'Play';
                return;
            }

            appState.audio = new Audio(url);
            try {
                await appState.audio.play();
                playBtn.textContent = 'Pause';
            } catch (err) {
                console.error('Playback error', err);
                alert('Unable to play audio in this environment.');
            }
            appState.audio.onended = () => { playBtn.textContent = 'Play'; };
        });
    }

    // Theme control: moved to Settings screen select
    const settingsTheme = document.getElementById('settings-theme-select');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') document.body.classList.add('light');
    if (settingsTheme) {
        settingsTheme.value = currentTheme;
        settingsTheme.addEventListener('change', (ev) => {
            const theme = ev.target.value;
            if (theme === 'light') document.body.classList.add('light'); else document.body.classList.remove('light');
            localStorage.setItem('theme', theme);
        });
    }

    // Theme toggle on splash screen
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light');
            const theme = document.body.classList.contains('light') ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
            themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
        });
        // Set initial icon
        themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
    }

    // Auth buttons
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showScreen('onboarding-screen'));
    }
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => showScreen('onboarding-screen'));
    }

    // Focus verse navigation
    const prevVerseFocus = document.getElementById('prev-verse-focus');
    if (prevVerseFocus) {
        prevVerseFocus.addEventListener('click', () => {
            if (appState.focusVerse > 1) {
                appState.focusVerse--;
                loadFocusVerse();
            }
        });
    }
    const nextVerseFocus = document.getElementById('next-verse-focus');
    if (nextVerseFocus) {
        nextVerseFocus.addEventListener('click', () => {
            appState.focusVerse++;
            loadFocusVerse();
        });
    }
});

// Utility: count Arabic letters in a string (basic heuristic)
function countArabicLetters(text) {
    if (!text) return 0;
    const matches = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g);
    return matches ? matches.length : 0;
}