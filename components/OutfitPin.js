import React, { useRef, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated, Text, Dimensions, Modal, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { userData } from '../screens/Profile/UserProfile.js'; 

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const OutfitPin = ({ outfit }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 1.1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePinPress = () => {
    setSelectedOutfit(outfit);
    setModalVisible(true);
    console.log('Modal opened with outfit:', outfit);
  };

  const handleCommentSubmit = () => {
    const trimmedComment = comment.trim();
    if (trimmedComment && !comments.includes(trimmedComment)) {
        setComments([...comments, trimmedComment]);
        setComment('');
    }
};

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePinPress}>
        <Animated.View style={[styles.outfitContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: outfit.imageUrl }} style={[styles.outfitImage, { aspectRatio: outfit.aspectRatio }]} />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Modal for Detailed Outfit View */}
      <Modal visible={modalVisible} transparent={false} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.modalFullScreenContainer}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleCloseModal}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          
          <ScrollView style={styles.modalContentFullScreen}>
            {selectedOutfit && (
              <>
                
                <Text style={styles.title}>{selectedOutfit.title}</Text>
                <Image source={{ uri: selectedOutfit.imageUrl }} style={styles.fullImage} />

                {/* Engagement Metrics */}
                <View style={styles.engagementMetrics}>
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <MaterialCommunityIcons name="heart-outline" size={20} />
                      <Text>{selectedOutfit.likesCount} </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <MaterialCommunityIcons name="comment-outline" size={20} />
                      <Text>{selectedOutfit.commentsCount} </Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="filter-outline" size={20} color="black" /> 
                                         
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                    <Feather name="share" size={20} color="black" />
                      
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                  </View>
                </View>

                

                {/* User Information */}
                <View style={styles.profileSection}>
                <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
                  <Text style={styles.username}>{userData.username}</Text>
                  
                </View>
                <Text style={styles.outfitCaption}>{selectedOutfit.caption}</Text>
                <Text style={styles.outfitDescription}>{selectedOutfit.description}</Text>

                

                {/* Comment Section */}
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

                {/* Related Pins */}
                <View style={styles.relatedPinsSection}>
                  <Text style={styles.relatedPinsTitle}>Related Pins:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {/* Example related pin item */}
                    <View style={styles.relatedPinItem}>
                      <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.relatedPinImage} />
                    </View>
                    <View style={styles.relatedPinItem}>
                      <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.relatedPinImage} />
                    </View>
                  </ScrollView>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  outfitContainer: {
    marginBottom: 10,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    width: (screenWidth / 2) - 30,
  },
  imageWrapper: {
    position: 'relative',
  },
  outfitImage: {
    width: '100%',
    height: undefined,
    resizeMode: 'cover',
  },
  modalFullScreenContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalContentFullScreen: {
    width: '100%',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 25,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    zIndex: 10,  // Ensure the back button appears on top
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  fullImage: {
    width: '100%',
    height: screenHeight * 0.6, // Set image height to 60% of screen height
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 30,
  },
  outfitDescription: {
    fontSize: 14,
    color:  'grey',
    marginBottom: 10,
    textAlign: 'left',
  },
  outfitCaption: {
    fontSize: 20,
    marginVertical: 5,
    textAlign: 'left',
  },
  profileSection: {
    flexDirection: 'row', // Ensures profile picture and username are in a row
    alignItems: 'center',  // Vertically centers the items
    justifyContent: 'flex-start', // Align items to the start (left)
    width: '100%',
    marginVertical: 10,
    
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    paddingLeft: 10,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 5,
    marginLeft: 130,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  engagementMetrics: {
    marginVertical: 5,
    alignItems: 'flex-start', // Align items to the left
    paddingLeft: 2
  },

  metricsRow: {
   flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the left
    flexWrap: 'wrap', // Wrap items if they overflow
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5, // Reduced margin for items
  },
  editButton: {
    
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButtonText: {
    color: 'black',
    textAlign: 'center',
  },
  shareButton: {
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  shareButtonText: {
    color: 'black',
    textAlign: 'center',
  },
  commentInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  commentsSection: {
    maxHeight: 200,
    marginBottom: 10,
  },
  comment: {
    marginVertical: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  relatedPinsSection: {
    marginTop: 20,
  },
  relatedPinsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  relatedPinItem: {
    marginRight: 10,
  },
  relatedPinImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default OutfitPin;
