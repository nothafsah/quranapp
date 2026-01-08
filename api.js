const API_BASE = 'http://localhost:8000/api/v1'; // Update for production

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Mock data for development
const mockData = {
    quran: {
        surahs: [
            { number: 1, name: 'Al-Fatihah', verses: 7 },
            { number: 2, name: 'Al-Baqarah', verses: 286 },
            { number: 3, name: 'Aal-E-Imran', verses: 200 },
            { number: 4, name: 'An-Nisa', verses: 176 },
            { number: 36, name: 'Yasin', verses: 83 },
            { number: 67, name: 'Al-Mulk', verses: 30 }
        ],
        text: {
            1: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ * الرَّحْمَٰنِ الرَّحِيمِ * مَالِكِ يَوْمِ الدِّينِ * إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ * اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ * صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
            36: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * يس * وَالْقُرْآنِ الْحَكِيمِ * إِنَّكَ لَمِنَ الْمُرْسَلِينَ * عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ * تَنزِيلَ الْعَزِيزِ الرَّحِيمِ",
            67: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ * تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ * الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ"
        }
    },
    feed: [
        { user: 'Fatima', message: 'Completed Surah Al-Baqarah! SubhanAllah', reactions: { subhanallah: 5, ameen: 3 } },
        { user: 'Ahmed', message: '7-day streak achieved! Alhamdulillah', reactions: { subhanallah: 8, ameen: 4 } }
    ],
    prayerTimes: [
        { name: 'Fajr', time: '5:30 AM' },
        { name: 'Dhuhr', time: '12:15 PM' },
        { name: 'Asr', time: '3:45 PM' },
        { name: 'Maghrib', time: '6:30 PM' },
        { name: 'Isha', time: '8:00 PM' }
    ]
};

// Mock list of reciters (audio URLs are placeholders). In production these would be real audio endpoints.
const reciters = [
    { id: 'sudais', name: 'Abdul Rahman Al-Sudais', base: 'https://cdn.example.com/reciters/sudais' },
    { id: 'shuraim', name: 'Maher Al-Shuraim', base: 'https://cdn.example.com/reciters/shuraim' },
    { id: 'minshawi', name: 'Muhammad Siddiq Al-Minshawi', base: 'https://cdn.example.com/reciters/minshawi' }
];

// Helper to construct per-verse audio URL (mock). Real app should provide precise audio mapping.
async function getSurahAudio(reciterId, surahNumber, verseNumber) {
    const r = reciters.find(x => x.id === reciterId);
    if (!r) return null;
    // Mock filename pattern: surah{n}_v{verse}.mp3
    return `${r.base}/surah${surahNumber}_v${verseNumber}.mp3`;
}

async function getSurahs() {
    // return await fetchData('/quran/surahs') || mockData.quran.surahs;
    return mockData.quran.surahs;
}

async function getSurahText(surahNumber) {
    // return await fetchData(`/quran/surahs/${surahNumber}`) || mockData.quran.text[surahNumber];
    return mockData.quran.text[surahNumber];
}

async function getVerseText(surahNumber, verseNumber) {
    const surahText = await getSurahText(surahNumber);
    if (surahText) {
        const verses = surahText.split(' * ');
        return verses[verseNumber - 1] || 'Verse not found';
    }
    return null;
}

async function getFeed() {
    // return await fetchData('/feed') || mockData.feed;
    return mockData.feed;
}

async function getPrayerTimes() {
    try {
        const response = await fetch('http://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=2');
        const data = await response.json();
        const timings = data.data.timings;
        return [
            { name: 'Fajr', time: timings.Fajr },
            { name: 'Dhuhr', time: timings.Dhuhr },
            { name: 'Asr', time: timings.Asr },
            { name: 'Maghrib', time: timings.Maghrib },
            { name: 'Isha', time: timings.Isha }
        ];
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        return mockData.prayerTimes; // fallback
    }
}

// Make functions global
window.getSurahs = getSurahs;
window.getSurahText = getSurahText;
window.getVerseText = getVerseText;
window.getFeed = getFeed;
window.getPrayerTimes = getPrayerTimes;
window.getReciters = async function() { return reciters; };
window.getSurahAudio = getSurahAudio;

// Note for developers: currently data is mocked in `mockData`. In a full app the API would provide
// a complete Quran JSON (surah list + verses + audio links). Using `window.getSurahs()` and
// `window.getSurahText(n)` allows swapping to a real backend without changing UI code.