// SearchScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const outfits = [
    { id: 1, name: 'Autumn Outfit', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Sweater Weather', image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Chic Skirts', image: 'https://via.placeholder.com/150' },
  ];
  

  // Filter outfits based on query
  const handleSearch = (text) => {
    setQuery(text);
    if (text) {
      const filteredResults = outfits.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search outfits, styles, or items..."
        value={query}
        onChangeText={handleSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {outfits.map((outfit) => (
          <View key={outfit.id} style={styles.outfitCard}>
            <Image source={outfit.image} style={styles.outfitImage} />
            <Text style={styles.outfitName}>{outfit.name}</Text>
          </View>
        ))}
      </ScrollView>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Search Results:</Text>
          {results.map((item) => (
            <TouchableOpacity key={item.id} style={styles.resultItem}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  outfitCard: {
    marginRight: 10,
    alignItems: 'center',
  },
  outfitImage: {
    width: 100,
    height: 120,
    borderRadius: 8,
  },
  outfitName: {
    marginTop: 5,
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});
