// ===================================
// Weather App - Main JavaScript
// ===================================

// ========== CONFIGURATION ==========
const API_KEY = "a65e266c9a1d509f8dfe25f9c69d6f45";
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ========== DOM ELEMENTS ==========
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const weatherCard = document.getElementById("weatherCard");

// Weather data elements
const cityName = document.getElementById("cityName").querySelector("span");
const currentDate = document.getElementById("currentDate");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");

// ========== INITIALIZATION ==========
// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  // Set up event listeners
  searchBtn.addEventListener("click", handleSearch);
  locationBtn.addEventListener("click", handleLocationRequest);

  // Allow Enter key to trigger search
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  // Display current date
  displayCurrentDate();

  // Try to get user's location on page load (optional - can be disabled)
  // Uncomment the next line if you want automatic location detection on page load
  // handleLocationRequest();

  console.log("Weather App initialized successfully!");
}

/**
 * Display the current date
 */
function displayCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = now.toLocaleDateString("en-US", options);
  currentDate.textContent = formattedDate;
}

// ========== SEARCH FUNCTIONALITY ==========

/**
 * Handle search button click
 */
function handleSearch() {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name");
    return;
  }

  fetchWeatherByCity(city);
}

/**
 * Handle location button click
 */
function handleLocationRequest() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }

  showLoader();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoordinates(latitude, longitude);
    },
    (error) => {
      handleGeolocationError(error);
    }
  );
}

/**
 * Handle geolocation errors
 */
function handleGeolocationError(error) {
  hideLoader();

  switch (error.code) {
    case error.PERMISSION_DENIED:
      showError(
        "Location access denied. Please enable location permissions and try again."
      );
      break;
    case error.POSITION_UNAVAILABLE:
      showError(
        "Location information is unavailable. Please try searching by city name."
      );
      break;
    case error.TIMEOUT:
      showError("Location request timed out. Please try again.");
      break;
    default:
      showError("An unknown error occurred while getting your location.");
      break;
  }
}

// ========== API CALLS ==========

/**
 * Fetch weather data by city name
 * @param {string} city - City name
 */
async function fetchWeatherByCity(city) {
  showLoader();

  try {
    const url = `${API_BASE_URL}?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "City not found. Please check the spelling and try again."
        );
      } else if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your API configuration."
        );
      } else {
        throw new Error(
          "Failed to fetch weather data. Please try again later."
        );
      }
    }

    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    hideLoader();
    showError(error.message);
    console.error("Error fetching weather by city:", error);
  }
}

/**
 * Fetch weather data by coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 */
async function fetchWeatherByCoordinates(latitude, longitude) {
  try {
    const url = `${API_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your API configuration."
        );
      } else {
        throw new Error(
          "Failed to fetch weather data. Please try again later."
        );
      }
    }

    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    hideLoader();
    showError(error.message);
    console.error("Error fetching weather by coordinates:", error);
  }
}

// ========== DISPLAY FUNCTIONS ==========

/**
 * Display weather data on the page
 * @param {Object} data - Weather data from API
 */
function displayWeatherData(data) {
  hideLoader();
  hideError();

  // Extract data from API response
  if (!data.sys || !data.main || !data.weather || data.weather.length === 0) {
    throw new Error("Invalid weather data received from API");
  }

  const {
    name,
    sys: { country },
    main: {
      temp,
      feels_like,
      humidity: humidityValue,
      pressure: pressureValue,
    },
    weather,
    wind: { speed },
  } = data;

  // Update DOM elements with weather data
  cityName.textContent = `${name}, ${country}`;
  temperature.textContent = `${Math.round(temp)}°C`;
  weatherDescription.textContent = weather[0].description;
  feelsLike.textContent = `${Math.round(feels_like)}°C`;
  humidity.textContent = `${humidityValue}%`;
  windSpeed.textContent = `${speed} m/s`;
  pressure.textContent = `${pressureValue} hPa`;

  // Set weather icon
  const iconCode = weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  weatherIcon.alt = weather[0].description;

  // Show the weather card
  showWeatherCard();

  // Clear the search input
  cityInput.value = "";

  console.log("Weather data displayed successfully for:", name);
}

// ========== UI STATE MANAGEMENT ==========

/**
 * Show loading animation
 */
function showLoader() {
  loader.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  errorMessage.classList.add("hidden");
}

/**
 * Hide loading animation
 */
function hideLoader() {
  loader.classList.add("hidden");
}

/**
 * Show weather card
 */
function showWeatherCard() {
  weatherCard.classList.remove("hidden");
  // Add animation class for smooth entrance
  weatherCard.style.animation = "none";
  setTimeout(() => {
    weatherCard.style.animation = "fadeInUp 0.5s ease";
  }, 10);
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  loader.classList.add("hidden");
}

/**
 * Hide error message
 */
function hideError() {
  errorMessage.classList.add("hidden");
}

// ========== HELPER FUNCTIONS ==========

/**
 * Convert temperature from Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert wind speed from m/s to km/h
 * @param {number} mps - Wind speed in meters per second
 * @returns {number} Wind speed in kilometers per hour
 */
function mpsToKmh(mps) {
  return mps * 3.6;
}

/**
 * Get weather condition category
 * @param {number} weatherId - OpenWeatherMap weather condition ID
 * @returns {string} Weather category
 */
function getWeatherCategory(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return "Thunderstorm";
  if (weatherId >= 300 && weatherId < 400) return "Drizzle";
  if (weatherId >= 500 && weatherId < 600) return "Rain";
  if (weatherId >= 600 && weatherId < 700) return "Snow";
  if (weatherId >= 700 && weatherId < 800) return "Atmosphere";
  if (weatherId === 800) return "Clear";
  if (weatherId > 800) return "Clouds";
  return "Unknown";
}

// ========== ERROR HANDLING ==========

/**
 * Global error handler for unhandled promise rejections
 */
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  showError("An unexpected error occurred. Please try again.");
});

// ========== OPTIONAL ENHANCEMENTS ==========

/**
 * Save recently searched cities to localStorage
 * @param {string} city - City name to save
 */
function saveRecentSearch(city) {
  let recentSearches = JSON.parse(
    localStorage.getItem("recentSearches") || "[]"
  );

  // Remove duplicate if exists
  recentSearches = recentSearches.filter(
    (item) => item.toLowerCase() !== city.toLowerCase()
  );

  // Add to beginning of array
  recentSearches.unshift(city);

  // Keep only last 5 searches
  recentSearches = recentSearches.slice(0, 5);

  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
}

/**
 * Get recently searched cities from localStorage
 * @returns {Array} Array of recent city searches
 */
function getRecentSearches() {
  return JSON.parse(localStorage.getItem("recentSearches") || "[]");
}

// ========== DEBUG UTILITIES (Development Only) ==========

/**
 * Log application state for debugging
 */
function debugAppState() {
  console.log("=== Weather App Debug Info ===");
  console.log("API Key Configured:", API_KEY !== "YOUR_API_KEY_HERE");
  console.log("Current City Input:", cityInput.value);
  console.log("Recent Searches:", getRecentSearches());
  console.log("Geolocation Available:", !!navigator.geolocation);
  console.log("==============================");
}

// Expose debug function to console (for development)
window.debugWeatherApp = debugAppState;

console.log("💡 Tip: Type debugWeatherApp() in console to see app state");
