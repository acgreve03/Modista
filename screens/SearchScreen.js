import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * SearchScreen Component
 * A screen for browsing and searching for outfit inspirations with advanced recommendations.
 */
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', auth.currentUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          setUserPreferences(userSnapshot.docs[0].data().preferences);
        }

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

  const calculatePreferenceScore = (outfit) => {
    if (!userPreferences) return 0;
    
    let score = 0;
    
    if (userPreferences.stylePreferences && outfit.styles) {
      userPreferences.stylePreferences.forEach(style => {
        if (outfit.styles.includes(style)) score += 2;
      });
    }
    
    if (userPreferences.colorPreferences && outfit.colors) {
      userPreferences.colorPreferences.forEach(color => {
        if (outfit.colors.includes(color)) score += 1;
      });
    }
    
    if (userPreferences.seasonPreferences && 
        outfit.season && 
        userPreferences.seasonPreferences.includes(outfit.season)) {
      score += 1.5;
    }
    
    return score;
  };

  const handleSearch = (text) => {
    setQuery(text);
    
    let filtered = outfits;

    if (text) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
    }

    filtered = filtered.sort((a, b) => {
      const scoreA = calculatePreferenceScore(a);
      const scoreB = calculatePreferenceScore(b);
      return scoreB - scoreA;
    });

    setResults(filtered);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (outfits.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.noDataText}>No outfits available yet!</Text>
        <Text style={styles.subText}>Check back soon for outfit recommendations</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search outfits..."
          value={query}
          onChangeText={handleSearch}
        />
        <FontAwesome name="sliders" size={24} color="#888" style={styles.icon} />
      </View>

      <View style={styles.tagContainer}>
        {['Casual', 'Classy', 'Comfy', 'Warm'].map((tag) => (
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

      <View style={styles.grid}>
        {(query ? results : outfits).map((outfit) => (
          <TouchableOpacity key={outfit.id} style={styles.outfitCard}>
            <Image 
              source={{ uri: outfit.image }} 
              style={styles.outfitImage} 
            />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  icon: {
    padding: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  outfitCard: {
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
  },
  outfitImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  outfitName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  outfitStyles: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});