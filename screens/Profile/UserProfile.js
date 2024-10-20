import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Outfits from './Outfits'; // Import the OutfitsGrid component
import Closet from './Closet'; // Import the Closet component
import Saved from './Saved'; // Import the Closet component
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';

const UserProfile = () => {

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Outfits');

  //Loadin screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="purple" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  //Fetching user's data
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
      setLoading(false);
    };

    fetchUserProfile();
  }, []);


    //Display user data or default values.
    const userData = {
        name: `${userProfile?.firstName} ${userProfile?.lastName}`,
        bio: userProfile?.bio || 'Modista User',
        username: userProfile?.userName,
        followers: userProfile?.followers || 0,
        following: userProfile?.following || 0,
        profilePicture: userProfile?.profilePictureUrl || 'https://via.placeholder.com/150',
        headerImage: 'https://via.placeholder.com/600x200', // Placeholder for header image
    };


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

    return (
        <View style={styles.container}>
            {/* Header Image */}
            <View style={styles.headerContainer}>
                <Image
                    source={{ uri: userData.headerImage }}
                    style={styles.headerImage}
                />
                {/* Profile Picture */}
                <Image
                    source={{ uri: userData.profilePicture }}
                    style={styles.profilePicture}
                />
            </View>

            {/* User Info */}
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.bio}>{userData.bio}</Text>
            <Text style={styles.username}>{userData.username}</Text>

            {/* Followers and Following */}
            <View style={styles.stats}>
                <Text style={styles.stat}>{userData.followers} Followers</Text>
                <Text style={styles.stat}>{userData.following} Following</Text>
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

            {/* Tab Content */}
            {renderTabContent()}
        </View>
    );
};

const styles = StyleSheet.create({
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
});


export default UserProfile;
