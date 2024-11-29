import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, FlatList, ActivityIndicator, Modal,} from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PostScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [closetItems, setClosetItems] = useState([]);
    const [outfits, setOutfits] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [closetModalVisible, setClosetModalVisible] = useState(false);
    const [outfitModalVisible, setOutfitModalVisible] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchClosetItems(currentUser.uid);
                fetchOutfits(currentUser.uid);
            } else {
                navigation.navigate('Login');
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchClosetItems = async (uid) => {
        try {
            setLoading(true);
            const userRef = collection(db, `users/${uid}/closet`);
            const querySnapshot = await getDocs(userRef);

            const fetchedItems = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setClosetItems(fetchedItems);
        } catch (error) {
            console.error('Error fetching closet items:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOutfits = async (uid) => {
        try {
            setLoading(true);
            const userRef = collection(db, `users/${uid}/outfits`);
            const querySnapshot = await getDocs(userRef);

            const fetchedItems = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setOutfits(fetchedItems);
        } catch (error) {
            console.error('Error fetching closet items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!selectedItem || !caption.trim()) {
            alert('Please select an item and write a caption.');
            return;
        }

        try {
            setLoading(true);
            const postsRef = collection(db, 'posts');

            await addDoc(postsRef, {
                userId: user.uid,
                itemId: selectedItem.id,
                itemImage: selectedItem.closetItemUrl || selectedItem.outfitImageUrl,
                caption,
                timestamp: new Date().toISOString(),
            });

            setLoading(false);
            alert('Post created successfully!');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error creating post:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="purple" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create a Post</Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button3} onPress={() => { setClosetModalVisible(true) }}>
                    <MaterialCommunityIcons name="hanger" size={40} color={'purple'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button3} onPress={() => { setOutfitModalVisible(true) }}>
                    <MaterialCommunityIcons name="tshirt-crew-outline" size={40} color={'purple'} />
                </TouchableOpacity>
            </View>

            {selectedItem && (
                <View style={styles.selectedItemContainer}>
                    <Image
                        source={{ uri: selectedItem.closetItemUrl || selectedItem.outfitImageUrl }}
                        style={styles.selectedItemImage}
                    />
                </View>
            )}

            <Text style={styles.subtitle}>Caption</Text>
            <TextInput
                style={styles.captionInput}
                placeholder="Write a caption...."
                value={caption}
                onChangeText={setCaption}
                multiline
            />

            <TouchableOpacity style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]} 
                onPressIn={() => setButtonPressed(true)}
                onPressOut={() => setButtonPressed(false)} 
                onPress={(handlePost)}
                activeOpacity={1}>
                <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Post</Text>
            </TouchableOpacity>

            {/* Modal for closet items */}
            <Modal
            visible={closetModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setClosetModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select an Item</Text>
                        <FlatList
                            data={closetItems}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalGridItem}
                                    onPress={() => {
                                        setSelectedItem(item);
                                        setClosetModalVisible(false);
                                    }}
                                >
                                    <Image
                                        source={{ uri: item.closetItemUrl }}
                                        style={styles.modalGridItemImage}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setClosetModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for outfits */}
            <Modal
            visible={outfitModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setOutfitModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select an Item</Text>
                        <FlatList
                            data={outfits}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalGridItem}
                                    onPress={() => {
                                        setSelectedItem(item);
                                        setOutfitModalVisible(false);
                                    }}
                                >
                                    <Image
                                        source={{ uri: item.outfitImageUrl }}
                                        style={styles.modalGridItemImage}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setOutfitModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: 'transparent',
        marginTop: 50,
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'heavy', 
        marginBottom: 20,
    },
    subtitle: { 
        fontSize: 18, 
        marginBottom: 10,
    },
    selectButton: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    selectButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedItemContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        width: '45%',
        height: '45%',
        aspectRatio: 1
    },
    selectedItemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        resizeMode: 'contain',
        aspectRatio: 1
    },
    selectedItemText: {
        marginTop: 5,
        fontSize: 16,
        color: '#333',
    },
    captionInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    postButton: {
        backgroundColor: '#333',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    postButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 10,
        flex: 0.8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalItemContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    modalItemImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    modalItemText: {
        marginTop: 5,
        fontSize: 14,
    },
    modalCloseButton: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    modalCloseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalGridItem: {
        flex: 1,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden',
        aspectRatio: 1
    },
    modalGridItemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        resizeMode: 'contain',
        aspectRatio: 1

    },
    modalGridItemText: {
        marginTop: 5,
        fontSize: 14,
        textAlign: 'center',
    },
    button3: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'purple',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 150,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginVertical: 10,
    },
    button: {
        borderWidth: 1,
        borderColor: "purple",
        paddingVertical: 12,
        paddingHorizontal: 20, 
        alignItems: 'center',
        width: '100%',
        alignSelf: 'center',
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    buttonPressed: {
        backgroundColor: "purple",
    },
    buttonText: {
        color: "purple", 
        fontSize: 15, 
        fontWeight: 'regular', 
        fontFamily: "Helvetica",
    },
    buttonTextPressed: {
        color: "white",
    },
});

export default PostScreen;
