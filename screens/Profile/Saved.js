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
            <FlatList
                data={savedPosts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        No saved outfits yet
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    itemContainer: {
        margin: 5,
        aspectRatio: 1,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
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
