import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text, 
  Modal, 
  ScrollView, 
  TextInput, 
  Alert 
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import pinData from '../data/PinData'; 
const screenWidth = Dimensions.get('window').width;
const COLUMN_WIDTH = (screenWidth - 48) / 2; // 48 accounts for container padding and gap

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch real posts from Firebase
      const postsRef = collection(db, 'posts');
      const querySnapshot = await getDocs(postsRef);
      
      const realPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        isReal: true, // Flag to identify real posts
        ...doc.data()
      }));

      // Combine with mock data
      const mockPosts = pinData.map(pin => ({
        ...pin,
        isReal: false // Flag to identify mock posts
      }));

      // Combine both arrays and shuffle them
      const allPosts = [...realPosts, ...mockPosts].sort(() => Math.random() - 0.5);
      
      console.log('Total posts:', allPosts.length);
      setPosts(allPosts);

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePinPress = (pin) => {
    setSelectedPin(pin);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPin(null);
  };

  const handleCommentSubmit = () => {
    const trimmedComment = comment.trim();
    if (trimmedComment && !comments.includes(trimmedComment)) {
      setComments([...comments, trimmedComment]);
      setComment('');
    }
  };

  const handleLikePress = async (postId) => {
    if (!selectedPin.isReal) return; // Only handle likes for real posts
    
    try {
      const postRef = doc(db, 'posts', postId);
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        Alert.alert('Please sign in to like posts');
        return;
      }

      await updateDoc(postRef, {
        likes: isLiked ? 
          arrayRemove(userId) : 
          arrayUnion(userId)
      });

      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const renderPin = ({ item }) => {
    const imageSource = item.isReal ? 
      { uri: item.itemImage } : 
      { uri: item.imageUrl };

    return (
      <TouchableOpacity 
        onPress={() => handlePinPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.pinContainer}>
          <Image 
            source={imageSource}
            style={[
              styles.pinImage,
              {
                width: COLUMN_WIDTH,
                height: COLUMN_WIDTH * 1.5, // Default aspect ratio of 1.5
                // You can also make height dynamic based on image dimensions
              }
            ]} 
            resizeMode="cover"
          />
          {item.isReal && (
            <View style={styles.realPostBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
              <Text style={styles.realPostText}>Real</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPin}
        keyExtractor={(item) => item.id?.toString() || item.itemId?.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchPosts}
        refreshing={loading}
      />

      <Modal 
        visible={modalVisible} 
        transparent={false} 
        animationType="slide" 
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalFullScreenContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleCloseModal}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color="#000"
            />
          </TouchableOpacity>

          <ScrollView style={styles.modalContentFullScreen}>
            {selectedPin && (
              <>
                <Image 
                  source={selectedPin.isReal ? 
                    { uri: selectedPin.itemImage } : 
                    { uri: selectedPin.imageUrl }
                  } 
                  style={styles.fullImage} 
                />
                
                {selectedPin.isReal ? (
                  // Real post interactions
                  <View style={styles.engagementMetrics}>
                    <TouchableOpacity 
                      style={styles.likeButton}
                      onPress={() => handleLikePress(selectedPin.id)}
                    >
                      <MaterialCommunityIcons 
                        name={isLiked ? "heart" : "heart-outline"} 
                        size={24} 
                        color={isLiked ? "#ff0000" : "#000"} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentButton}>
                      <MaterialCommunityIcons 
                        name="comment-outline" 
                        size={24} 
                        color="#000" 
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Mock post static metrics
                  <View style={styles.engagementMetrics}>
                    <View style={styles.mockMetric}>
                      <MaterialCommunityIcons 
                        name="heart-outline" 
                        size={24} 
                        color="#666" 
                      />
                      <Text style={styles.mockMetricText}>
                        {Math.floor(Math.random() * 100)}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.profileSection}>
                  <Image 
                    source={{ uri: selectedPin.userAvatar }} 
                    style={styles.profileImage} 
                  />
                  <Text style={styles.username}>{selectedPin.username}</Text>
                </View>
                <Text style={styles.outfitCaption}>
                  {selectedPin.isReal ? selectedPin.caption : selectedPin.title}
                </Text>
                <Text style={styles.outfitDescription}>{selectedPin.description}</Text>

                <TextInput
                  style={styles.commentInput}
                  placeholder="Leave a comment..."
                  value={comment}
                  onChangeText={setComment}
                  onSubmitEditing={handleCommentSubmit}
                />

                <View style={styles.commentsSection}>
                  {comments.map((c, index) => (
                    <Text key={index} style={styles.comment}>{c}</Text>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pinContainer: {
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
    backgroundColor: '#e1e1e1', // Placeholder color while loading
  },
  modalFullScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  modalContentFullScreen: {
    flex: 1,
    marginTop: 60,
  },
  fullImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  engagementMetrics: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  likeButton: {
    marginRight: 16,
  },
  commentButton: {
    marginRight: 16,
  },
  mockMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockMetricText: {
    marginLeft: 4,
    color: '#666',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  outfitCaption: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
  },
  outfitDescription: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
  },
  commentInput: {
    height: 100,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  commentsSection: {
    paddingHorizontal: 16,
  },
  comment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  realPostBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 150, 136, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  realPostText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});