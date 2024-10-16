import React from 'react';
import { View, Text, SectionList, Image, StyleSheet, TouchableOpacity} from 'react-native';

//Dummy data to test with
const notificationsData = [
  {
    id: '1',
    user: 'jane_doe',
    action: 'liked your photo',
    timestamp: '2h',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    postThumbnail: 'https://picsum.photos/seed/post/100/100',
    timeCategory: 'Today',
  },
  {
    id: '2',
    user: 'john.smith',
    action: 'commented: "Stylish!"',
    timestamp: '3h',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    postThumbnail: 'https://picsum.photos/seed/post/100/100',
    timeCategory: 'Today',
  },
  {
    id: '3',
    user: 'BettyBoo',
    action: 'started following you',
    timestamp: '1d',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    timeCategory: 'This Week',
  },
  {
    id: '4',
    user: 'Alice._.Wonder',
    action: 'liked your photo',
    timestamp: '5d',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    postThumbnail: 'https://picsum.photos/seed/post/100/100',
    timeCategory: 'This Week',
  },
  {
    id: '5',
    user: 'Bob_the_Builder',
    action: 'commented: "Great look!"',
    timestamp: '2w',
    userAvatar:'https://picsum.photos/seed/avatar/50/50',
    postThumbnail: 'https://picsum.photos/seed/post/100/100',
    timeCategory: 'Last 30 days',
  },
  {
    id: '6',
    user: 'HatterMad',
    action: 'started following you',
    timestamp: '5w',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    timeCategory: 'Older',
  },
  {
    id: '7',
    user: 'Rabbit',
    action: 'started following you',
    timestamp: '1w',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    timeCategory: 'This Week',
  },
  {
    id: '8',
    user: 'Turtle',
    action: 'liked your photo',
    timestamp: '3w',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    postThumbnail: 'https://picsum.photos/seed/post/100/100',
    timeCategory: 'Last 30 days',
  },
  {
    id: '9',
    user: 'AnonPanda',
    action: 'started following you',
    timestamp: '6w',
    userAvatar: 'https://picsum.photos/seed/avatar/50/50',
    timeCategory: 'Older',
  },
];

/**
 * This function groups the notification data by the time category (today, this week, etc)
 * by iterating over the notification array and checking if a specific time category already exists
 * in the accumulator ('acc'). If it does, then it adds the notification to the existing category's data
 * and if not, then it creates a new category entry
 */
const groupNotification = (data) => {
  const grouped = data.reduce((acc, item) => {
    const section = acc.find(section => section.title === item.timeCategory);
    if (section) {
      section.data.push(item);
    } else {
      acc.push({title: item.timeCategory, data: [item]});
    }
    return acc;
  }, []);
  return grouped;
};

/**
 * Renders a single notification item using conditional rendering:
 * It shows a "follow back" button only for notifications where the action is " started following you"
 * It displays a thumbnail image of a post if the action involves interaction with a post (like or comment)
 */
const NotificationItem = ({notification}) => (
  <TouchableOpacity style = {styles.notificationContainer}>
    {/* Displays the user's avatar */}
    <Image source={{uri: notification.userAvatar}} style={styles.avatar} />

    {/* Text container for the notification message */}
    <View style={styles.notificationTextContainer}>
      <Text style={styles.notificationText}>
        <Text style={styles.username}>{notification.user}</Text> {notification.action}
        <Text style={styles.timestamp}> {notification.timestamp}</Text>
      </Text>
    </View>

    {/* Displays a "follow back button" only if someone followed you */}
    {notification.action.includes("started following you") && (
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow Back</Text>
      </TouchableOpacity>
    )}

    {/* Displays post thumbnail if it exists */}
    {notification.postThumbnail && (
      <View style={styles.pinContainer}>
        <Image source={{ uri: notification.postThumbnail }} style={styles.pinImage} />
      </View>
    )}
  </TouchableOpacity>
);

//Main screen component that displays a list of grouped notifications
const NotificationScreen = () => {
  //Group the notifications data by time categories ('Today', 'This week', etc)
  const groupedData = groupNotification(notificationsData);

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedData}
        //determines how each notification looks
        renderItem={({item}) => <NotificationItem notification={item} />}
        // determines how the section headers look
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        />
    </View>
  );
};

//customization and layouts for the screen page and its components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    fontFamily: 'Helvetica',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f4f4f4',
    color: '#333',
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