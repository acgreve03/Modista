import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fetchWeather } from './WeatherService'; // Import your service

const WeatherOutfit = () => {
  const [weather, setWeather] = useState(null);
  const [outfits, setOutfits] = useState([]);

  useEffect(() => {
    const getWeather = async () => {
      try {
        const weatherData = await fetchWeather();
        setWeather(weatherData);
        generateOutfits(weatherData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    getWeather();
  }, []);

  const generateOutfits = (weatherData) => {
    const { temp } = weatherData.main;
    const condition = weatherData.weather[0].main.toLowerCase();

    // Mock logic for outfit filtering
    const mockCloset = [
      { id: 1, name: 'Raincoat', season: 'Rainy', tempRange: [5, 15] },
      { id: 2, name: 'T-shirt', season: 'Summer', tempRange: [20, 35] },
    ];

    const filteredOutfits = mockCloset.filter(item => {
      if (temp < 10 && item.season === 'Winter') return true;
      if (condition.includes('rain') && item.season === 'Rainy') return true;
      if (temp > 20 && item.season === 'Summer') return true;
      return false;
    });

    setOutfits(filteredOutfits);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather-Based Outfit Suggestions</Text>
      {weather ? (
        <>
          <Text>Weather: {weather.weather[0].description}</Text>
          <Text>Temperature: {weather.main.temp}°C</Text>
          <Text>Recommended Outfits:</Text>
          {outfits.map(outfit => (
            <Text key={outfit.id}>{outfit.name}</Text>
          ))}
        </>
      ) : (
        <Text>Loading weather...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});

export default WeatherOutfit;
