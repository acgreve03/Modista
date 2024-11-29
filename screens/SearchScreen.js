import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false); // Track if the search bar is focused

  /**
   * Handles the search logic to filter users by their username.
   * @param {string} text - Input from the search bar.
   */
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setUserResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersQuery = query(
        usersCollection,
        where('userName', '>=', text),
        where('userName', '<=', text + '\uf8ff')
      );
      const snapshot = await getDocs(usersQuery);

      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserResults(results);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !searchQuery && setIsFocused(false)} // Revert focus if query is empty
        />
        <FontAwesome name="sliders" size={24} color="#888" style={styles.icon} />
      </View>

      {/* Conditional Rendering for Search Results or Default View */}
      {isFocused || searchQuery ? (
        // Display user search results
        isSearching ? (
          <Text style={styles.loadingText}>Searching...</Text>
        ) : userResults.length > 0 ? (
          <View>
            {userResults.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => console.log(`Navigate to ${user.userName}'s profile`)}
              >
                <Image
                  source={{ uri: user.profilePictureURL || 'https://via.placeholder.com/150' }}
                  style={styles.userAvatar}
                />
                <Text style={styles.userName}>{user.userName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noResultsText}>No results found</Text>
        )
      ) : (
        // Default view when search is not active
        <>
          <View style={styles.tagContainer}>
            {['Casual', 'Classy', 'Comfy', 'Formal', 'Cozy', 'Warm', 'Spring', 'Fall'].map((tag) => (
              <TouchableOpacity key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>More Inspo</Text>
          <View style={styles.grid}>
            {[
              { id: 1, name: 'Autumn Outfit', image: 'https://via.placeholder.com/150' },
              { id: 2, name: 'Sweater Weather', image: 'https://via.placeholder.com/150' },
              { id: 3, name: 'Chic Skirts', image: 'https://via.placeholder.com/150' },
            ].map((outfit) => (
              <View key={outfit.id} style={styles.outfitCard}>
                <Image source={{ uri: outfit.image }} style={styles.outfitImage} />
                <Text style={styles.outfitName}>{outfit.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}
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
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 8,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
