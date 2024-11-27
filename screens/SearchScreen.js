<<<<<<< Updated upstream
// SearchScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import icons from @expo/vector-icons
=======
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
>>>>>>> Stashed changes

/**
 * SearchScreen Component
 * A screen for browsing and searching for outfit inspirations.
 */
export default function SearchScreen() {
  // State to hold search query
  const [query, setQuery] = useState('');
  
  // State to store filtered search results based on query
  const [results, setResults] = useState([]);

<<<<<<< Updated upstream
  // Sample outfits data
  const outfits = [
    { id: 1, name: 'Autumn Outfit', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Sweater Weather', image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Chic Skirts', image: 'https://via.placeholder.com/150' },
  ];
=======
  // State to store all outfits
  const [outfits, setOutfits] = useState([]);

  // State to store user preferences
  const [userPreferences, setUserPreferences] = useState(null);

  // State to track loading status
  const [loading, setLoading] = useState(true);

  // Fetch user preferences and outfits when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch user preferences
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', auth.currentUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          setUserPreferences(userSnapshot.docs[0].data().preferences);
        }

        // Fetch all outfits
        const outfitsSnapshot = await getDocs(collection(db, 'outfits'));
        const outfitsData = outfitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOutfits(outfitsData);

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate how well an outfit matches user preferences
  const calculatePreferenceScore = (outfit) => {
    if (!userPreferences) return 0;
    
    let score = 0;
    
    // Match styles
    if (userPreferences.stylePreferences && outfit.styles) {
      userPreferences.stylePreferences.forEach(style => {
        if (outfit.styles.includes(style)) score += 2;
      });
    }
    
    // Match colors
    if (userPreferences.colorPreferences && outfit.colors) {
      userPreferences.colorPreferences.forEach(color => {
        if (outfit.colors.includes(color)) score += 1;
      });
    }
    
    // Match season
    if (userPreferences.seasonPreferences && 
        outfit.season && 
        userPreferences.seasonPreferences.includes(outfit.season)) {
      score += 1.5;
    }
    
    return score;
  };
>>>>>>> Stashed changes

  /**
   * Filters the list of outfits based on the search query.
   * @param {string} text - The current input in the search bar.
   */
  const handleSearch = (text) => {
    setQuery(text);
    
    let filtered = outfits;

    // Filter by search text if provided
    if (text) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
    }

    // Sort by preference score
    filtered = filtered.sort((a, b) => {
      const scoreA = calculatePreferenceScore(a);
      const scoreB = calculatePreferenceScore(b);
      return scoreB - scoreA; // Higher scores first
    });

    setResults(filtered);
  };

<<<<<<< Updated upstream
=======
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Determine which data to display
  const dataToDisplay = query ? results : outfits;

>>>>>>> Stashed changes
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search outfits..."
          value={query}
          onChangeText={handleSearch}
        />
        <FontAwesome name="sliders" size={24} color="#888" style={styles.icon} />
      </View>

      {/* Tag Section */}
      <View style={styles.tagContainer}>
        {['Casual', 'Classy', 'Comfy'].map((tag) => (
          <TouchableOpacity 
            key={tag} 
            style={styles.tag}
            onPress={() => handleSearch(tag)}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {query ? 'Search Results' : 'Recommended For You'}
      </Text>

      {/* Grid Layout */}
      <View style={styles.grid}>
<<<<<<< Updated upstream
        {outfits.map((outfit) => (
          <View key={outfit.id} style={styles.outfitCard}>
            {/* Display outfit image */}
            <Image source={{ uri: outfit.image }} style={styles.outfitImage} />
            {/* Display outfit name */}
=======
        {dataToDisplay.map((outfit) => (
          <TouchableOpacity key={outfit.id} style={styles.outfitCard}>
            <Image 
              source={{ uri: outfit.image }} 
              style={styles.outfitImage} 
            />
>>>>>>> Stashed changes
            <Text style={styles.outfitName}>{outfit.name}</Text>
            {outfit.styles && (
              <Text style={styles.outfitStyles}>
                {outfit.styles.join(', ')}
              </Text>
            )}
          </TouchableOpacity>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitStyles: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});
