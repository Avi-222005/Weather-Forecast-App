const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const locationButton = document.getElementById('location-button');
const weatherInfoDiv = document.getElementById('weather-info');
const errorMessageDiv = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading-indicator');
const weeklyForecastDiv = document.getElementById('weekly-forecast');
const forecastContainer = document.getElementById('forecast-container');
// History elements
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const historyRefreshBtn = document.getElementById('history-refresh');
const historyClearBtn = document.getElementById('history-clear');
let currentHistoryActiveId = null;
// News elements
const newsSection = document.getElementById('news-section');
const newsList = document.getElementById('news-list');
const newsError = document.getElementById('news-error');
const newsLoading = document.getElementById('news-loading');
const newsRefreshBtn = document.getElementById('news-refresh');
// Saved Locations elements (left column)
const savedList = document.getElementById('saved-list');
const savedEmpty = document.getElementById('saved-empty');
const savedAddBtn = document.getElementById('saved-add');
const savedClearBtn = document.getElementById('saved-clear');

const locationName = document.getElementById('location-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const windSpeed = document.getElementById('wind-speed');
const windDirection = document.getElementById('wind-direction');
const currentTime = document.getElementById('current-time');
const dayNight = document.getElementById('day-night');
const aqiValueEl = document.getElementById('aqi-value');
const aqiCardEl = document.getElementById('aqi-card');
const aqiCategoryEl = document.getElementById('aqi-category');

const weatherCodeMap = {
    0: { description: 'Clear sky', background: 'clear' },
    1: { description: 'Mainly clear', background: 'clear' },
    2: { description: 'Partly cloudy', background: 'clouds' },
    3: { description: 'Overcast', background: 'clouds' },
    45: { description: 'Fog', background: 'mist' },
    48: { description: 'Depositing rime fog', background: 'mist' },
    51: { description: 'Drizzle: Light', background: 'drizzle' },
    53: { description: 'Drizzle: Moderate', background: 'drizzle' },
    55: { description: 'Drizzle: Dense intensity', background: 'drizzle' },
    56: { description: 'Freezing Drizzle: Light', background: 'drizzle' },
    57: { description: 'Freezing Drizzle: Dense intensity', background: 'drizzle' },
    61: { description: 'Rain: Slight', background: 'rain' },
    63: { description: 'Rain: Moderate', background: 'rain' },
    65: { description: 'Rain: Heavy intensity', background: 'rain' },
    66: { description: 'Freezing Rain: Light', background: 'rain' },
    67: { description: 'Freezing Rain: Heavy intensity', background: 'rain' },
    71: { description: 'Snow fall: Slight', background: 'snow' },
    73: { description: 'Snow fall: Moderate', background: 'snow' },
    75: { description: 'Snow fall: Heavy intensity', background: 'snow' },
    77: { description: 'Snow grains', background: 'snow' },
    80: { description: 'Rain showers: Slight', background: 'rain' },
    81: { description: 'Rain showers: Moderate', background: 'rain' },
    82: { description: 'Rain showers: Violent', background: 'rain' },
    85: { description: 'Snow showers: Slight', background: 'snow' },
    86: { description: 'Snow showers: Heavy', background: 'snow' },
    95: { description: 'Thunderstorm: Slight or moderate', background: 'thunderstorm' },
    96: { description: 'Thunderstorm with slight hail', background: 'thunderstorm' },
    99: { description: 'Thunderstorm with heavy hail', background: 'thunderstorm' },
    'default': { description: 'Unknown weather', background: 'default' }
};
const weatherIconMap = {
    'clear': '☀️', 'clouds': '☁️', 'rain': '🌧️', 'drizzle': '🌦️', 'thunderstorm': '⚡',
    'snow': '❄️', 'mist': '🌫️', 'smoke': '💨', 'haze': '🌫️', 'dust': '🌪️', 'fog': '🌫️',
    'sand': '🏜️', 'ash': '🌋', 'squall': '💨', 'tornado': '🌪️', 'default': '❓'
};

const backgroundMap = {
    'clear': {
        image: 'weather images/clear.png',
        color: '#87CEEB'
    },
    'clouds': {
        image: 'https://placehold.co/1920x1080/B0C4DE/ffffff?text=Cloudy+Sky',
        color: '#B0C4DE'
    },
    'rain': {
        image: 'weather images/rainy.png',
        color: '#6A8DAF'
    },
    'drizzle': {
        image: 'weather images/drizzle.png',
        color: '#6A8DAF'
    },
    'thunderstorm': {
        image: 'https://placehold.co/1920x1080/4F4F4F/ffffff?text=Thunderstorm',
        color: '#4F4F4F'
    },
    'snow': {
        image: 'https://placehold.co/1920x1080/ADD8E6/ffffff?text=Snowy+Day',
        color: '#ADD8E6'
    },
    'mist': {
        image: 'https://placehold.co/1920x1080/A9A9A9/ffffff?text=Mist/Fog',
        color: '#A9A9A9'
    },
    'smoke': {
        image: 'https://placehold.co/1920x1080/778899/ffffff?text=Smoke',
        color: '#778899'
    },
    'haze': {
        image: 'https://placehold.co/1920x1080/B0C4DE/ffffff?text=Haze',
        color: '#B0C4DE'
    },
    'dust': {
        image: 'https://placehold.co/1920x1080/D2B48C/ffffff?text=Dust',
        color: '#D2B48C'
    },
    'fog': {
        image: 'https://placehold.co/1920x1080/A9A9A9/ffffff?text=Fog',
        color: '#A9A9A9'
    },
    'sand': {
        image: 'https://placehold.co/1920x1080/F4A460/ffffff?text=Sand',
        color: '#F4A460'
    },
    'ash': {
        image: 'https://placehold.co/1920x1080/708090/ffffff?text=Ash',
        color: '#708090'
    },
    'squall': {
        image: 'https://placehold.co/1920x1080/6A8DAF/ffffff?text=Squall',
        color: '#6A8DAF'
    },
    'tornado': {
        image: 'https://placehold.co/1920x1080/36454F/ffffff?text=Tornado',
        color: '#36454F'
    },
    'default': {
        image: 'https://placehold.co/1920x1080/778899/ffffff?text=Weather+App',
        color: '#778899'
    }
};

// --- Weather News (GNews API) ---
const GNEWS_API_KEY = '5adff21542b17098d3a8dff6b928e455';
const GNEWS_ENDPOINT = 'https://gnews.io/api/v4/search';

function formatRelativeTime(isoDate) {
    const then = new Date(isoDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff < 60) return `${diff}s ago`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

function buildNewsUrl({ query = 'weather OR storm OR rainfall OR monsoon OR cyclone', lang = 'en', max = 6 } = {}) {
    const url = new URL(GNEWS_ENDPOINT);
    url.searchParams.set('q', query);
    url.searchParams.set('lang', lang);
    url.searchParams.set('sortby', 'publishedAt');
    url.searchParams.set('max', String(max));
    // GNews v4 expects the API key in the `token` query parameter (NOT `apikey`).
    url.searchParams.set('token', GNEWS_API_KEY);
    return url.toString();
}

async function fetchWeatherNews(opts = {}) {
    if (!newsSection) return;
    // Show setup message if no API key
    if (!GNEWS_API_KEY) {
        newsLoading.style.display = 'none';
        newsError.style.display = 'block';
        newsError.innerHTML = 'Add your free GNews API key in <code>app.js</code> (GNEWS_API_KEY) to enable live weather news. Get one at <a href="https://gnews.io" target="_blank" rel="noopener">gnews.io</a>.';
        return;
    }

    try {
        newsError.style.display = 'none';
        newsLoading.style.display = 'block';
        newsList.innerHTML = '';

        let baseQuery = 'weather OR storm OR rainfall OR monsoon OR cyclone';
        if (opts && (opts.city || opts.country)) {
            const parts = [];
            if (opts.city) parts.push(opts.city);
            if (opts.country) parts.push(opts.country);
            baseQuery = `weather (${parts.join(' OR ')})`;
        }

        const url = buildNewsUrl({ query: baseQuery });
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            // Provide a clearer message for common auth failures and show placeholders
            if (res.status === 401 || res.status === 403) {
                // Placeholder cards
                const placeholders = Array.from({ length: 3 }).map(() => `
                    <li class="news-item">
                        <div style="height:14px;background:rgba(255,255,255,.18);border-radius:6px;width:80%;margin-bottom:8px;"></div>
                        <div class="news-meta" style="height:12px;background:rgba(255,255,255,.12);border-radius:6px;width:50%;"></div>
                    </li>
                `).join('');
                newsList.innerHTML = placeholders;
                newsLoading.style.display = 'none';
                return;
            }
            throw new Error(`News fetch failed: HTTP ${res.status}`);
        }
        const data = await res.json();
        const articles = data.articles || [];
        if (articles.length === 0) {
            newsList.innerHTML = '<li class="news-item">No recent weather headlines found. Try again later.</li>';
        } else {
            const items = articles.map(a => {
                const title = a.title || 'Untitled';
                const url = a.url || '#';
                const source = (a.source && a.source.name) ? a.source.name : 'Source';
                const published = a.publishedAt ? formatRelativeTime(a.publishedAt) : '';
                const description = a.description ? ` — ${a.description}` : '';
                return `
                    <li class="news-item">
                        <a href="${url}" target="_blank" rel="noopener">${title}</a>
                        <div class="news-meta">${source} • ${published}${description}</div>
                    </li>
                `;
            }).join('');
            newsList.innerHTML = items;
        }
    } catch (e) {
        newsError.style.display = 'block';
        newsError.textContent = e.message.includes('Failed to fetch')
            ? 'Could not load news (network/CORS). Please try again later.'
            : `Could not load news: ${e.message}`;
    } finally {
        newsLoading.style.display = 'none';
    }
}

function degreesToCardinal(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Keep a static gradient background: neutralize dynamic background and effects
function setDynamicBackground() {
    // Ensure any weather layers remain hidden to keep the gradient clean
    const ids = ['clouds-layer','lightning-layer','rain-layer','snow-layer','mist-layer'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    // Reset any overrides on body to allow CSS gradient to show
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';
}

function displayError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    weatherInfoDiv.style.display = 'none';
    weeklyForecastDiv.style.display = 'none';
    loadingIndicator.style.display = 'none';
    setDynamicBackground();
}

function hideError() {
    errorMessageDiv.style.display = 'none';
}

async function fetchWeather(city, retries = 3, delay = 1000) {
    hideError();
    weatherInfoDiv.style.display = 'none';
    weeklyForecastDiv.style.display = 'none';
    loadingIndicator.textContent = 'Finding city coordinates...';
    loadingIndicator.style.display = 'block';

    try {
        const geocodingUrl = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(city)}&count=1`;
        const geoResponse = await fetch(geocodingUrl);
        if (!geoResponse.ok) {
            throw new Error(`Geocoding failed: HTTP status ${geoResponse.status}`);
        }
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found. Please check the spelling.');
        }

        const { latitude, longitude, name, country, timezone } = geoData.results[0];
        const locationDisplayName = `${name}, ${country}`;

        loadingIndicator.textContent = `Fetching weather for ${locationDisplayName}...`;

        const weatherUrl = `${WEATHER_FORECAST_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius&windspeed_unit=ms&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`;
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error(`Weather data fetch failed: HTTP status ${weatherResponse.status}`);
        }
    const weatherData = await weatherResponse.json();
        
    updateUI(weatherData, locationDisplayName, timezone);
    // Fetch contextual news AFTER weather is rendered so weather appears first
    try { await fetchWeatherNews({ city: name, country }); } catch {}

    } catch (error) {
        if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            await fetchWeather(city, retries - 1, delay * 2);
        } else {
            displayError(`Failed to fetch weather data: ${error.message}`);
            loadingIndicator.style.display = 'none';
        }
    }
}

function updateUI(data, locationDisplayName, timezone, opts = {}) {
    loadingIndicator.style.display = 'none';
    hideError();
    
    const currentWeather = data.current_weather;
    const dailyWeather = data.daily;
    if (!currentWeather || !dailyWeather) {
        displayError('No weather data available for this location.');
        return;
    }

    const weatherCodeInfo = weatherCodeMap[currentWeather.weathercode] || weatherCodeMap['default'];

    locationName.textContent = locationDisplayName;
    temperature.textContent = `${Math.round(currentWeather.temperature)}°C`;
    weatherDescription.textContent = weatherCodeInfo.description;
    
    windSpeed.textContent = `${currentWeather.windspeed} m/s`;
    windDirection.textContent = degreesToCardinal(currentWeather.winddirection);
    
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZone: timezone
    });

    dayNight.textContent = currentWeather.is_day === 1 ? 'Day' : 'Night';

    weatherInfoDiv.style.display = 'flex';
    weeklyForecastDiv.style.display = 'block';

    setDynamicBackground();

    updateWeeklyForecast(dailyWeather);

    // Reset and fetch AQI for the current location
    if (aqiValueEl) aqiValueEl.textContent = 'Loading…';
    try {
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            fetchAndRenderAQI({ lat: data.latitude, lon: data.longitude, timezone });
        }
    } catch (_) {
        if (aqiValueEl) aqiValueEl.textContent = 'N/A';
    }

    // Persist the search for logged-in users unless explicitly skipped (e.g. restoring from history)
    if (!opts.skipPersist) {
        persistSearchIfAuthed(locationDisplayName, data).catch(() => {});
    }
}

// ---- Air Quality (AQI) ----
function aqiCategoryUS(value) {
    if (value == null || isNaN(value)) return { label: 'N/A', className: '' };
    if (value <= 50) return { label: 'Good', className: 'aqi-good' };
    if (value <= 100) return { label: 'Moderate', className: 'aqi-moderate' };
    if (value <= 150) return { label: 'USG', className: 'aqi-usg' };
    if (value <= 200) return { label: 'Unhealthy', className: 'aqi-unhealthy' };
    if (value <= 300) return { label: 'Very Unhealthy', className: 'aqi-very-unhealthy' };
    return { label: 'Hazardous', className: 'aqi-hazardous' };
}

async function fetchAndRenderAQI({ lat, lon, timezone }) {
    if (!aqiValueEl) return;
    try {
        const url = `${AIR_QUALITY_BASE_URL}?latitude=${lat}&longitude=${lon}&hourly=us_aqi&timezone=${encodeURIComponent(timezone)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`AQI fetch failed: ${res.status}`);
        const data = await res.json();
        const times = (data && data.hourly && data.hourly.time) || [];
        const values = (data && data.hourly && data.hourly.us_aqi) || [];
        if (!times.length || !values.length) throw new Error('No AQI data');
        // Find closest hour to now in the provided timezone
        const now = new Date();
        let bestIdx = 0;
        let bestDiff = Infinity;
        for (let i = 0; i < times.length; i++) {
            const t = new Date(times[i]).getTime();
            const d = Math.abs(now.getTime() - t);
            if (d < bestDiff) { bestDiff = d; bestIdx = i; }
        }
        const value = Math.round(values[bestIdx]);
        const cat = aqiCategoryUS(value);
        aqiValueEl.textContent = String(value);
        if (aqiCategoryEl) aqiCategoryEl.textContent = `(${cat.label})`;
        if (aqiCardEl) {
            aqiCardEl.classList.remove('aqi-good','aqi-moderate','aqi-usg','aqi-unhealthy','aqi-very-unhealthy','aqi-hazardous');
            if (cat.className) aqiCardEl.classList.add(cat.className);
        }
    } catch (e) {
        aqiValueEl.textContent = 'N/A';
        if (aqiCategoryEl) aqiCategoryEl.textContent = '';
        if (aqiCardEl) aqiCardEl.classList.remove('aqi-good','aqi-moderate','aqi-usg','aqi-unhealthy','aqi-very-unhealthy','aqi-hazardous');
        console.warn('AQI load failed:', e.message);
    }
}

function updateWeeklyForecast(dailyData) {
    forecastContainer.innerHTML = '';
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    dailyData.time.forEach((dayTime, index) => {
        const date = new Date(dayTime);
        const dayName = daysOfWeek[date.getDay()];
        const maxTemp = Math.round(dailyData.temperature_2m_max[index]);
        const minTemp = Math.round(dailyData.temperature_2m_min[index]);
        const weatherCode = dailyData.weathercode[index];
        const weatherInfo = weatherCodeMap[weatherCode] || weatherCodeMap['default'];
        const weatherIcon = weatherIconMap[weatherInfo.background] || weatherIconMap['default'];

        const cardHtml = `
            <div class="forecast-card">
                <div class="day">${dayName}</div>
                <div class="icon">${weatherIcon}</div>
                <div class="temp-range">${maxTemp}°C / ${minTemp}°C</div>
            </div>
        `;
        forecastContainer.innerHTML += cardHtml;
    });
}

// ---------------- Search History Persistence ----------------
async function persistSearchIfAuthed(locationDisplayName, weatherData) {
    if (!window.supabaseClient) return; // Supabase not ready
    const { data: { session } = {} } = await window.supabaseClient.auth.getSession();
    if (!session || !session.user) return; // not logged in

    try {
        const userId = session.user.id;
        const cityName = locationDisplayName.split(',')[0].trim();
        const payload = {
            user_id: userId,
            city_name: cityName,
            weather_data: weatherData,
            searched_at: new Date().toISOString()
        };
        // Insert new record
        const { error: insertError } = await window.supabaseClient
            .from('search_history')
            .insert(payload);
        if (insertError) throw insertError;

        // Enforce last 15 limit
        const { data: rows, error: fetchErr } = await window.supabaseClient
            .from('search_history')
            .select('id, searched_at')
            .eq('user_id', userId)
            .order('searched_at', { ascending: false });
        if (!fetchErr && rows && rows.length > 15) {
            const toDelete = rows.slice(15).map(r => r.id);
            if (toDelete.length) {
                await window.supabaseClient.from('search_history').delete().in('id', toDelete);
            }
        }
        // Refresh list quietly
        loadHistoryList();
    } catch (e) {
        console.warn('Persist search failed:', e.message);
    }
}

async function loadHistoryList({ autoShowLatest = false } = {}) {
    if (!window.supabaseClient || !historySection) return;
    const { data: { session } = {} } = await window.supabaseClient.auth.getSession();
    if (!session || !session.user) {
        historySection.style.display = 'none';
        return;
    }
    historySection.style.display = 'block';
    historyList.innerHTML = '';
    historyEmpty.style.display = 'none';
    try {
        const { data, error } = await window.supabaseClient
            .from('search_history')
            .select('id, city_name, weather_data, searched_at')
            .eq('user_id', session.user.id)
            .order('searched_at', { ascending: false })
            .limit(15);
        if (error) throw error;
        if (!data || data.length === 0) {
            historyEmpty.style.display = 'block';
            return;
        }
        const frag = document.createDocumentFragment();
        data.forEach((row, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.dataset.id = String(row.id);
            const date = new Date(row.searched_at);
            const timeStr = date.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
            li.innerHTML = `
                <div class="history-main">
                    <strong>${row.city_name}</strong>
                    <div class="history-meta">${timeStr}</div>
                </div>
                <button class="history-delete" title="Delete">🗑️</button>
            `;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => {
                restoreWeatherFromHistory(row);
            });
            // Delete button (stop click from restoring)
            const delBtn = li.querySelector('.history-delete');
            delBtn.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                await deleteHistoryById(row.id);
                // If we deleted the active row, clear active id and maybe activate top item after reload
                if (currentHistoryActiveId === row.id) currentHistoryActiveId = null;
                loadHistoryList({ autoShowLatest: true });
            });
            frag.appendChild(li);
        });
        historyList.appendChild(frag);
        updateHistoryActiveUI();
        if (autoShowLatest && data[0]) {
            restoreWeatherFromHistory(data[0]);
        }
    } catch (e) {
        historyEmpty.style.display = 'block';
        historyEmpty.textContent = 'Could not load history.';
        console.warn('Load history failed:', e.message);
    }
}

