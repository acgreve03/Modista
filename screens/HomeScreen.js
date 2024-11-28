/*
View: A container that supports layout with flexbox.
Text: For displaying text.
FlatList: For rendering a list of items efficiently.
Image: For displaying images.
StyleSheet: For creating styles.
Dimensions: For getting the width and height of the screen. */

import React, {useState} from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, ScrollView, TextInput } from 'react-native';
import pinData from '../data/PinData';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

//Temporary dummy data for other users profiles
const otherUserProfiles = [
  {
    username: 'jane_doe',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
  {
    username: 'john.smith',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
  {
    username: 'BettyBoo',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
  {
    username: 'Alice._.Wonder',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
  {
    username: 'Bob_the_Builder',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
  {
    username: 'HatterMad',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
  {
    username: 'Rabbit',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
  {
    username: 'AnonPanda',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
];

// Function to merge pins with other users profile for testing
const mergePinsWithUsers = () => {
  return pinData.map((pin,index) => {
    const user = otherUserProfiles[index % otherUserProfiles.length];
    return {
      ...pin,
      username: user.username,
      userAvatar: user.userAvatar,
    };
  });
};

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const pinsWithUsers = mergePinsWithUsers(); //Combined data for use

  const handlePinPress = (pin) => {
    setSelectedPin(pin);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleCommentSubmit = () => {
    const trimmedComment = comment.trim();
    if (trimmedComment && !comments.includes(trimmedComment)) {
      setComments([...comments, trimmedComment]);
      setComment('');
    }
  };

  const renderPin = ({ item }) => {
    return(
      <TouchableOpacity onPress={() => handlePinPress(item)}>
        <View style={styles.pinContainer}>
          <Image source={{uri: item.imageUrl}} style={[styles.pinImage, {aspectRatio: item.aspectRatio}]} />
        </View>
      </TouchableOpacity>
    ); 
  };

  return (
   <View style={styles.container}>
    <FlatList
      data={pinsWithUsers} // use merged pins with user data
      renderItem={renderPin}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
    />
    {/* Modal for detailed pin view */}
    <Modal visible={modalVisible} transparent={false} animationType="slide" onRequestClose={handleCloseModal}>
      <View style={styles.modalFullScreenContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleCloseModal}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>

        <ScrollView style={styles.modalContentFullScreen}>
          {selectedPin && (
            <>
              <Image source={{uri: selectedPin.imageUrl}} style={styles.fullImage} />
              
              {/* Engagement Metrics */}
              <View style={styles.engagementMetrics}>
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="heart-outline" size={20}/>
                    <Text style={styles.metricText}>{selectedPin.likesCount}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="comment-outline" size={20}/>
                    <Text style={styles.metricText}>{selectedPin.commentsCount}</Text>
                  </View>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="filter-outline" size={20} color="black"/>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Feather name="share" size={20} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Other users information */}
              <View style={styles.profileSection}>
                <Image source={{uri: selectedPin.userAvatar}} style={styles.profileImage} />
                <Text style={styles.username}>{selectedPin.username}</Text>
              </View>
              <Text style={styles.outfitCaption}>{selectedPin.caption}</Text>
              <Text style={styles.outfitDescription}>{selectedPin.description}</Text>

              {/*Comment section*/}
              <TextInput
                style={styles.commentInput}
                placeholder="Leave a comment..."
                value={comment}
                onChangeText={setComment}
                onSubmitEditing={handleCommentSubmit}
              />

              <View style={styles.commentsSection}>
                {comments.map((c,index) => (
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  pinContainer: {
    width: (screenWidth / 2) - 30,
    marginBottom: 10, 
    marginHorizontal: 5,
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pinImage: {
    width: '100%', 
    height: undefined,
    resizeMode: 'cover',
  }, 
  columnWrapper: {
    justifyContent: 'space-between', 
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
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: screenHeight * 0.6,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 55,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
  },
  followButton: {
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 5,
    marginLeft: 15,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  outfitCaption: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'left',
  },
  outfitDescription: {
    fontSize: 14,
    color: 'grey',
    marginBottom: 10,
    textAlign: 'left',
  },
  commentInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  commentSection: {
    maxHeight: 200,
    marginBottom: 10,
  },
  comment: {
    marginVertical: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  engagementMetrics: {
    marginVertical: 5,
    alignItems: 'flex-start',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  metricText: {
    fontSize: 14,
    marginLeft: 2,
  },
  iconButton: {
    marginHorizontal: 5,
  },
});

export default HomeScreen;