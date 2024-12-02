import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const auth = getAuth();
const db = getFirestore();

const NotificationItem = ({ notification, onFollowBack, currentUserFollowing }) => {
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
    <TouchableOpacity 
      style={styles.notificationContainer}
      onPress={() => {
        if (showPostImage) {
          navigation.navigate('PostDetailsScreen', { postId: notification.postId });
        }
      }}
      disabled={isFollowNotification}
    >
      <Image 
        source={{ uri: notification.senderProfilePic || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
      />
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>
          <Text style={styles.username}>{notification.senderName}</Text>
          {' '}{getNotificationText()}
        </Text>
        <Text style={styles.timestamp}>
          {getRelativeTime(notification.createdAt?.toDate())}
        </Text>
      </View>
      {showPostImage && notification.postImage && (
        <View style={styles.postImageContainer}>
          <Image 
            source={{ uri: notification.postImage }}
            style={styles.postThumbnail}
            resizeMode="cover"
          />
        </View>
      )}
      {isFollowNotification && !alreadyFollowing && (
        <TouchableOpacity 
          style={styles.followButton}
          onPress={() => onFollowBack(notification)}
        >
          <Text style={styles.followButtonText}>Follow Back</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);

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
              key={item.id}
              notification={item} 
              onFollowBack={handleFollowBack}
              currentUserFollowing={currentUserFollowing}
            />
          )}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
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
});

export default NotificationScreen;