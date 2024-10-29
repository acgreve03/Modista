// SearchScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import icons from @expo/vector-icons

/**
 * SearchScreen Component
 * A screen for browsing and searching for outfit inspirations.
 */
export default function SearchScreen() {
  // State to hold search query
  const [query, setQuery] = useState('');
  
  // State to store filtered search results based on query
  const [results, setResults] = useState([]);

  // Sample outfits data
  const outfits = [
    { id: 1, name: 'Autumn Outfit', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Sweater Weather', image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Chic Skirts', image: 'https://via.placeholder.com/150' },
  ];

  /**
   * Filters the list of outfits based on the search query.
   * @param {string} text - The current input in the search bar.
   */
  const handleSearch = (text) => {
    setQuery(text); // Update the query state
    // Filter outfits by matching the query with the outfit name
    const filteredResults = outfits.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    // Update results if any matches are found, otherwise clear
    setResults(filteredResults.length > 0 ? filteredResults : []);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={query}
          onChangeText={handleSearch}
        />
        {/* Icon for filter settings */}
        <FontAwesome name="sliders" size={24} color="#888" style={styles.icon} />
      </View>

      {/* Tag Section: Displays clickable tags for filtering */}
      <View style={styles.tagContainer}>
        {['Casual', 'Classy', 'Comfy'].map((tag) => (
          <TouchableOpacity key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Title for outfit inspiration */}
      <Text style={styles.sectionTitle}>More Inspo</Text>

      {/* Grid Layout for Outfits */}
      <View style={styles.grid}>
        {outfits.map((outfit) => (
          <View key={outfit.id} style={styles.outfitCard}>
            {/* Display outfit image */}
            <Image source={{ uri: outfit.image }} style={styles.outfitImage} />
            {/* Display outfit name */}
            <Text style={styles.outfitName}>{outfit.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Styles for the SearchScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    // Styles for the search bar container
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    // Styles for the search input box
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  icon: {
    // Style for the filter icon next to search input
    marginLeft: 10,
  },
  tagContainer: {
    // Styles for the container holding the tags
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  tag: {
    // Style for individual tags
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  tagText: {
    // Style for the text within each tag
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    // Style for section titles like "More Inspiration"
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
  },
  grid: {
    // Styles for the outfit grid layout
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  outfitCard: {
    // Styles for individual outfit cards
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
  },
  outfitImage: {
    // Styles for the outfit image
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  outfitName: {
    // Style for outfit name text below each image
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
