import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Image, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Ensure you have this package installed
import OutfitPin from '../../components/OutfitPin.js'; // Import the OutfitPin component

const outfitsURL = [
  { id: 1, description: 'jfqifohqgt', caption: 'Simple Casual', imageUrl: 'https://i.pinimg.com/236x/eb/ec/7c/ebec7c38ab5a771302557d508ea8468c.jpg', aspectRatio: 236 / 356 },
  { id: 2, description: 'qfhogeihu', caption: 'College attire', imageUrl: 'https://i.pinimg.com/736x/11/1f/94/111f949c65cbeb4c4e230333bb4ab4cf.jpg', aspectRatio: 736 / 1104 },
  { id: 3, description: 'faofhqiwurqgo', caption: 'Fall fit', imageUrl: 'https://i.pinimg.com/236x/e0/ec/5a/e0ec5a9314ac3ac3f125450cc14bee94.jpg', aspectRatio: 236 / 356 },
  { id: 4, description: 'fjoaghwraga', caption: 'Blue Creme Combo', imageUrl: 'https://i.pinimg.com/236x/4c/b3/d7/4cb3d7ea142d71bcf7eb39b40e068935.jpg', aspectRatio: 236 / 356 },
  { id: 5, description: 'hofghwegweg', caption: 'Everyday Wear', imageUrl: 'https://i.pinimg.com/474x/73/b1/37/73b13740879895dfac847e7f1bc4e4a3.jpg', aspectRatio: 474 / 711 },
  { id: 6, description: 'fhaweughtagn', caption: 'Autumn Sweater Outfit', imageUrl: 'https://i.pinimg.com/474x/c6/07/16/c60716161bf57238defad851c2007fe7.jpg', aspectRatio: 474 / 711 },
  { id: 7, description: 'fiqghuqgh', caption: 'Simple Casual', imageUrl: 'https://i.pinimg.com/474x/09/0b/3d/090b3d232b1975e280fe0819249c4421.jpg', aspectRatio: 474 / 711 },
  { id: 8, description: 'fhwghawig', caption: 'Winter fit', imageUrl: 'https://i.pinimg.com/474x/28/66/5b/28665bdb38573a2cd4b775d51a355c9c.jpg', aspectRatio: 474 / 711 },
];

const screenWidth = Dimensions.get('window').width;

const Outfits = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOutfits = outfitsURL.filter(outfit =>
    (outfit.description && outfit.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (outfit.caption && outfit.caption.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderPin = ({ item }) => {
    // Pass the full outfit data to OutfitPin
    return <OutfitPin outfit={item} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search outfits..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="heart-outline" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="filter" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredOutfits}
        renderItem={renderPin}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} // Number of columns for the grid
        columnWrapperStyle={styles.columnWrapper} // Ensures proper spacing between columns
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator if desired
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default Outfits;