function restoreWeatherFromHistory(row) {
    if (!row || !row.weather_data) return;
    // Use stored weather_data directly without new API call
    const timezone = row.weather_data?.timezone || 'UTC';
    // Pass skipPersist so clicking a history item does NOT create a new history entry
    updateUI(row.weather_data, `${row.city_name}`, timezone, { skipPersist: true });
    currentHistoryActiveId = row.id;
    updateHistoryActiveUI();
}

function updateHistoryActiveUI() {
    if (!historyList) return;
    const children = historyList.querySelectorAll('li.history-item');
    children.forEach(li => {
        if (String(currentHistoryActiveId) === li.dataset.id) li.classList.add('active');
        else li.classList.remove('active');
    });
}

async function deleteHistoryById(id) {
    if (!window.supabaseClient) return;
    try {
        await window.supabaseClient.from('search_history').delete().eq('id', id);
    } catch (e) {
        console.warn('Delete history failed:', e.message);
    }
}

// Refresh button
if (historyRefreshBtn) {
    historyRefreshBtn.addEventListener('click', () => loadHistoryList());
}

// Clear all history
if (historyClearBtn) {
    historyClearBtn.addEventListener('click', async () => {
        if (!window.supabaseClient) return;
        const ok = confirm('Clear all search history?');
        if (!ok) return;
        try {
            const { data: { session } = {} } = await window.supabaseClient.auth.getSession();
            if (!session || !session.user) return;
            await window.supabaseClient.from('search_history').delete().eq('user_id', session.user.id);
            currentHistoryActiveId = null;
            historyList.innerHTML = '';
            historyEmpty.style.display = 'block';
        } catch (e) {
            console.warn('Clear history failed:', e.message);
        }
    });
}

