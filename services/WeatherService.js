import * as Location from 'expo-location';

export const fetchWeather = async () => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Replace with your OpenWeather API key
    const API_KEY = '9cfd7bb135d1b315e9fb7439bdceef51';

    // Fetch weather data
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await response.json();
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};



