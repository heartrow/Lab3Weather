async function getWeatherData(){
    try {
        const search = document.getElementById("searchBar").value;

        const response = await fetch(`geocoding-api.openmeteo.com/v1/search?name=${encodeURIComponent(search)}&count=1&language=en&format=json`);
        const data = await response.json();

        if(!data.results || data.results.length === 0) {
            //Status return
            return null;
        }

        const {latitude, longitude, name, country} = data.results[0];

        console.log(`Found: ${name}, ${country} at ${latitude}, ${longitude}`);

        return {latitude, longitude};
    
    } catch (error) {
        console.error("Geocoding error:", error);
    }
}