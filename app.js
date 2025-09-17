const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const weatherInfoDiv = document.getElementById('weather-info');
const errorMessageDiv = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading-indicator');
const weeklyForecastDiv = document.getElementById('weekly-forecast');
const forecastContainer = document.getElementById('forecast-container');

const locationName = document.getElementById('location-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const windSpeed = document.getElementById('wind-speed');
const windDirection = document.getElementById('wind-direction');
const currentTime = document.getElementById('current-time');
const dayNight = document.getElementById('day-night');

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

function degreesToCardinal(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function setDynamicBackground(weatherConditionKey) {
    const bg = backgroundMap[weatherConditionKey] || backgroundMap['default'];

    document.body.style.backgroundImage = `url('${bg.image}')`;
    document.body.style.backgroundColor = bg.color;

    // Theme variables per weather
    const themeByWeather = {
        clear: {
            brand: '#60a5fa',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.22) 100%)'
        },
        clouds: {
            brand: '#93c5fd',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.32) 100%)'
        },
        rain: {
            brand: '#5b8aa8',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)'
        },
        drizzle: {
            brand: '#7aa5c0',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
        },
        thunderstorm: {
            brand: '#818cf8',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)'
        },
        snow: {
            brand: '#a5f3fc',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)'
        },
        mist: {
            brand: '#cbd5e1',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 100%)'
        },
        default: {
            brand: '#60a5fa',
            overlay: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)'
        }
    };

    const theme = themeByWeather[weatherConditionKey] || themeByWeather.default;
    document.documentElement.style.setProperty('--brand', theme.brand);
    document.documentElement.style.setProperty('--overlay', theme.overlay);

    // Weather effect layers
    const cloudsLayer = document.getElementById('clouds-layer');
    const lightningLayer = document.getElementById('lightning-layer');
    const rainLayer = document.getElementById('rain-layer');
    const snowLayer = document.getElementById('snow-layer');
    const mistLayer = document.getElementById('mist-layer');
    if (cloudsLayer && lightningLayer) {
        cloudsLayer.style.display = 'none';
        lightningLayer.style.display = 'none';
        if (rainLayer) rainLayer.style.display = 'none';
        if (snowLayer) snowLayer.style.display = 'none';
        if (mistLayer) mistLayer.style.display = 'none';
        // Sunny: blue sky + clouds
        if (weatherConditionKey === 'clear') {
            cloudsLayer.style.display = 'block';
        }
        // Cloudy: clouds only
        else if (weatherConditionKey === 'clouds') {
            cloudsLayer.style.display = 'block';
        }
        // Thunderstorm: clouds + lightning
        else if (weatherConditionKey === 'thunderstorm') {
            cloudsLayer.style.display = 'block';
            lightningLayer.style.display = 'block';
            if (rainLayer) rainLayer.style.display = 'block';
        }
        // Rain: clouds only
        else if (weatherConditionKey === 'rain' || weatherConditionKey === 'drizzle') {
            cloudsLayer.style.display = 'block';
            if (rainLayer) rainLayer.style.display = 'block';
        }
        // Snow: clouds only
        else if (weatherConditionKey === 'snow') {
            cloudsLayer.style.display = 'block';
            if (snowLayer) snowLayer.style.display = 'block';
        }
        // Mist: clouds only
        else if (weatherConditionKey === 'mist') {
            cloudsLayer.style.display = 'block';
            if (mistLayer) mistLayer.style.display = 'block';
        }
        // Default: no effect
    }
}

function displayError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    weatherInfoDiv.style.display = 'none';
    weeklyForecastDiv.style.display = 'none';
    loadingIndicator.style.display = 'none';
    setDynamicBackground('default');
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

function updateUI(data, locationDisplayName, timezone) {
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

    setDynamicBackground(weatherCodeInfo.background);

    updateWeeklyForecast(dailyWeather);
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

function fetchWeatherByGeolocation() {
    if (navigator.geolocation) {
        loadingIndicator.textContent = 'Getting your location...';
        loadingIndicator.style.display = 'block';
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                const reverseGeocodingUrl = `${GEOCODING_BASE_URL}?latitude=${lat}&longitude=${lon}&count=1`;
                const geoResponse = await fetch(reverseGeocodingUrl);
                if (!geoResponse.ok) {
                    throw new Error(`Reverse geocoding failed: HTTP status ${geoResponse.status}`);
                }
                const geoData = await geoResponse.json();

                let locationDisplayName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
                let timezone = 'UTC';

                if (geoData.results && geoData.results.length > 0) {
                    const { name, country, timezone: detectedTimezone } = geoData.results[0];
                    locationDisplayName = `${name}, ${country}`;
                    timezone = detectedTimezone;
                }

                const weatherUrl = `${WEATHER_FORECAST_BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=ms&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`;
                const weatherResponse = await fetch(weatherUrl);
                if (!weatherResponse.ok) {
                    throw new Error(`Weather data fetch failed: HTTP status ${weatherResponse.status}`);
                }
                const weatherData = await weatherResponse.json();

                updateUI(weatherData, locationDisplayName, timezone);

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

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

window.onload = fetchWeatherByGeolocation;
