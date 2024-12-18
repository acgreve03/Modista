import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Modal, FlatList, Dimensions } from 'react-native';
import Outfits from './Outfits'; // Import the OutfitsGrid component
import Closet from './Closet'; // Import the Closet component
import Saved from './Saved'; // Import the Closet component
import { doc, getDoc, onSnapshot, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';

/**
 * User Profile component
 * Displays the user's profile, including their personal information (bio, name, username), their stats(followers and following), and posts.
 * Also contains navigation to different tabs (outfits, closet, saved) and the ability to view followers or followed user's profiles.
 */
const UserProfile = ({navigation}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Posts');
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('followers');
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);

  //Fetch and set the current user's profile data
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

  //Fetch followers' data for the current user from Firestore and updates the followers list state
  const fetchFollowers = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const followers = docSnap.data().followers || [];

        //Fetch entire profile information for each follower
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

  //Fetches the users that the current user is following from Firestore and updates the following list state
  const fetchFollowing = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const following = docSnap.data().following || [];
        
        //Fetch entire profile information for each followed user
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

  //Toggle follow/unfollow for a specific user depending on if the current user follows them already and updates Firestore data for both users
  const handleFollowToggle = async (userId) => {
    try {
      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      const targetUserRef = doc(db, 'users', userId);
      
      const currentUserSnap = await getDoc(currentUserRef);
      const targetUserSnap = await getDoc(targetUserRef);

      if (currentUserSnap.exists() && targetUserSnap.exists()) {
        const currentUserData = currentUserSnap.data();
        const targetUserData = targetUserSnap.data();

        const currentFollowing = currentUserData.following || [];
        const targetFollowers = targetUserData.followers || [];

        if (currentFollowing.includes(userId)) {
          // Unfollow logic
          const updatedFollowing = currentFollowing.filter(id => id !== userId);
          const updatedFollowers = targetFollowers.filter(id => id !== auth.currentUser.uid);
          
          await updateDoc(currentUserRef, { following: updatedFollowing});
          await updateDoc(targetUserRef, { followers: updatedFollowers});
          
          setSelectedUserProfile(prevState => ({
            ...prevState,
            followers: updatedFollowers,
          }));
          setIsFollowing(false);
        } else {
          // Follow logic
          const updatedFollowing = [...currentFollowing, userId];
          const updatedFollowers = [...targetFollowers, auth.currentUser.uid];
          
          await updateDoc(currentUserRef, { following: updatedFollowing});
          await updateDoc(targetUserRef, { followers: updatedFollowers});
          
          // Create notification when following
          await addDoc(collection(db, 'notifications'), {
            type: 'follow',
            senderId: auth.currentUser.uid,
            recipientId: userId,
            senderName: currentUserData.userName || auth.currentUser.displayName || 'User',
            senderProfilePic: currentUserData.profilePictureUrl || auth.currentUser.photoURL || 'https://via.placeholder.com/40',
            createdAt: serverTimestamp()
          });
          
          setSelectedUserProfile(prevState => ({
            ...prevState,
            followers: updatedFollowers,
          }));
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  //Handle log out and direct user back to welcome screen
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  //Real-time listener for following and followers
  useEffect(() => {
    const unsubscribeFollowers = onSnapshot(
      doc(db, 'users', auth.currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const followers = docSnap.data().followers || [];
          setFollowersList(followers);
        }
      },
      (error) => console.error("Error fetching real-time followers: ", error)
    );

    const unsubscribeFollowing = onSnapshot (
      doc(db, 'users', auth.currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const following = docSnap.data().following || [];
          setFollowingList(following);
        }
      },
      (error) => console.error("Error fetching real-time fllowing: ", error)
    );

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, []);

  //Open selected user's profile
  const openUserProfileModal = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const targetUserData = docSnap.data();
      const isUserFollowing = targetUserData.followers?.includes(auth.currentUser.uid);
      setIsFollowing(isUserFollowing);
      setSelectedUserProfile({ id: userId, ...docSnap.data()});
      setIsModalVisible(true);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedUserProfile(null);
  };

  //Fetch posts for the selected user
  const fetchUserPosts = async (userId) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPosts(postsData);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
  };

  useEffect(() => {
    if (selectedUserProfile) {
      fetchUserPosts(selectedUserProfile.id);
    }
  }, [selectedUserProfile]);

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
        case 'Posts':
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

  /**
   * This is the public profile component that handles rendering a selected user's public profile containing all of their personal information
   * following and follower stats, and posts that they've made and displaying it in a modal.
   */
  const PublicProfile = ({ userProfile, isFollowing, handleFollowToggle}) => (
    <View style={styles.publicProfileContainer}>
      <View style={styles.publicProfilePictureWrapper}>
        <Image source={{ uri: userProfile?.profilePictureUrl || 'https://via.placeholder.com/150'}} style={styles.publicProfilePicture}
        />
      </View>
      <Image source={{ uri: userProfile?.headerImageUrl || 'https://via.placeholder.com/600x200'}} style={styles.publicHeaderImage}
      />
      <Text style={styles.publicName}>{`${userProfile?.firstName} ${userProfile.lastName}`}</Text>
      <Text style={styles.publicUserName}>{userProfile?.userName}</Text>
      <Text style={styles.publicBio}>{userProfile?.bio}</Text>
  
      <View style={styles.stats}>
        <Text style={styles.stat}>{userProfile?.followers?.length || 0} Followers</Text>
        <Text style={styles.stat}>{userProfile?.following?.length || 0} Following</Text>
      </View>
  
      <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={() => handleFollowToggle(userProfile.id)}>
        <Text style={styles.followButtonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
      </TouchableOpacity>
  
      {/* posts grid */}
      <View style={styles.postsContainer}>
        <Text style={styles.postsTitle}>Posts</Text>
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
                setSelectedUserProfile(null);
                setTimeout(() => {
                  navigation.navigate('PostDetailsScreen', {
                    postId: item.id, userId: item.userId
                  });
                }, 100);
              }}
            >
              <Image source={{ uri: item.itemImage }} style={styles.postImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{
            justifyContent: 'flex-start',
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
  
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
              style={styles.editButton}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <MaterialCommunityIcons name="pencil" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout-variant" size={24} color="black" />
        </TouchableOpacity>

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
          {['Posts', 'Closet', 'Saved'].map((tab) => (
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

        {/* Following and followers list */}
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
                <PublicProfile 
                userProfile={selectedUserProfile}
                isFollowing={isFollowing}
                handleFollowToggle={handleFollowToggle} />
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
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
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
  publicHeaderImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
    position: 'relative',
  },
  publicProfilePicture: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'white',
    marginBottom: 15,
    zIndex: 1,
  },
  publicProfilePictureWrapper: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 585,
  },
  publicName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 60,
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
  followButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center'
  },
  profileButtons: {
    position: 'absolute',
    right: 20,
    top: -30,
  },
  editButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  postsContainer: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'flex-start',
    margin: 5,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  postImage: {
    borderRadius: 10,
    marginBottom: 10,
    width: 140,
    height: 140,
    resizeMode: 'cover',
    alignSelf: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  logoutButton: {
    position: 'absolute',
    right: 370, 
    top: 105,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  followButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  followingButton: {
    backgroundColor: '#6c757d',
  },
});

export default UserProfile;