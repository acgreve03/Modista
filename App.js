import React from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator'; // Importing the AppNavigator
// import WeatherOutfit from './services/WeatherOutfit';  // Comment out or remove if not needed



export default function App() {
  return (
    <View style={styles.container}>
      <AppNavigator />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
