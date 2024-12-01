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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  getDocs,
  serverTimestamp,
  getDoc
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

    if (!newComment.trim()) {
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const comment = {
        userId: userId,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
        username: userData.userName || 'User',
        userProfilePic: userData.profilePictureUrl || null,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      // Update local state
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), comment]
            };
          }
          return post;
        })
      );

      if (selectedPin?.id === postId) {
        setSelectedPin(prev => ({
          ...prev,
          comments: [...(prev.comments || []), comment]
        }));
      }

      setNewComment('');

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
        comments: doc.data().comments || [],
        isLiked: doc.data().likes?.includes(auth.currentUser?.uid),
        isSaved: doc.data().saves?.includes(auth.currentUser?.uid)
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

  const initializeCommentsArray = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: []
      });
    } catch (error) {
      console.error('Error initializing comments:', error);
    }
  };

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
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
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
            <View style={styles.modalContentWrapper}>
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
                  <Text style={styles.commentsHeader}>
                    Comments ({selectedPin.comments?.length || 0})
                  </Text>
                  {selectedPin.comments?.map((comment, index) => (
                    <View key={index} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        {comment.userProfilePic ? (
                          <Image 
                            source={{ uri: comment.userProfilePic }} 
                            style={styles.commentUserPic}
                          />
                        ) : (
                          <View style={styles.commentUserPlaceholder}>
                            <MaterialCommunityIcons 
                              name="account" 
                              size={20} 
                              color="#666" 
                            />
                          </View>
                        )}
                        <Text style={styles.commentUsername}>
                          {comment.firstName} {comment.lastName}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>
                        {comment.text}
                      </Text>
                      <Text style={styles.commentTimestamp}>
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  style={[
                    styles.commentButton,
                    !newComment.trim() && styles.commentButtonDisabled
                  ]}
                  onPress={() => handleComment(selectedPin.id)}
                  disabled={!newComment.trim()}
                >
                  <MaterialCommunityIcons 
                    name="send" 
                    size={24} 
                    color={newComment.trim() ? "#007AFF" : "#999"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
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
  modalContentWrapper: {
    flex: 1,
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
  commentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUserPic: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentUserPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginLeft: 32,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 32,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    backgroundColor: '#f8f8f8',
  },
  commentButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  commentButtonDisabled: {
    opacity: 0.5,
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
  commentSpacing: {
    height: 60, // Add extra space at bottom of comments for keyboard
  },
});