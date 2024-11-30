import React, { useState, useEffect } from 'react';
import { 
  View, 
  Alert,
  FlatList, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Text, 
  Modal, 
  ScrollView,
  TextInput,
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const COLUMN_WIDTH = (screenWidth - 48) / 2;

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const handleLike = async (postId) => {
    if (!auth.currentUser) {
      Alert.alert('Sign in required', 'Please sign in to like posts');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      const isLiked = post.likes?.includes(userId);

      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });

      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            const updatedLikes = isLiked 
              ? post.likes.filter(id => id !== userId)
              : [...(post.likes || []), userId];
            
            return {
              ...post,
              likes: updatedLikes,
              isLiked: !isLiked
            };
          }
          return post;
        })
      );

      if (selectedPin?.id === postId) {
        setSelectedPin(prev => ({
          ...prev,
          likes: isLiked 
            ? prev.likes.filter(id => id !== userId)
            : [...(prev.likes || []), userId],
          isLiked: !isLiked
        }));
      }

    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleComment = async (postId) => {
    if (!auth.currentUser) {
      Alert.alert('Sign in required', 'Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const userId = auth.currentUser.uid;
      const postRef = doc(db, 'posts', postId);
      
      const comment = {
        userId,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
        username: auth.currentUser.displayName || 'User'
      };

      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      setNewComment('');
      fetchPosts();

    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleSave = async (postId) => {
    if (!auth.currentUser) {
      Alert.alert('Sign in required', 'Please sign in to save posts');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      const isSaved = post.saves?.includes(userId);

      await updateDoc(postRef, {
        saves: isSaved ? arrayRemove(userId) : arrayUnion(userId)
      });

      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            const updatedSaves = isSaved 
              ? post.saves.filter(id => id !== userId)
              : [...(post.saves || []), userId];
            
            return {
              ...post,
              saves: updatedSaves,
              isSaved: !isSaved
            };
          }
          return post;
        })
      );

      if (selectedPin?.id === postId) {
        setSelectedPin(prev => ({
          ...prev,
          saves: isSaved 
            ? prev.saves.filter(id => id !== userId)
            : [...(prev.saves || []), userId],
          isSaved: !isSaved
        }));
      }

    } catch (error) {
      console.error('Error updating save:', error);
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsRef = collection(db, 'posts');
      const querySnapshot = await getDocs(postsRef);
      
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isLiked: doc.data().likes?.includes(auth.currentUser?.uid),
        isSaved: doc.data().saves?.includes(auth.currentUser?.uid),
      }));
      
      setPosts(postsData);
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

  const renderPin = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handlePinPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.pinContainer}>
        <Image 
          source={{ uri: item.itemImage }}
          style={[
            styles.pinImage,
            {
              width: COLUMN_WIDTH,
              height: COLUMN_WIDTH * 1.5,
            }
          ]} 
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPin}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchPosts}
        refreshing={loading}
      />

      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
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

          {selectedPin && (
            <ScrollView style={styles.modalContent}>
              <Image 
                source={{ uri: selectedPin.itemImage }}
                style={styles.modalImage} 
              />
              
              <View style={styles.interactionBar}>
                <TouchableOpacity 
                  onPress={() => handleLike(selectedPin.id)}
                  style={styles.interactionButton}
                >
                  <MaterialCommunityIcons 
                    name={selectedPin.isLiked ? "heart" : "heart-outline"} 
                    size={24} 
                    color={selectedPin.isLiked ? "#ff0000" : "#000"} 
                  />
                  <Text style={styles.likeCount}>
                    {selectedPin.likes?.length || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleSave(selectedPin.id)}
                  style={styles.interactionButton}
                >
                  <MaterialCommunityIcons 
                    name={selectedPin.isSaved ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color={selectedPin.isSaved ? "#000" : "#000"} 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.caption}>{selectedPin.caption}</Text>
              <Text style={styles.timestamp}>
                {new Date(selectedPin.timestamp).toLocaleDateString()}
              </Text>

              <View style={styles.commentsSection}>
                {selectedPin.comments?.map((comment, index) => (
                  <View key={index} style={styles.commentItem}>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  onSubmitEditing={() => handleComment(selectedPin.id)}
                />
                <TouchableOpacity 
                  onPress={() => handleComment(selectedPin.id)}
                  style={styles.commentButton}
                >
                  <MaterialCommunityIcons name="send" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
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
    backgroundColor: '#e1e1e1',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: screenWidth * 1.5,
    resizeMode: 'cover',
  },
  caption: {
    fontSize: 16,
    padding: 16,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  commentsSection: {
    padding: 16,
  },
  commentItem: {
    marginBottom: 12,
  },
  commentText: {
    color: '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  commentButton: {
    justifyContent: 'center',
  },
  interactionBar: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  likeCount: {
    marginLeft: 8,
    fontSize: 16,
  },
});