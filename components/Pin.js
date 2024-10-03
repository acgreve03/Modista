// components/Pin.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const Pin = ({ imageUrl }) => {
  return (
    <View style={styles.pinContainer}>
      <Image source={{ uri: imageUrl }} style={styles.pinImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  pinContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: '#f3f3f3', // Placeholder background color
    borderRadius: 10,
    overflow: 'hidden', // Prevents overflow of child components
  },
  pinImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10, // Adds rounded corners to the pin
  },
});

export default Pin;