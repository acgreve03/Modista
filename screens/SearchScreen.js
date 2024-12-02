import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setUserResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersQuery = query(
        usersCollection,
        where('userName', '>=', text),
        where('userName', '<=', text + '\uf8ff')
      );
      const snapshot = await getDocs(usersQuery);

      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserResults(results);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

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
          const updatedFollowing = [...currentFollowing, userId];
          const updatedFollowers = [...targetFollowers, auth.currentUser.uid];
          
          await updateDoc(currentUserRef, { following: updatedFollowing});
          await updateDoc(targetUserRef, { followers: updatedFollowers});

          setSelectedUserProfile(prevState => ({
            ...prevState,
            followers: updatedFollowers,
          }));
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Error updating follow state: ", error);
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !searchQuery && setIsFocused(false)}
        />
        <FontAwesome name="sliders" size={24} color="#888" style={styles.icon} />
      </View>

      {isFocused || searchQuery ? (
        isSearching ? (
          <Text style={styles.loadingText}>Searching...</Text>
        ) : userResults.length > 0 ? (
          <View>
            {userResults.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => openUserProfileModal(user.id)}
              >
                <Image
                  source={{ uri: user.profilePictureUrl || 'https://via.placeholder.com/150' }}
                  style={styles.userAvatar}
                />
                <Text style={styles.userName}>{user.userName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noResultsText}>No results found</Text>
        )
      ) : (
        <>
          <View style={styles.tagContainer}>
            {['Casual', 'Classy', 'Comfy', 'Formal', 'Cozy', 'Warm', 'Spring', 'Fall'].map((tag) => (
              <TouchableOpacity key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionTitle}>More Inspo</Text>
          <View style={styles.grid}>
            {[
              { id: 1, name: 'Autumn Outfit', image: 'https://via.placeholder.com/150' },
              { id: 2, name: 'Sweater Weather', image: 'https://via.placeholder.com/150' },
              { id: 3, name: 'Chic Skirts', image: 'https://via.placeholder.com/150' },
            ].map((outfit) => (
              <View key={outfit.id} style={styles.outfitCard}>
                <Image source={{ uri: outfit.image }} style={styles.outfitImage} />
                <Text style={styles.outfitName}>{outfit.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backArrowContainer}>
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
          
          {selectedUserProfile && (
            <View style={styles.publicProfileContainer}>
              <Image 
                source={{ uri: selectedUserProfile?.profilePictureUrl || 'https://via.placeholder.com/150'}} 
                style={styles.publicProfilePicture}
              />
              <Text style={styles.publicName}>
                {`${selectedUserProfile?.firstName} ${selectedUserProfile?.lastName}`}
              </Text>
              <Text style={styles.publicUserName}>{selectedUserProfile?.userName}</Text>
              <Text style={styles.publicBio}>{selectedUserProfile?.bio}</Text>

              <View style={styles.stats}>
                <Text style={styles.stat}>
                  {selectedUserProfile?.followers?.length || 0} Followers
                </Text>
                <Text style={styles.stat}>
                  {selectedUserProfile?.following?.length || 0} Following
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]} 
                onPress={() => handleFollowToggle(selectedUserProfile.id)}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  icon: {
    marginLeft: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  outfitCard: {
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
  },
  outfitImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  outfitName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 8,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
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
  publicProfileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    backgroundColor: 'white',
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
    fontFamily: 'Helvetica',
  },
  publicUserName: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Helvetica',
  },
  publicBio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 0,
    paddingHorizontal: 20,
    fontFamily: 'Helvetica',
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
    fontFamily: 'Helvetica',
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
  followButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center'
  },
});