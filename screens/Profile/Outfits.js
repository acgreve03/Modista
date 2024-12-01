import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Outfits = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const nav = useNavigation();

    const itemWidth = Dimensions.get('window').width / 2 - 15;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchPosts(currentUser.uid);
            } else {
                navigation.navigate('Login');
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchPosts = async (uid) => {
        try {
            const postsRef = collection(db, 'posts');
            const q = query(postsRef, where('userId', '==', uid));
            const querySnapshot = await getDocs(q);

            const fetchedPosts = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setPosts(fetchedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter((post) =>
        (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.caption && post.caption.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handlePostDeleted = () => {
        if (user) {
            fetchPosts(user.uid);
        }
    };

    const renderPin = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.outfitContainer, { width: itemWidth, height: itemWidth }]}
                onPress={() =>
                    nav.navigate('PostDetailsScreen', {
                        postId: item.id,
                        onPostDeleted: handlePostDeleted,
                    })
                }
            >
                <Image source={{ uri: item.itemImage }} style={styles.image} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search outfits..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            {loading ? (
                <Text>Loading...</Text>
            ) : (
                <FlatList
                    data={filteredPosts}
                    renderItem={renderPin}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text>No outfits found.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    searchBar: { flex: 1, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 10 },
    iconButton: { marginLeft: 10 },
    outfitContainer: {
        margin: 5,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%', 
        resizeMode: 'contain',
    },
    caption: {
        textAlign: 'center',
        marginTop: 5,
        fontSize: 12,
        position: 'absolute',
        bottom: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        paddingHorizontal: 5,
        borderRadius: 5,
    },
});

export default Outfits;