const apiKey = 'API_KEY';  //my API for openweathermap 
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/';
const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const getCurrentLocation = document.getElementById('getCurrentLocation');
const weatherHeader = document.getElementById('weatherHeader');
const weatherInfo = document.getElementById('weatherInfo');
const weatherContainer = document.getElementById('weatherContainer');
const loader = document.getElementById("loading");
const dropdown = document.getElementById('autocomplete-dropdown');
const addFavorite = document.getElementById('addFavorite');

// Event listeners for buttons search and use my location and add favorite to local storage
searchButton.addEventListener('click', getWeatherByLocation);
getCurrentLocation.addEventListener('click', getWeatherByCurrentLocation);
addFavorite.addEventListener('click',addtoFavorite);

// function call on searchButton click
function getWeatherByLocation() {
    dropdown.innerText = '';
    // weatherInfo.classList.add('hidden');
    const location = locationInput.value;
    const weatherUrl = `${weatherApiUrl}weather?q=${location}&appid=${apiKey}`;
    displayLoading()
    // fetch data
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            hideLoading()
            // console.log(data)
            // display data to html 
            displayWeather(data);
        })
        .catch(error => {
            // console.error('Error', error);
            displayError('Location not found. Please try again.');
        });

    getFiveDayForecast()
}

// display weather data
function displayWeather(data) {
    // console.log(data)
    // store info to variable
    const cityName = data.name;
    const temperature = (data.main.temp-273.15).toFixed(2);      //1 celsius = - 273.15 kelvin
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const weatherDescription = data.weather[0].description;
    const weatherIcon = data.weather[0].icon;
    const latitude = data.coord.lat;
    const longitude = data.coord.lon;

    document.getElementById("cityHeader").innerText = `Weather in ${cityName}`;
    document.getElementById("cityWeatherIcon").src = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
    document.getElementById("cityTemperature").innerHTML = `<b>Temperature: </b>${temperature} °C`;
    document.getElementById("cityHumidity").innerHTML = `<b> Humidity: </b> ${humidity}%`;
    document.getElementById("cityWindSpeed").innerHTML = `<b> Wind Speed: </b> ${windSpeed} m/s`;
    document.getElementById("cityDescription").innerHTML = `<b> Description: </b> ${weatherDescription}`;
    document.getElementById("cityLatLong").innerHTML = `<b> Latitude : </b> ${latitude} ; <b> Longitude : </b> ${longitude}`;

    // remove hidden class
    weatherInfo.classList.remove('hidden');
}

// display errors
function displayError(message) {
    const alert = document.getElementById('alert');
    alert.innerText = message
    alert.classList.remove('hidden');
    setTimeout(() => {
        location.reload()
        // alert.classList.add('hidden');
    }, 5000);
}

