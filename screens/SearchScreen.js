import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

/**
 * SearchScreen Component
 * A screen for browsing and searching for outfit inspirations with advanced recommendations.
 */
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Sample data for outfits with categories and views to simulate popularity
  const outfits = [
    { id: 1, name: 'Autumn Outfit', category: 'Casual', views: 200, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Sweater Weather', category: 'Comfy', views: 500, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Chic Skirts', category: 'Classy', views: 150, image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Winter Coat', category: 'Warm', views: 300, image: 'https://via.placeholder.com/150' },
  ];

  // Mock data for recent searches and collaborative filtering
  const recentSearches = ['Casual', 'Warm', 'Sweater'];
  const collaborativeData = {
    'Casual': ['Sweater Weather', 'Winter Coat'],  // Users who searched 'Casual' also liked these
    'Warm': ['Autumn Outfit', 'Chic Skirts']
  };

  /**
   * Filters and recommends outfits based on the search query using multiple recommendation layers.
   * @param {string} text - The current input in the search bar.
   */
  const handleSearch = (text) => {
    setQuery(text);
    let filteredResults = [];

    if (text) {
      // Exact matches by name or category
      filteredResults = outfits.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) || 
        item.category.toLowerCase().includes(text.toLowerCase())
      );

      // If no exact matches, recommend items based on collaborative filtering
      if (filteredResults.length === 0) {
        const relatedItems = collaborativeData[text];
        if (relatedItems) {
          filteredResults = outfits.filter((item) =>
            relatedItems.includes(item.name)
          );
        }
      }

      // Apply a weighted scoring system to rank results by popularity and relevance
      filteredResults = filteredResults.map((item) => ({
        ...item,
        score: (item.views / 100) + (recentSearches.includes(item.category) ? 2 : 0)
      }));
      filteredResults.sort((a, b) => b.score - a.score); // Sort by highest score
    } else {
      // Show popular items if no search query
      filteredResults = outfits.sort((a, b) => b.views - a.views);
    }

    setResults(filteredResults);
  };

  // Display either search results or popular items as recommendations
  const dataToDisplay = results.length > 0 ? results : outfits;

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
        <FontAwesome name="sliders" size={24} color="#888" style={styles.icon} />
      </View>

      {/* Tag Section: Displays clickable tags for filtering */}
      <View style={styles.tagContainer}>
        {['Casual', 'Classy', 'Comfy', 'Warm'].map((tag) => (
          <TouchableOpacity key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>{query ? "Search Results" : "Popular Now"}</Text>

      {/* Grid Layout for Outfits */}
      <View style={styles.grid}>
        {dataToDisplay.map((outfit) => (
          <View key={outfit.id} style={styles.outfitCard}>
            <Image source={{ uri: outfit.image }} style={styles.outfitImage} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  icon: {
    marginLeft: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  outfitCard: {
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
  },
  outfitImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  outfitName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
