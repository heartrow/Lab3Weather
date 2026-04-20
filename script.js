async function getLocation(){
    const input = document.getElementById('searchBar').value;
    const errorDisplay = document.getElementById('status');

    errorDisplay.textContent = "";

    const url = `geocoding-api.openmeteo.com/v1/search?name=${encodeURIComponent(input)}&count=1&language=en&format=json`;
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            errorDisplay.textContent = "Server error. Please try again later.";
            return;
        }

        const data = await response.json();

        if(!data.results || data.results.length === 0) {
            errorDisplay.textContent = `No city found matching "${input}".`;
            return;
        } else {
            const {latitude, longitude, name, country} = data.results[0];

            return {
                lat: latitude,
                lon: longitude
            };
        }

    } catch (error) {
        errorDisplay.textContent = "Network error. Check your connection.";
    }
}

