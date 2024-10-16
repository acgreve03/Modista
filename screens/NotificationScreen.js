import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity} from 'react-native';

//Dummy data to test with
const notificationsData = [
  {
    id: '1',
    user: 'jane_doe',
    action: 'liked your photo',
    timestamp: '2h',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    postThumbnail: 'https://picsum.photos/seed/post/100/100',
  },
  {
    id: '2',
    user: 'john.smith',
    action: 'commented: "Stylish!"',
    timestamp: '3h',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    postThumbnail: 'https://picsum.photos/seed/post/100/100'
  },
  {
    id: '3',
    user: 'BettyBoo',
    action: 'started following you',
    timestamp: '1d',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
  },
];

const NotificationItem = ({notification}) => (
  <TouchableOpacity style = {styles.notificationContainer}>
    <Image source={{uri: notification.userAvatar}} style={styles.avatar} />
    <View style={styles.notificationTextContainer}>
      <Text style={styles.notificationText}>
        <Text style={styles.username}>{notification.user}</Text> {notification.action}
        <Text style={styles.timestamp}> {notification.timestamp}</Text>
      </Text>
    </View>

    {notification.action.includes("started following you") && (
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow Back</Text>
      </TouchableOpacity>
    )}

    {notification.postThumbnail && (
      <View style={styles.pinContainer}>
        <Image source={{ uri: notification.postThumbnail }} style={styles.pinImage} />
      </View>
    )}
  </TouchableOpacity>
);

const NotificationScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={notificationsData}
        renderItem={({item}) => <NotificationItem notification={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  notificationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    fontFamily: 'Helvetica',
    fontSize: 16,
    color: '#333',
  },
  username: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
  timestamp: {
    fontFamily: 'Helvetica',
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    marginLeft: 5,
  },
  pinContainer: {
    width: 50,
    height: 50,
    borderRadius: 5,
    overflow: 'hidden',
    marginLeft: 10,
  },
  pinImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  followButton: {
    backgroundColor: 'blue',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  followButtonText: {
    color: 'white',
    fontFamily: 'Helvetica',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NotificationScreen;