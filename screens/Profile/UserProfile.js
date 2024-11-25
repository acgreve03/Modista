import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Button, FlatList } from 'react-native';
import Outfits from './Outfits'; // Import the OutfitsGrid component
import Closet from './Closet'; // Import the Closet component
import Saved from './Saved'; // Import the Closet component
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Outfits');
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [modalType, setModalType] = useState('followers');

  //Fetching current user's data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser; // Get the current logged-in user
      if (user) {
        const userRef = doc(db, 'users', user.uid); // Reference to the user's document
        const docSnap = await getDoc(userRef); // Get the document snapshot

        if (docSnap.exists()) {
          setUserProfile(docSnap.data()); // Set the user profile data
        } else {
          console.log('No such document!');
        }
      }
      await fetchFollowers();
      await fetchFollowing();
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  //Fetch followers list
  const fetchFollowers = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const followers = docSnap.data().followers || [];

        //fetch full profiles for each follower UID
        const followersData = await Promise.all(
          followers.map(async (followerId) => {
            const followerRef = doc(db, 'users', followerId);
            const followerSnap = await getDoc(followerRef);
            if (followerSnap.exists()) {
              return { id: followerId, ...followerSnap.data()};
            } else {
              return { id: followerId, userName: 'Unknown User', profilePictureUrl: ''}; //Default values
            }
          })
        );
        setFollowersList(followersData); // update state with full profiles
      }
    } catch (error) {
      console.error("Error fetching followers: ", error);
    }
  };

  //Fetch following list
  const fetchFollowing = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const following = docSnap.data().following || [];
        
        //Fetch full profiles for each following UID
        const followingData = await Promise.all(
          following.map(async (followingId) => {
            const followingRef = doc(db, 'users', followingId);
            const followingSnap = await getDoc(followingRef);
            if (followingSnap.exists()) {
              return { id: followingId, ...followingSnap.data()};
            } else {
              return { id: followingId, userName: 'Unknown User', profilePictureUrl: ''}; //default values
            }
          })
        );
        setFollowingList(followingData); //update state with full profiles
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  //Function to follow a user
  const followUser = async (currentUserId, targetUserId) => {
    await updateDoc(doc(db, 'users', targetUserId), {
        followers: arrayUnion(currentUserId),
    });
    await updateDoc(doc(db, 'users', currentUserId), {
        following: arrayUnion(targetUserId),
    });
    setIsFollowing(true);
    fetchFollowers();
    fetchFollowing();
  };

  //Function to unfollow a user
  const unFollowUser = async (currentUserId, targetUserId) => {
    await updateDoc(doc(db, 'users', targetUserId), {
        followers: arrayRemove(currentUserId),
    });
    await updateDoc(doc(db, 'users', currentUserId), {
        following: arrayRemove(targetUserId),
    });
    setIsFollowing(false);
    fetchFollowers();
    fetchFollowing();
  };

  //Fetch selected user's profile and check follow status
  const openUserProfileModal = async (userId, type) => {
    setModalType(type);
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if(docSnap.exists()) {
        const selectedUser = docSnap.data();
        setSelectedUserProfile(selectedUser);

        //Check if current user is following the selected user
        const currentUserId = auth.currentUser.uid;
        setIsFollowing(selectedUser.followers?.includes(currentUserId) || false);
        setIsModalVisible(true);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedUserProfile(null);
  };

    //Loading screen
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="purple" />
          <Text>Loading profile...</Text>
        </View>
      );
    }

    // Tab content rendering
    const renderTabContent = () => {
        switch (selectedTab) {
            case 'Outfits':
              return <Outfits />; // Load the outfits grid when the "Outfits" tab is selected
            case 'Closet':
                return <Closet />; // Load the Closet component
            case 'Saved':
                return <Saved /> // Loads saved component tab
            default:
                return null;
        }
    };

    return  (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
            {/* Header Image */}
            <View style={styles.headerContainer}>
                <Image
                    source={{ uri: userProfile?.headerImage || 'https://via.placeholder.com/600x200' }}
                    style={styles.headerImage}
                />
                {/* Profile Picture */}
                <Image
                    source={{ uri: userProfile?.profilePictureUrl || 'https://via.placeholder.com/150' }}
                    style={styles.profilePicture}
                />
            </View>

            {/* User Info */}
            <Text style={styles.name}>{`${userProfile?.firstName} ${userProfile?.lastName}`}</Text>
            <Text style={styles.bio}>{userProfile?.bio || 'Modista User'}</Text>
            <Text style={styles.username}>{userProfile?.userName}</Text>

            {/* Followers and Following */}
            <View style={styles.stats}>
                <TouchableOpacity onPress={() => {fetchFollowers(); setModalType('followers'); setIsModalVisible(true);}}>
                    <Text style={styles.stat}>{followersList.length || 0} Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {fetchFollowing(); setModalType('following'); setIsModalVisible(true);}}>
                    <Text style={styles.stat}>{followingList.length || 0} Followers</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Tabs */}
            <View style={styles.tabsContainer}>
                {['Outfits', 'Closet', 'Saved'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, selectedTab === tab && styles.activeTab]}
                        onPress={() => setSelectedTab(tab)}
                    >
                        <Text style={styles.tabText}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {renderTabContent()}

            <Modal visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
                <View style={[styles.modalContent, {paddingTop: 40}]}>
                    <Button title="Close" onPress={closeModal} />
                    <FlatList
                        data={modalType === 'followers' ? followersList : followingList}
                        renderItem={({item}) => (
                            <TouchableOpacity onPress={() => openUserProfileModal(item.id, modalType)}>
                                <View style={styles.followerItemContainer}>
                                    <Image source={{uri: item.profilePictureUrl || 'https://via.placeholder.com/40' }} style={styles.followerAvatar}
                                    />
                                    <Text style={styles.followerItemText}>{item.userName || 'Unknown User'}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        nestedScrollEnabled={true}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={
                          <Text style={styles.emptyListText}>
                            {modalType === 'followers' ? 'No followers found' : 'Not following anyone'}
                          </Text>
                        }
                    />
                </View>
            </Modal>
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        padding: 0, // Adjust based on your design
    },
  container: {
      flex: 1,
      backgroundColor: 'white',
      alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 10, // Reduced space between header and user info
  },
  headerImage: {
      width: '100%',
      height: 130,
      resizeMode: 'cover',
  },
  profilePicture: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: 'white',
      marginTop: -40, // Reduced the space between the profile picture and the header
      zIndex: 1,
  },
  name: {
      color: '#333',
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 5, // Reduced space between profile picture and name
  },
  bio: {
      color: '#666',
      fontSize: 16,
      marginVertical: 3, // Adjusted the space between name and bio
      textAlign: 'center',
  },
  username: {
    color: '#666',
    fontSize: 16,
    marginVertical: 3, // Adjusted the space between name and bio
    textAlign: 'center',
    },
  stats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: 20,
      marginVertical: 10,
  },
  stat: {
      color: '#333',
      fontSize: 16,
  },
  tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
  tab: {
      paddingVertical: 10,
      paddingHorizontal: 20,
  },
  activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#333',
  },
  tabText: {
      color: '#333',
      fontSize: 16,
  },
  tabContent: {
      color: '#333',
      fontSize: 18,
      marginTop: 20,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  followerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  followerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  followerItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  closeButton: {
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default UserProfile;
