<<<<<<< HEAD
import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
=======
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Modal, ScrollView, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
>>>>>>> 58aacb7d73bc1b38233fc9bbe2eb991c36eed8d4

/**
 * SearchScreen Component
 * A screen for browsing and searching for outfit inspirations with advanced recommendations.
 */
export default function SearchScreen() {
<<<<<<< HEAD
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Sample data for outfits with categories and views to simulate popularity
  const outfits = [
    { id: 1, name: 'Autumn Outfit', category: 'Casual', views: 200, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Sweater Weather', category: 'Comfy', views: 500, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Chic Skirts', category: 'Classy', views: 150, image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Winter Coat', category: 'Warm', views: 300, image: 'https://via.placeholder.com/150' },
  ];

  // Mock data for recent searches and collaborative filtering
  const recentSearches = ['Casual', 'Warm', 'Sweater'];
  const collaborativeData = {
    'Casual': ['Sweater Weather', 'Winter Coat'],  // Users who searched 'Casual' also liked these
    'Warm': ['Autumn Outfit', 'Chic Skirts']
  };

  /**
   * Filters and recommends outfits based on the search query using multiple recommendation layers.
   * @param {string} text - The current input in the search bar.
   */
  const handleSearch = (text) => {
    setQuery(text);
    let filteredResults = [];
=======
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [results, setResults] = useState([]);
  const [outfits, setOutfits] = useState([
    // Mock data for outfits
    { id: 1, name: 'Autumn Outfit', category: 'Casual', views: 200, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Sweater Weather', category: 'Comfy', views: 500, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Chic Skirts', category: 'Classy', views: 150, image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Winter Coat', category: 'Warm', views: 300, image: 'https://via.placeholder.com/150' },
  ]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);

  // Add this useEffect to fetch recommendations when component mounts
  useEffect(() => {
    fetchRecommendedPosts();
  }, []);

  const fetchRecommendedPosts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get user's interests and recent activity
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Get posts from the main posts collection
      const postsRef = collection(db, 'posts');
      const postsSnapshot = await getDocs(postsRef);
      const allPosts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Score and sort posts based on user preferences
      const scoredPosts = allPosts.map(post => ({
        ...post,
        score: calculateRecommendationScore(post, userData)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Get top 10 recommendations

      setRecommendedPosts(scoredPosts);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const calculateRecommendationScore = (post, userData) => {
    let score = 0;

    // Base popularity score
    score += (post.likes?.length || 0) * 0.5;
    score += (post.saves?.length || 0) * 1;
    score += (post.views || 0) * 0.1;

    // Recency boost (newer posts get higher score)
    const daysSincePosted = (Date.now() - post.createdAt?.toDate()) / (1000 * 60 * 60 * 24);
    if (daysSincePosted < 7) {
      score += (7 - daysSincePosted);
    }

    // If user follows the post creator
    if (userData.following?.includes(post.userId)) {
      score += 10;
    }

    // If post matches user's style preferences
    if (userData.stylePreferences?.some(style => post.tags?.includes(style))) {
      score += 5;
    }

    return score;
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    setIsSearching(true);

    try {
        // Search for users first
        const users = await searchUsers(text);
        setUserResults(users);
        console.log('User results:', users); // Debug log

        // Then search for outfits
        const outfits = await searchOutfits(text);
        setResults(outfits);

    } catch (error) {
        console.error('Error in search:', error);
    } finally {
        setIsSearching(false);
    }
  };

  const searchUsers = async (searchText) => {
    if (searchText.trim() === '') return [];

    try {
        const usersCollection = collection(db, 'users');
        const snapshot = await getDocs(usersCollection);
        
        // Filter users based on starting characters
        const users = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }))
            .filter(user => {
                const searchLower = searchText.toLowerCase();
                const userName = user.userName?.toLowerCase() || '';
                const firstName = user.firstName?.toLowerCase() || '';
                const lastName = user.lastName?.toLowerCase() || '';
                
                // Check if any field starts with the search text
                return userName.startsWith(searchLower) ||
                       firstName.startsWith(searchLower) ||
                       lastName.startsWith(searchLower);
            });

        return users;

    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
  };

  const searchOutfits = async (searchText) => {
    if (searchText.trim() === '') return [];

    try {
        const postsRef = collection(db, 'posts');
        const querySnapshot = await getDocs(postsRef);
        const posts = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(post => {
                const searchLower = searchText.toLowerCase();
                const caption = post.caption?.toLowerCase() || '';
                const description = post.description?.toLowerCase() || '';
                const tags = post.tags?.map(tag => tag.toLowerCase()) || [];
                
                // Check if caption or description starts with the search text
                return caption.startsWith(searchLower) || 
                       description.startsWith(searchLower) ||
                       tags.some(tag => tag.startsWith(searchLower));
            });

        console.log('Found posts:', posts); // Debug log
        return posts;
    } catch (error) {
        console.error('Error searching posts:', error);
        return [];
    }
  };

  const calculateOutfitScore = (outfit, query) => {
    let score = 0;
    const searchTerms = query.toLowerCase().split(' ');

    // Base relevance scoring
    searchTerms.forEach(term => {
      // Match against name
      if (outfit.name?.toLowerCase().includes(term)) score += 10;
      
      // Match against category
      if (outfit.category?.toLowerCase().includes(term)) score += 8;
      
      // Match against description
      if (outfit.description?.toLowerCase().includes(term)) score += 5;
      
      // Match against tags
      if (outfit.tags?.some(tag => tag.toLowerCase().includes(term))) score += 7;
    });

    // Popularity boost
    score += (outfit.views || 0) / 100;
    score += (outfit.likes || 0) / 50;
    score += (outfit.saves || 0) / 25;

    // Recency boost (if created within last 7 days)
    const daysSinceCreation = (Date.now() - outfit.createdAt?.toDate()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) {
      score += (7 - daysSinceCreation) / 2;
    }

    // Collaborative filtering boost
    if (recentSearches.includes(outfit.category)) {
      score += 5;
    }

    return score;
  };

  const getPopularOutfits = async () => {
    const outfitsRef = collection(db, 'outfits');
    const querySnapshot = await getDocs(outfitsRef);
    const allOutfits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by popularity score
    return allOutfits
      .map(outfit => ({
        ...outfit,
        popularityScore: 
          (outfit.views || 0) / 100 + 
          (outfit.likes || 0) / 50 + 
          (outfit.saves || 0) / 25
      }))
      .sort((a, b) => b.popularityScore - a.popularityScore);
  };

  const dataToDisplay = results.length > 0 ? results : outfits;

  const handleFollowToggle = async (userId) => {
    try {
      console.log('Starting follow toggle for userId:', userId);

      const currentUserRef = doc(db, 'users', auth.currentUser.uid);
      const targetUserRef = doc(db, 'users', userId);
      
      const currentUserSnap = await getDoc(currentUserRef);
      const targetUserSnap = await getDoc(targetUserRef);
>>>>>>> 58aacb7d73bc1b38233fc9bbe2eb991c36eed8d4

    if (text) {
      // Exact matches by name or category
      filteredResults = outfits.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) || 
        item.category.toLowerCase().includes(text.toLowerCase())
      );

<<<<<<< HEAD
      // If no exact matches, recommend items based on collaborative filtering
      if (filteredResults.length === 0) {
        const relatedItems = collaborativeData[text];
        if (relatedItems) {
          filteredResults = outfits.filter((item) =>
            relatedItems.includes(item.name)
          );
        }
      }

      // Apply a weighted scoring system to rank results by popularity and relevance
      filteredResults = filteredResults.map((item) => ({
        ...item,
        score: (item.views / 100) + (recentSearches.includes(item.category) ? 2 : 0)
      }));
      filteredResults.sort((a, b) => b.score - a.score); // Sort by highest score
    } else {
      // Show popular items if no search query
      filteredResults = outfits.sort((a, b) => b.views - a.views);
=======
        console.log('Current user data:', currentUserData);
        console.log('Target user data:', targetUserData);

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

          try {
            const notificationsRef = collection(db, 'notifications');
            const notificationData = {
              type: 'follow',
              senderId: auth.currentUser.uid,
              recipientId: userId,
              senderName: currentUserData.userName || 'User',
              senderProfilePic: currentUserData.profilePictureUrl || 'https://via.placeholder.com/40',
              createdAt: serverTimestamp()
            };

            console.log('Creating notification with data:', notificationData);

            const notificationDoc = await addDoc(notificationsRef, notificationData);
            console.log('Notification created with ID:', notificationDoc.id);

          } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
          }

          setSelectedUserProfile(prevState => ({
            ...prevState,
            followers: updatedFollowers,
          }));
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('Error in handleFollowToggle:', error);
      Alert.alert('Error', 'Failed to update follow status');
>>>>>>> 58aacb7d73bc1b38233fc9bbe2eb991c36eed8d4
    }

    setResults(filteredResults);
  };

  // Display either search results or popular items as recommendations
  const dataToDisplay = results.length > 0 ? results : outfits;

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

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={query}
          onChangeText={handleSearch}
        />
        <FontAwesome name="sliders" size={24} color="#888" style={styles.icon} />
      </View>

<<<<<<< HEAD
      {/* Tag Section: Displays clickable tags for filtering */}
      <View style={styles.tagContainer}>
        {['Casual', 'Classy', 'Comfy', 'Warm'].map((tag) => (
          <TouchableOpacity key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
=======
      {isFocused || searchQuery ? (
        results.length > 0 || userResults.length > 0 ? (
          <ScrollView>
            {userResults.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Users</Text>
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
            )}
            
            {results.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Posts</Text>
                    <View style={styles.grid}>
                        {results.map((post) => (
                            <TouchableOpacity 
                                key={post.id} 
                                style={styles.postCard}
                                onPress={() => {
                                    navigation.getParent()?.navigate('PostDetailsScreen', { postId: post.id });
                                }}
                            >
                                <Image 
                                    source={{ uri: post.itemImage || post.imageUrl || 'https://via.placeholder.com/150' }}
                                    style={styles.postImage} 
                                />
                                <View style={styles.postInfo}>
                                    <Text style={styles.postTitle} numberOfLines={1}>
                                        {post.caption || 'Outfit Post'}
                                    </Text>
                                    <Text style={styles.postStats}>
                                        {post.likes?.length || 0} likes • {post.saves?.length || 0} saves
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )
      ) : (
        <ScrollView>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <View style={styles.grid}>
            {recommendedPosts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.postCard}
                onPress={() => {
                  console.log('Navigating to post:', post.id);
                  navigation.getParent()?.navigate('PostDetailsScreen', { postId: post.id });
                }}
              >
                <Image 
                  source={{ uri: post.itemImage || post.imageUrl || 'https://via.placeholder.com/150' }}
                  style={styles.postImage} 
                />
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {post.caption || 'Outfit Post'}
                  </Text>
                  <Text style={styles.postStats}>
                    {post.likes?.length || 0} likes • {post.saves?.length || 0} saves
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.tagContainer}>
            {['Casual', 'Formal', 'Streetwear', 'Vintage'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => handleSearch(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backArrowContainer}>
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
          
          {selectedUserProfile && (
            <View style={styles.publicProfileContainer}>
              <View style={styles.publicProfilePictureWrapper}>
                <Image 
                  source={{ uri: selectedUserProfile?.profilePictureUrl || 'https://via.placeholder.com/150'}} 
                  style={styles.publicProfilePicture}
                />
              </View>
              <Image source={{uri: selectedUserProfile?.headerImageUrl || 'https://via.placeholder.com/600x200'}} style={styles.publicHeaderImage}
              />
              <Text style={styles.publicName}>
                {`${selectedUserProfile?.firstName} ${selectedUserProfile?.lastName}`}
              </Text>
              <Text style={styles.publicUserName}>{selectedUserProfile?.userName}</Text>
              <Text style={styles.publicBio}>{selectedUserProfile?.bio}</Text>
>>>>>>> 58aacb7d73bc1b38233fc9bbe2eb991c36eed8d4

      {/* Section Title */}
      <Text style={styles.sectionTitle}>{query ? "Search Results" : "Popular Now"}</Text>

<<<<<<< HEAD
      {/* Grid Layout for Outfits */}
      <View style={styles.grid}>
        {dataToDisplay.map((outfit) => (
          <View key={outfit.id} style={styles.outfitCard}>
            <Image source={{ uri: outfit.image }} style={styles.outfitImage} />
            <Text style={styles.outfitName}>{outfit.name}</Text>
          </View>
        ))}
      </View>
=======
              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]} 
                onPress={() => handleFollowToggle(selectedUserProfile.id)}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>

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
          )}
        </View>
      </Modal>
>>>>>>> 58aacb7d73bc1b38233fc9bbe2eb991c36eed8d4
    </View>
  );
}

// Styles for the SearchScreen component
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
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 16,
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
<<<<<<< HEAD
});
=======
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 8,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  publicProfilePictureWrapper: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 585,
  },
  publicHeaderImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
    position: 'relative',
    top: -40,
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
  publicName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Helvetica',
    marginTop: 20,
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
});
>>>>>>> 58aacb7d73bc1b38233fc9bbe2eb991c36eed8d4
