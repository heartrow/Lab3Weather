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
            
            console.log(latitude, longitude);

            return {
                lat: latitude,
                lon: longitude
            };

        } else {
            errorDisplay.textContent = `No city found matching "${input}".`;
            return;
        }

    } catch (error) {
        errorDisplay.textContent = "Network error. Check your connection.";
    }
}

