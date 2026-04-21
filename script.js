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
            const {latitude, longitude, name, country} = data.results[0];
            
            //console.log(latitude, longitude);

            return {
                lat: latitude,
                lon: longitude,
                cityName: name,
                countryName: country
            };

        } else {
            errorDisplay.textContent = `No city found matching "${input}".`;
            return;
        }

    } catch (error) {
        errorDisplay.textContent = "Network error. Check your connection.";
    }
}
 
// This function important to handle result so js dont quickly call 
// weather function even when the api couldnt respond yet.
async function handleSearch(){
    const coords = await getLocation();
    
    if(coords) {
        getWeather(coords);
    }
}

async function getWeather(coords) {
    const { lat, lon, cityName, countryName} = coords;
    const errorDisplay = document.getElementById('status');
    
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
            // variables initializations
            //const cityName = location.cityName;
            console.log(cityName);
            //const temgetperature = data.current.temperature_2m;
            console.log(data.current.temperature_2m);
            //const windSpeed = data.current.windspeed_10m;
            console.log(data.current.windspeed_10m);
            //const humidity = data.hourly.relativehumidity_2m[0];
            console.log(data.hourly.relativehumidity_2m[0]);

            // display the data
            document.getElementById('city').textContent = cityName + ", " + countryName;
            document.getElementById('temp').textContent = data.current.temperature_2m + " °C";
            document.getElementById('weatherDesc').textContent = "As for " + data.current.time;
            document.getElementById('humidity').textContent = data.hourly.relativehumidity_2m[0] + "%"
            document.getElementById('wind').textContent = data.current.windspeed_10m + "km/h"

        } else {
            errorDisplay.textContent = `Forecast data for city of "${cityName}" cannot be found.`;
            return;
        }

    } catch (error) {
        errorDisplay.textContent = "Network error. Check your connection.";
    }
}
