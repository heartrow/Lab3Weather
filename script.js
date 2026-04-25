const searchInput = document.getElementById('searchBar');

searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

async function getLocation(){
    const input = document.getElementById('searchBar').value;
    const errorDisplay = document.getElementById('status');

    errorDisplay.textContent = "";

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input)}&count=10&language=en&format=json`;

    console.log(url)

    try {
        const response = await fetch(url);

        if (!response.ok) {
            errorDisplay.textContent = "Server error. Please try again later.";
            return;
        }

        const data = await response.json();

        if(data.results && data.results.length > 0) {
            const {latitude, longitude, name, country, timezone} = data.results[0];
            
            //console.log(latitude, longitude);

            return {
                lat: latitude,
                lon: longitude,
                cityName: name,
                countryName: country,
                timezone: timezone
            };

        } else {
            errorDisplay.textContent = `No city found matching "${input}".`;
            return;
        }

    } catch (error) {
        errorDisplay.textContent = "Network error. Check your connection.";
        netErrorPopup();
    }
}

async function netErrorPopup() {
    const container = document.getElementById('bannerContainer');

    if(document.querySelector('.errBanner')) return;

    const errBanner = document.createElement('div');
    errBanner.className = 'errBanner';

    errBanner.innerHTML = `
        <strong>Oops! A network error had occured.</strong>
        <p>Please try again.</p>
        <button class="tryBtn" id="tryAgain">Try Again</button>
        `;
    
    container.appendChild(errBanner);
    
    document.getElementById('tryAgain').addEventListener('click', handleSearch);
}
 
// This function important to handle result so js dont quickly call 
// weather function even when the api couldnt respond yet.
async function handleSearch(){
    const statusDisplay = document.getElementById('status');
    const uiElements = {
        city: document.getElementById('city'),
        temp: document.getElementById('temp'),
        desc: document.getElementById('weatherDesc'),
        humidity: document.getElementById('humidity'),
        wind: document.getElementById('wind')
    }

    Object.values(uiElements).forEach(e => {
        e.classList.add('skeleton');
        e.textContent = "";
    })

    const coords = await getLocation();
    
    if(coords) {
        await getWeather(coords);
        getLocalTime(coords.timezone);

    } else {
        Object.values(uiElements).forEach(el => el.classList.remove('skeleton'));
    }
}

const weatherLookup = {
    0:  { desc: "Clear sky", icon: "☀️" },
    1:  { desc: "Mainly clear", icon: "🌤️" },
    2:  { desc: "Partly cloudy", icon: "⛅" },
    3:  { desc: "Overcast", icon: "☁️" },
    45: { desc: "Fog", icon: "🌫️" },
    48: { desc: "Depositing rime fog", icon: "🌫️" },
    51: { desc: "Light drizzle", icon: "🌦️" },
    61: { desc: "Slight rain", icon: "🌧️" },
    63: { desc: "Moderate rain", icon: "🌧️" },
    71: { desc: "Slight snow fall", icon: "❄️" },
    95: { desc: "Thunderstorm", icon: "⛈️" },
    53: { desc: "Moderate drizzle", icon: "🌦️" },
    55: { desc: "Dense drizzle", icon: "🌦️" },
    63: { desc: "Moderate rain", icon: "🌧️" },
    65: { desc: "Heavy rain", icon: "🌧️" },
    80: { desc: "Slight rain showers", icon: "🌦️" }
    // Add more codes as needed from Open-Meteo documentation
};

async function getWeather(coords) {
    const { lat, lon, cityName, countryName} = coords;
    const errorDisplay = document.getElementById('status');
    const uiElements = {
        city: document.getElementById('city'),
        temp: document.getElementById('temp'),
        desc: document.getElementById('weatherDesc'),
        humidity: document.getElementById('humidity'),
        wind: document.getElementById('wind'),
        
        // Forecast data
        /*
        fc_day: document.getElementsByClassName("day"),
        fc_icon: document.getElementsByClassName("icon"),
        temp_high: document.getElementsByClassName("high"),
        temp_low: document.getElementsByClassName("low")*/
    };

    const forecastElements = document.querySelectorAll('.day, .icon, .high, .low');
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,windspeed_10m&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode`;

    console.log(url);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            errorDisplay.textContent = "Server error. Please try again later.";
            return;
        }

        const data = await response.json();

        if(data) {
            const code = data.daily.weathercode[0];
            
            const weatherInfo = weatherLookup[code] || { desc: "Unknown", icon: "❓"};

            const sevenDayForecast = data.daily.time.map((date, index) => {
                return {
                    date: date,
                    max: data.daily.temperature_2m_max[index],
                    min: data.daily.temperature_2m_min[index],
                    code: data.daily.weathercode[index]
                };
            });

            // display the data
            uiElements.city.textContent = cityName + ", " + countryName;
            uiElements.temp.textContent  = data.current.temperature_2m + " °C";
            uiElements.desc.textContent  = `${weatherInfo.icon} ${weatherInfo.desc}`;
            uiElements.humidity.textContent  = data.hourly.relativehumidity_2m[0] + "%";
            uiElements.wind.textContent  = data.current.windspeed_10m + "km/h";

            sevenDayForecast.forEach((day, index) => {
                const dateObj = new Date(day.date);
                const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'short' });

                const dayWeather = weatherLookup[day.code] || { desc: "Unknown", icon: "❓"};
                
                const days = document.querySelectorAll('.day');
                const icons = document.querySelectorAll('.icon');
                const highs = document.querySelectorAll('.high');
                const lows = document.querySelectorAll('.low');
                
                if (days[index]) {
                    days[index].textContent = dayName;
                    icons[index].textContent = dayWeather.icon;
                    highs[index].textContent = `${Math.round(day.max)}°`;
                    lows[index].textContent = `${Math.round(day.min)}°`;
                }
            });

            Object.values(uiElements).forEach(el => {
                if (el) el.classList.remove('skeleton')
            });

        } else {
            Object.values(uiElements).forEach(el => {
                if (el) el.classList.remove('skeleton')
            });

            errorDisplay.textContent = `Forecast data for city of "${cityName}" cannot be found.`;
            return;
        }

    } catch (error) {
        Object.values(uiElements).forEach(el => {
            if (el) el.classList.remove('skeleton')
        });
        errorDisplay.textContent = "Network error. Check your connection.";
    }
}

async function getLocalTime(timezone) {
    if(!timezone) {
        console.warn("Timezone missing. Using browser time.");
        renderTime(new Date());
        return;
    }

    const url = `https://time.now/developer/api/timezone/${timezone}`;
    console.log(url);

    $.getJSON(url)
        .done(function(data) {
            const timeString = data.datetime;
            console.log(timeString);
            const dateObject = new Date(timeString);
            const localTime = dateObject.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            console.log(localTime)
            $('#localTime').text(localTime);
        })
        .fail(function() {
            console.error("WorldTimeAPI failed. Falling back to browser time.");
            renderTime(new Date());
        })
        .always(function() {
            const completionTimestamp = new Date().toLocaleTimeString();
            console.log(`Time request completed at: ${completionTimestamp}`);
        });
}