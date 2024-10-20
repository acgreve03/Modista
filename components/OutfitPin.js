import React, { useRef, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Animated, Text, Dimensions, Modal, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Ensure you have this package installed

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height; // Get the screen height for modal sizing

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
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment('');
    }
  };

  // Function to close the modal
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
      <Modal visible={modalVisible} transparent={false} animationType="fade">
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
                <Text style={styles.outfitCaption}>{selectedOutfit.caption}</Text>
                <Text style={styles.outfitDescription}>{selectedOutfit.description}</Text>

                {/* User Information */}
                <View style={styles.profileSection}>
                  <Image source={{ uri: selectedOutfit.profilePic }} style={styles.profileImage} />
                  <Text style={styles.username}>{selectedOutfit.username}</Text>
                  <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                </View>

                {/* Engagement Metrics */}
                <View style={styles.engagementMetrics}>
                  <Text>{selectedOutfit.saves} Saves</Text>
                  <Text>{selectedOutfit.commentsCount} Comments</Text>
                </View>

                {/* Comment Section */}
                <TextInput
                  style={styles.commentInput}
                  placeholder="Leave a comment..."
                  value={comment}
                  onChangeText={setComment}
                  onSubmitEditing={handleCommentSubmit}
                />
                
                <ScrollView style={styles.commentsSection}>
                  {comments.map((c, index) => (
                    <Text key={index} style={styles.comment}>{c}</Text>
                  ))}
                </ScrollView>

                {/* Related Pins (Placeholder) */}
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
    zIndex: 10,  // Set a higher zIndex to ensure the button appears on top
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  fullImage: {
    width: '100%',
    height: screenHeight * 0.6, // Set image height to half the screen height
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 30,
  },
  outfitDescription: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  outfitCaption: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 5,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  engagementMetrics: {
    marginVertical: 10,
    alignItems: 'center',
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