// function call on use my location click
function getWeatherByCurrentLocation() {
    dropdown.innerText = '';
    weatherInfo.classList.add('hidden');
    weatherContainer.classList.add('hidden');
    displayLoading()
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            // console.log(position.coords);
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const weatherUrl = `${weatherApiUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

            fetch(weatherUrl)
                .then(response => response.json())
                .then(data => {
                    hideLoading()
                    displayWeather(data);
                })
                .catch(error => {
                    // console.error('Error:', error);
                    displayError(`Error fetching data: ${error}`);
                });

            getFiveDayForecastGeo(latitude, longitude);
        },
            (error) => {
                // console.error("Error :", error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        displayError("Enable permission to access your location.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        displayError("Your location is unavailable.");
                        break;
                    case error.TIMEOUT:
                        displayError("OOPS !!! TIME OUT");
                        break;
                    default:
                        displayError("Unknown Error");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

    } else {
        displayError('Geolocation not supported.');
    }
};

// function to get five days weather data using api
function getFiveDayForecast() {
    weatherContainer.classList.add('hidden');
    const location = locationInput.value;
    const weatherUrl = `${weatherApiUrl}forecast?q=${location}&appid=${apiKey}`;
    displayLoading()
    // fetch data
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            hideLoading()
            // console.log(data)
            // display data to html 
            displayForecast(data);
        })
        .catch(error => {
            // console.error('Error', error);
            displayError('Location not found. Please try again.');
        });
}

// display 5 days data
function displayForecast(_data) {
    let listDate = _data.list;
    let data = {};
    for (let i = 0; i < listDate.length; i++) {
        let [date, time] = listDate[i].dt_txt.split(" ");
        if (data[date]) {
            data[date].push(time);
        } else {
            data[date] = [time];
        }
    }

    const forecastCarousel = document.getElementById('forecastCarousel');
    let j = 0
    for (let date in data) {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (date === Object.keys(data)[0]) {
            carouselItem.classList.add('active');
        }

        const h2Title = document.createElement('div');
        h2Title.innerHTML = `<h2 class="mb-5"> Weather Forecast for ${date} </h2>`;
        carouselItem.append(h2Title);

        const row = document.createElement('div');
        row.className = 'row g-5 mb-5';
        for (let time of data[date]) {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-sm-6';
            col.innerHTML = `
          <div class="card shadow">
            <div class="card-header">
              <h4>${date} - ${time}</h4>
            </div>
            <div class="card-body">
              <img src="https://openweathermap.org/img/wn/${_data.list[j].weather[0].icon}@2x.png" alt="">
              <p> <b> Temperature : </b> ${((_data.list[j].main.temp_min)-273.15).toFixed(2)} °C</p>
              <p> <b> Humidity : </b> ${_data.list[j].main.humidity}%</p>
              <p> <b> WindSpeed : </b> ${_data.list[j].wind.speed}</p>
              <p> <b> Description : </b> ${_data.list[j].weather[0].description}</p>
              <p> <b> MinTemp : </b> ${((_data.list[j].main.temp_min)-273.15).toFixed(2)} °C; <b> MaxTemp : </b> ${((_data.list[j].main.temp_max)-273.15).toFixed(2)} °C</p>
            </div>
          </div>
        `;
            row.append(col);
        }
        carouselItem.append(row);
        forecastCarousel.append(carouselItem);
    } 
    j += 1;

    // remove hidden class
    weatherContainer.classList.remove('hidden');

}

// function to get 5 days data using lat and lon
function getFiveDayForecastGeo(latitude, longitude) {
    const weatherUrl = `${weatherApiUrl}forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    displayLoading()
    // fetch data
    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            hideLoading()
            // console.log(data)
            // display data to html 
            displayForecast(data);
        })
        .catch(error => {
            //  console.error('Error :', error);
            displayError('Location not found. Please try again.');
        });
}

// showing loading
function displayLoading() {
    loader.classList.remove("hidden");
}

// hiding loading 
function hideLoading() {
    loader.classList.add("hidden");
}

// add favorite to local storage
function addtoFavorite(){
    const placeName = locationInput.value.trim();
    if (placeName === "") {
        alert("Please enter a valid place or city name.");
        return;
    }
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push(placeName);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    locationInput.value = "";
    renderSuggestions(favorites);
    setTimeout(() => {
        dropdown.innerText='';
    }, 2000);
}

// on input focus show favorites
locationInput.addEventListener('focusin',(event)=>{
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    renderSuggestions(favorites);
});
// locationInput.addEventListener('focusout',(event)=>{dropdown.innerText='';});


// AutoComplete Code for API Geoapify
const apiKeyAutoFill = 'API_KEY';  //myGeoapify API Key
let suggestions = [];   //declared an empty array to stored fetch city names
locationInput.addEventListener('input', () => {
    const inputValue = locationInput.value;
    if (inputValue.length >= 3) {
        fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&apiKey=${apiKeyAutoFill}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                // for(i=0;i<data.features.length;i++){
                //     suggestions.push(data.features[i].properties.formatted)
                // }
                // suggestions = Array.from(new Set(suggestions))
                suggestions = data.features.map(feature => feature.properties.formatted);
                renderSuggestions(suggestions);
            })
            .catch(error => {
                console.error('Error', error);
                displayError('Refresh Page and Try again !! or wait 5-sec for Auto Page Refresh');
            });
    }
});

// function to show place names below input field
function renderSuggestions(suggestions) {
    // console.log('render called', suggestions);
    dropdown.innerText = '';
    for (const suggestion of suggestions) {
        const suggestionItem = document.createElement('div');
        suggestionItem.innerText = suggestion;
        suggestionItem.addEventListener('click', () => {
            locationInput.value = suggestion;
            dropdown.innerText = '';
        });
        dropdown.append(suggestionItem);
    }
}