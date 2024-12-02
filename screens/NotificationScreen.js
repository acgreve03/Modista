import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const auth = getAuth();
const db = getFirestore();

const NotificationItem = ({ notification, onFollowBack, currentUserFollowing, onUserPress }) => {
  const navigation = useNavigation();
  const isFollowNotification = notification.type === 'follow';
  const alreadyFollowing = currentUserFollowing.includes(notification.senderId);
  const showPostImage = notification.type === 'like' || notification.type === 'comment';

  console.log('Rendering notification:', notification); // Debug log

  const getNotificationText = () => {
    switch (notification.type) {
      case 'follow':
        return 'started following you';
      case 'like':
        return 'liked your post';
      case 'comment':
        return `commented: "${notification.commentText}"`;
      default:
        return '';
    }
  };

  return (
    <View style={styles.notificationContainer}>
      <TouchableOpacity onPress={() => onUserPress(notification.senderId)}>
        <Image 
          source={{ uri: notification.senderProfilePic || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>
          <Text 
            style={styles.username} 
            onPress={() => onUserPress(notification.senderId)}
          >
            {notification.senderName}
          </Text>
          {' '}{getNotificationText(notification)}
        </Text>
        <Text style={styles.timestamp}>
          {getRelativeTime(notification.createdAt?.toDate())}
        </Text>
      </View>

      {showPostImage && notification.postImage && (
        <TouchableOpacity 
          style={styles.postImageContainer}
          onPress={() => navigation.navigate('PostDetailsScreen', { postId: notification.postId })}
        >
          <Image 
            source={{ uri: notification.postImage }}
            style={styles.postThumbnail}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {isFollowNotification && !alreadyFollowing && (
        <TouchableOpacity 
          style={styles.followButton}
          onPress={() => onFollowBack(notification)}
        >
          <Text style={styles.followButtonText}>Follow Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchCurrentUserFollowing = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setCurrentUserFollowing(userSnap.data().following || []);
      }
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  };

  const fetchNotifications = () => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsList);
      setLoading(false);
    });
  };

  useEffect(() => {
    const unsubscribe = fetchNotifications();
    fetchCurrentUserFollowing();
    return () => unsubscribe && unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCurrentUserFollowing();
    setRefreshing(false);
  };

  const handleFollowBack = async (notification) => {
    try {
      console.log('Starting follow back process...'); // Debug log

      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      const targetUserRef = doc(db, 'users', notification.senderId);
      
      // Get both users' data
      const [currentUserSnap, targetUserSnap] = await Promise.all([
        getDoc(currentUserRef),
        getDoc(targetUserRef)
      ]);

      console.log('Current user data:', currentUserSnap.data()); // Debug log
      console.log('Target user data:', targetUserSnap.data()); // Debug log

      if (currentUserSnap.exists() && targetUserSnap.exists()) {
        const currentUserData = currentUserSnap.data();
        const targetUserData = targetUserSnap.data();

        // Get current following/followers arrays or empty arrays if they don't exist
        const currentFollowing = currentUserData.following || [];
        const targetFollowers = targetUserData.followers || [];

        // Check if already following
        if (currentFollowing.includes(notification.senderId)) {
          console.log('Already following this user');
          return;
        }

        // Update following/followers lists
        const updatedFollowing = [...currentFollowing, notification.senderId];
        const updatedFollowers = [...targetFollowers, auth.currentUser.uid];

        console.log('Updating following/followers lists...'); // Debug log

        // Update both users' documents
        await Promise.all([
          updateDoc(currentUserRef, { following: updatedFollowing }),
          updateDoc(targetUserRef, { followers: updatedFollowers })
        ]);

        // Create notification with correct user data
        const notificationData = {
          type: 'follow',
          senderId: auth.currentUser.uid,
          recipientId: notification.senderId,
          senderName: currentUserData.userName, // Use the correct field from your user data
          senderProfilePic: currentUserData.profilePictureUrl, // Use the correct field from your user data
          createdAt: serverTimestamp()
        };

        console.log('Creating notification with data:', notificationData); // Debug log

        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, notificationData);

        // Update local state
        setCurrentUserFollowing(prevFollowing => [...prevFollowing, notification.senderId]);

        console.log('Follow back process completed successfully'); // Debug log
      }
    } catch (error) {
      console.error('Error in handleFollowBack:', error);
      Alert.alert('Error', 'Failed to follow user. Please try again.');
    }
  };

  const handleUserPress = async (userId) => {
    console.log('Opening profile for user:', userId); // Debug log
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('Fetched user data:', userData); // Debug log
        setSelectedUserProfile({ id: userId, ...userData });
        setIsFollowing(currentUserFollowing.includes(userId));
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      const targetUserRef = doc(db, 'users', userId);
      
      const [currentUserSnap, targetUserSnap] = await Promise.all([
        getDoc(currentUserRef),
        getDoc(targetUserRef)
      ]);

      if (currentUserSnap.exists() && targetUserSnap.exists()) {
        const currentUserData = currentUserSnap.data();
        const targetUserData = targetUserSnap.data();
        const currentFollowing = currentUserData.following || [];
        const targetFollowers = targetUserData.followers || [];

        if (currentFollowing.includes(userId)) {
          // Unfollow logic
          const updatedFollowing = currentFollowing.filter(id => id !== userId);
          const updatedFollowers = targetFollowers.filter(id => id !== auth.currentUser.uid);

          await Promise.all([
            updateDoc(currentUserRef, { following: updatedFollowing }),
            updateDoc(targetUserRef, { followers: updatedFollowers })
          ]);

          setCurrentUserFollowing(updatedFollowing);
          setIsFollowing(false);
        } else {
          // Follow logic
          const updatedFollowing = [...currentFollowing, userId];
          const updatedFollowers = [...targetFollowers, auth.currentUser.uid];

          await Promise.all([
            updateDoc(currentUserRef, { following: updatedFollowing }),
            updateDoc(targetUserRef, { followers: updatedFollowers })
          ]);

          // Create follow notification
          const notificationData = {
            type: 'follow',
            senderId: auth.currentUser.uid,
            recipientId: userId,
            senderName: currentUserData.userName,
            senderProfilePic: currentUserData.profilePictureUrl,
            createdAt: serverTimestamp()
          };

          await addDoc(collection(db, 'notifications'), notificationData);
          setCurrentUserFollowing(updatedFollowing);
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('Error in handleFollowToggle:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({item}) => (
            <NotificationItem 
              notification={item}
              onFollowBack={handleFollowBack}
              currentUserFollowing={currentUserFollowing}
              onUserPress={handleUserPress}
            />
          )}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {/* User Profile Modal */}
      <Modal 
        visible={isModalVisible} 
        animationType="slide" 
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            onPress={() => setIsModalVisible(false)} 
            style={styles.backArrowContainer}
          >
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
          
          {selectedUserProfile && (
            <ScrollView contentContainerStyle={styles.publicProfileContainer}>
              <Image 
                source={{ uri: selectedUserProfile.profilePictureUrl || 'https://via.placeholder.com/150' }}
                style={styles.publicProfilePicture}
              />
              <Text style={styles.publicName}>
                {selectedUserProfile.firstName} {selectedUserProfile.lastName}
              </Text>
              <Text style={styles.publicUserName}>{selectedUserProfile.userName}</Text>
              <Text style={styles.publicBio}>{selectedUserProfile.bio}</Text>

              <View style={styles.stats}>
                <Text style={styles.stat}>
                  {selectedUserProfile.followers?.length || 0} Followers
                </Text>
                <Text style={styles.stat}>
                  {selectedUserProfile.following?.length || 0} Following
                </Text>
              </View>

              {selectedUserProfile.id !== auth.currentUser?.uid && (
                <TouchableOpacity 
                  style={[styles.followButton, isFollowing && styles.followingButton]}
                  onPress={() => handleFollowToggle(selectedUserProfile.id)}
                >
                  <Text style={styles.followButtonText}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);
  
  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
  return `${Math.floor(diffSeconds / 86400)}d`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  username: {
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'none', // Remove default underline
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  postImageContainer: {
    width: 50,
    height: 50,
    marginLeft: 'auto',
    marginRight: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  postThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  backArrowContainer: {
    padding: 10,
  },
  backArrowText: {
    fontSize: 24,
    color: '#333',
  },
  publicProfileContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  publicProfilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  publicName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  publicUserName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  publicBio: {
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  stat: {
    marginHorizontal: 20,
  },
  followButton: {
    backgroundColor: 'purple',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#666',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default NotificationScreen;