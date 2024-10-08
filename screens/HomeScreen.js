/*
View: A container that supports layout with flexbox.
Text: For displaying text.
FlatList: For rendering a list of items efficiently.
Image: For displaying images.
StyleSheet: For creating styles.
Dimensions: For getting the width and height of the screen. */

import React from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import Pin from '../components/Pin'; // Import Pin component from components folder
import pinData from '../data/PinData';


//HomeScreen functional component
const HomeScreen = () => {
  const renderPin = ({ item }) => {
    return(
      <View style={styles.pinContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.pinImage} />
      </View>
    ); 
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pinData} // Directly pass pinData to FlatList
        renderItem={renderPin} // Use renderPin for each item
        keyExtractor={item => item.id.toString()} // Ensure unique keys
        numColumns={2} // Set number of columns like Masonry
        columnWrapperStyle={styles.columnWrapper} // Adjust column spacing
      />
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  pinContainer: {
    flex: 1,
    marginBottom: 10, // Adjust spacing between rows
    marginHorizontal: 5,
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    overflow: 'hidden',
  },

  pinImage: {
    width: '100%', // Ensure the image fills the width of the container
    aspectRatio: 2 / 3, // Maintain a 2:3 aspect ratio (adjust based on your needs)
  }, 

  columnWrapper: {
    justifyContent: 'space-between', // This adds spacing between the columns
    marginBottom: 10, // Adjusts vertical spacing between rows
    paddingHorizontal: 0,
  },
});

export default HomeScreen;