import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Button, FlatList } from 'react-native';
import Outfits from './Outfits';
import Closet from './Closet';
import Saved from './Saved';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const UserProfile = ({navigation}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Outfits');
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('followers');

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserProfile = async () => {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
  
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            console.log('No such document!');
          }
        }
        await fetchFollowers();
        await fetchFollowing();
        setLoading(false);
      };
  
      fetchUserProfile();
    }, [])
  );

  const fetchFollowers = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const followers = docSnap.data().followers || [];

        const followersData = await Promise.all(
          followers.map(async (followerId) => {
            const followerRef = doc(db, 'users', followerId);
            const followerSnap = await getDoc(followerRef);
            if (followerSnap.exists()) {
              return { id: followerId, ...followerSnap.data()};
            } else {
              return { id: followerId, userName: 'Unknown User', profilePictureUrl: ''};
            }
          })
        );
        setFollowersList(followersData);
      }
    } catch (error) {
      console.error("Error fetching followers: ", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const following = docSnap.data().following || [];
        
        const followingData = await Promise.all(
          following.map(async (followingId) => {
            const followingRef = doc(db, 'users', followingId);
            const followingSnap = await getDoc(followingRef);
            if (followingSnap.exists()) {
              return { id: followingId, ...followingSnap.data()};
            } else {
              return { id: followingId, userName: 'Unknown User', profilePictureUrl: ''}; 
            }
          })
        );
        setFollowingList(followingData); 
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const openUserProfileModal = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      setSelectedUserProfile({ id: userId, ...docSnap.data()});
      setIsModalVisible(true);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedUserProfile(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="purple" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (selectedTab) {
        case 'Outfits':
            return <Outfits />; 
        case 'Closet':
            return <Closet />;
        case 'Saved':
            return (
                <View>
                    <Saved />
                </View>
            );
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
            source={{ uri: userProfile?.headerImageUrl || 'https://via.placeholder.com/600x200' }}
            style={styles.headerImage}
          />
        <View style={styles.profileWrapper}>
          {/* Profile Picture */}
          <Image
            source={{ uri: userProfile?.profilePictureUrl || 'https://via.placeholder.com/150' }}
            style={styles.profilePicture}
          />

          <View style={styles.profileButtons}>
            {/* Edit Profile Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <MaterialCommunityIcons name="pencil" size={24} color="black" />
            </TouchableOpacity>

            {/* Saved Posts Button */}
            <TouchableOpacity
              style={[styles.iconButton, { marginTop: 10 }]}
              onPress={() => navigation.navigate('SavedPosts')}
            >
              <MaterialCommunityIcons name="bookmark" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        </View>

        {/* User Info */}
        <Text style={styles.name}>{`${userProfile?.firstName} ${userProfile?.lastName}`}</Text>
        <Text style={styles.bio}>{userProfile?.bio || 'Modista User'}</Text>
        <Text style={styles.userName}>{userProfile?.userName}</Text>

        {/* Followers and Following */}
        <View style={styles.stats}>
          <TouchableOpacity onPress={() => {fetchFollowers(); setModalType('followers'); setIsModalVisible(true);}}>
            <Text style={styles.stat}>{followersList.length || 0} Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {fetchFollowing(); setModalType('following'); setIsModalVisible(true);}}>
            <Text style={styles.stat}>{followingList.length || 0} Following</Text>
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
          <View style={styles.modalContent}>
            <View style={StyleSheet.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={StyleSheet.backArrowContainer}>
                <Text style={styles.backArrowText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {modalType === 'followers' ? 'Followers' : 'Following'}
              </Text>
            </View>
              {selectedUserProfile ? (
                <PublicProfile userProfile={selectedUserProfile} />
              ) : (
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
              )}
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const PublicProfile = ({ userProfile}) => (
  <View style={styles.publicProfileContainer}>
    <Image source={{ uri: userProfile?.profilePictureUrl || 'https://via.placeholder.com/150'}} style={styles.publicProfilePicture}
    />
    <Text style={styles.publicName}>{`${userProfile?.firstName} ${userProfile.lastName}`}</Text>
    <Text style={styles.publicUserName}>{userProfile?.userName}</Text>
    <Text style={styles.publicBio}>{userProfile?.bio}</Text>

    <View style={styles.stats}>
      <Text style={styles.stat}>{userProfile?.followers?.length || 0} Followers</Text>
      <Text style={styles.stat}>{userProfile?.following?.length || 0} Following</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scrollViewContainer: {
    padding: 0,
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
      marginBottom: 10,
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
      marginTop: -40,
      zIndex: 1,
  },
  name: {
      color: '#333',
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 5,
  },
  bio: {
      color: '#666',
      fontSize: 16,
      marginVertical: 3,
      textAlign: 'center',
  },
  userName: {
    color: '#666',
    fontSize: 16,
    marginVertical: 3,
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
    paddingTop: 60,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backArrowContainer: {
    marginRight: 10,
    padding: 5,
  },
  backArrowText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 15,
  },
  modalTitle: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#333',
    paddingBottom: 20,
    marginTop: -35,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  publicProfileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddnigTop: 50,
    backgrouondColor: 'white',
  },
  publicProfilePicture: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  publicName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  publicUserName: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  publicBio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  profilePictureContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileButtons: {
    position: 'absolute',
    right: '-30%',
    top: '30%',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  savedPostsButton: {
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    width: '50%',
    alignSelf: 'center'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default UserProfile;
