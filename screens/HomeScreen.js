/*
View: A container that supports layout with flexbox.
Text: For displaying text.
FlatList: For rendering a list of items efficiently.
Image: For displaying images.
StyleSheet: For creating styles.
Dimensions: For getting the width and height of the screen. */

import React from 'react';
import { View, StyleSheet, Dimensions} from 'react-native';
import MasonryList from 'react-native-masonry-list';
import Pin from '../components/Pin'; // Import Pin component from components folder
import pinData from '../data/PinData'


//HomeScreen functional component
const HomeScreen = () => {

  const renderPin = (pin) => {
    return <Pin imageUrl={pin.uri} />;
  };

  return (
    <View style={styles.container}>
      {/* Masonry List */}
      <MasonryList
        images={pinData.map(pin => ({
          uri: pin.imageUrl,
          id: pin.id,
        }))}
        columns={2} // Number of columns in the Masonry grid
        spacing={5} // Spacing between images
        showsVerticalScrollIndicator={false}
        customRenderItem={renderPin} // Use the custom render function
      />
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default HomeScreen;