// Hook into auth state (supabase auth listener already in auth.js). Poll session once after login.
document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to allow auth session restoration
    setTimeout(() => { 
        loadHistoryList({ autoShowLatest: true }); 
        loadSavedLocations();
    }, 400);
});

function fetchWeatherByGeolocation() {
    if (navigator.geolocation) {
        loadingIndicator.textContent = 'Getting your location...';
        loadingIndicator.style.display = 'block';
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                // Use a free reverse geocoding service
                let locationDisplayName = `Your Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
                
                // Try to get location name using a free reverse geocoding service
                try {
                    const reverseGeocodingUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
                    const geoResponse = await fetch(reverseGeocodingUrl);
                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        if (geoData.city && geoData.countryName) {
                            locationDisplayName = `${geoData.city}, ${geoData.countryName}`;
                        } else if (geoData.locality && geoData.countryName) {
                            locationDisplayName = `${geoData.locality}, ${geoData.countryName}`;
                        } else if (geoData.countryName) {
                            locationDisplayName = `${geoData.countryName}`;
                        }
                    }
                } catch (reverseGeoError) {
                    console.log('Reverse geocoding failed, using coordinates as location name');
                }

                loadingIndicator.textContent = `Fetching weather for ${locationDisplayName}...`;

                // Don't specify timezone parameter - let Open-Meteo use default behavior
                const weatherUrl = `${WEATHER_FORECAST_BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=ms&daily=weathercode,temperature_2m_max,temperature_2m_min`;
                const weatherResponse = await fetch(weatherUrl);
                if (!weatherResponse.ok) {
                    throw new Error(`Weather data fetch failed: HTTP status ${weatherResponse.status}`);
                }
                const weatherData = await weatherResponse.json();

                updateUI(weatherData, locationDisplayName, 'UTC');
                // After successful weather fetch, attempt context-aware news (after UI render)
                const parts = locationDisplayName.split(',');
                const geoCity = parts[0];
                const geoCountry = parts.slice(-1)[0];
                try { await fetchWeatherNews({ city: geoCity, country: geoCountry }); } catch {}

            } catch (error) {
                displayError(`Could not get weather for your location: ${error.message}`);
                loadingIndicator.style.display = 'none';
            }
        }, (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                displayError('Please enable location services in your browser settings to use auto-location.');
            } else {
                displayError(`Geolocation error: ${error.message}. Please enter a city manually.`);
            }
            loadingIndicator.style.display = 'none';
        });
    } else {
        displayError('Geolocation is not supported by your browser. Please enter a city manually.');
    }
}

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        displayError('Please enter a city name.');
    }
});

locationButton.addEventListener('click', () => {
    fetchWeatherByGeolocation();
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

// Remove automatic location detection on page load
window.onload = () => {
    // Show initial state without loading anything
    loadingIndicator.style.display = 'none';
    weatherInfoDiv.style.display = 'none';
    weeklyForecastDiv.style.display = 'none';
    errorMessageDiv.style.display = 'none';
    // Initial generic news fetch
    fetchWeatherNews();
};

// Manual news refresh
if (newsRefreshBtn) {
    newsRefreshBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherNews({ city });
        } else {
            fetchWeatherNews();
        }
    });
}

// ---------------- Saved Locations (Supabase) ----------------
async function loadSavedLocations() {
    if (!window.supabaseClient || !savedList) return;
    try {
        const { data: { session } = {} } = await window.supabaseClient.auth.getSession();
        if (!session || !session.user) {
            if (savedList) savedList.innerHTML = '';
            if (savedEmpty) savedEmpty.style.display = 'block';
            return;
        }
        const { data, error } = await window.supabaseClient
            .from('saved_locations')
            .select('id, saved_city, label')
            .eq('user_id', session.user.id)
            .order('id', { ascending: false });
        if (error) throw error;
        renderSavedLocations(data || []);
    } catch (e) {
        console.warn('Load saved locations failed:', e.message);
        renderSavedLocations([]);
    }
}

function renderSavedLocations(rows) {
    if (!savedList) return;
    savedList.innerHTML = '';
    const has = rows && rows.length > 0;
    if (savedEmpty) savedEmpty.style.display = has ? 'none' : 'block';
    if (!has) return;
    const frag = document.createDocumentFragment();
    rows.forEach(row => {
        const li = document.createElement('li');
        li.className = 'sidebar-item';
        li.innerHTML = `
            <div class="meta">
                <div class="city">${row.saved_city}</div>
                <div class="label">${row.label || ''}</div>
            </div>
            <button class="delete" title="Delete">🗑️</button>
        `;
        li.addEventListener('click', (e) => {
            // avoid when clicking delete
            if (e.target.closest('button.delete')) return;
            const city = row.saved_city;
            if (city) fetchWeather(city);
        });
        li.querySelector('button.delete').addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteSavedLocation(row.id);
            loadSavedLocations();
        });
        frag.appendChild(li);
    });
    savedList.appendChild(frag);
}

async function addSavedLocation(saved_city, label) {
    if (!window.supabaseClient) return false;
    const { data: { session } = {} } = await window.supabaseClient.auth.getSession();
    if (!session || !session.user) return false;
    try {
        const payload = { user_id: session.user.id, saved_city, label };
        const { error } = await window.supabaseClient.from('saved_locations').insert(payload);
        if (error) throw error;
        return true;
    } catch (e) {
        console.warn('Add saved location failed:', e.message);
        return false;
    }
}

async function deleteSavedLocation(id) {
    if (!window.supabaseClient) return;
    try { await window.supabaseClient.from('saved_locations').delete().eq('id', id); } catch (e) { console.warn('Delete saved failed:', e.message); }
}

async function clearAllSavedLocations() {
    if (!window.supabaseClient) return;
    try {
        const { data: { session } = {} } = await window.supabaseClient.auth.getSession();
        if (!session || !session.user) return;
        await window.supabaseClient.from('saved_locations').delete().eq('user_id', session.user.id);
    } catch (e) { console.warn('Clear saved failed:', e.message); }
}

if (savedAddBtn) {
    savedAddBtn.addEventListener('click', async () => {
        const city = prompt('Enter city to save (e.g., Noida)');
        if (!city) return;
        const label = prompt('Enter a label (e.g., Home, Office)') || '';
        const ok = await addSavedLocation(city.trim(), label.trim());
        if (ok) loadSavedLocations();
    });
}

if (savedClearBtn) {
    savedClearBtn.addEventListener('click', async () => {
        const ok = confirm('Clear all saved locations?');
        if (!ok) return;
        await clearAllSavedLocations();
        loadSavedLocations();
    });
}
