import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,  
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const COLUMN_WIDTH = (screenWidth - 48) / 2;

/**
 * HomeScreen Component
 *
 * Description:
 * - Displays a grid of posts fetched from Firestore in a Pinterest-style layout.
 * - Allows navigation to a detailed view of a post.
 *
 * Features:
 * - Fetches posts from Firestore in descending order of their timestamps.
 * - Displays posts in a two-column grid.
 * - Supports navigation to a detailed post view (`PostDetailsScreen`).
 */
export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Fetch posts from Firestore on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

    /**
   * Fetch posts from Firestore
   * - Retrieves posts collection from Firestore ordered by `timestamp` in descending order.
   * - Maps Firestore documents to an array of post objects and updates state.
   */
  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(fetchedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };


  /**
   * Render an individual post as a grid item (pin)
   * - Displays the post's image.
   * - Navigates to `PostDetailsScreen` when the pin is pressed.
   */
  const renderPin = ({ item }) => (
    <TouchableOpacity
      style={styles.pin}
      onPress={() => navigation.navigate('PostDetailsScreen', { 
        postId: item.id,
        onPostUpdated: fetchPosts
      })}
    >
      <Image
        source={{ uri: item.itemImage }}
        style={[styles.pinImage, { width: COLUMN_WIDTH, height: COLUMN_WIDTH }]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPin}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  grid: {
    padding: 16,
  },
  pin: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pinImage: {
    backgroundColor: 'light gray',
    resizeMode: 'contain'
  },
});