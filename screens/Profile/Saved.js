import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Dimensions
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const Saved = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const itemWidth = Dimensions.get('window').width / 2 - 15;

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    const fetchSavedPosts = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const postsRef = collection(db, 'posts');
            const q = query(postsRef, where('saves', 'array-contains', user.uid));
            const querySnapshot = await getDocs(q);

            const posts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSavedPosts(posts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching saved outfits:', error);
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.itemContainer, { width: itemWidth }]}
            onPress={() => navigation.navigate('PostDetailsScreen', { 
                postId: item.id,
                onPostUnsaved: fetchSavedPosts
            })}
        >
            <Image 
                source={{ uri: item.itemImage }} 
                style={styles.image} 
            />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="purple" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saved Posts</Text>

            {savedPosts.length > 0 ? (
                <FlatList
                    data={savedPosts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    columnWrapperStyle={styles.columnWrapper}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No saved posts found.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    itemContainer: {
        margin: 5,
        borderRadius: 8,
        overflow: 'hidden',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    outfitContainer: {
        margin: 8,
        width: 100, // Adjust size as needed
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        borderRadius: 1
    },
    outfitImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
    },
    
    
    // outfitContainer: {
    //     width: '45%', // Adjust container size for grid layout
    //     aspectRatio: 0.85, // Change aspect ratio for Pinterest-style pins (e.g., 4:5 or 3:4)
    //     marginBottom: 15, // Increased margin for better separation
    //     borderRadius: 10,
    //     borderWidth: 1, // Thin border around the container
    //     borderColor: '#d3d3d3', // Light grey border for a subtle effect
    //     backgroundColor: 'white', // Ensure the container background is white
    //     padding: 10, // Padding inside the container
    //     elevation: 2, // Add subtle shadow for a more lifted effect
 
    // },
    columnWrapper: {
        justifyContent: 'space-between',
      },
    outfitImage: {
        width: '100%', // Make the image take up the full width of the container
        height: '90%', // Adjust the height to match the container's height
        resizeMode: 'contain', // Ensure the image covers the space without distortion
        
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: 'gray',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'gray'
    },
    gridContainer: {
        padding: 10,
    }
});

export default Saved;