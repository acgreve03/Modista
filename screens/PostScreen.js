import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, FlatList, ActivityIndicator, Modal, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * PostScreen Component
 *
 * **Description**:
 * - Enables users to create a post by selecting an item from their closet or outfits and writing a caption.
 * - Includes modals to browse and select items from closet and outfits.
 * - Posts are saved to Firestore with item details, caption, and timestamp.
 *
 * **Features**:
 * - Fetch closet items and outfits for the logged-in user from Firestore.
 * - Display selected item details and allow users to input a caption.
 * - Supports posting the selected item with a caption to Firestore.
 * - Includes modals for selecting items from the closet or outfits.
 */
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

    // Check user authentication and fetch data on component mount
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

    // Fetch and map closet items from Firestore
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

    // Fetch and map outfits from Firestore
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
            console.error('Error fetching outfits:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle post creation
    const handlePost = async () => {
        if (!selectedItem || !caption.trim()) {
            alert('Please select an item and write a caption.');
            return;
        }

        try {
            setLoading(true);
            const postsRef = collection(db, 'posts');
            
            // Add new post document to Firestore
            await addDoc(postsRef, {
                userId: user.uid,
                itemId: selectedItem.id,
                itemImage: selectedItem.closetItemUrl || selectedItem.outfitImageUrl,
                caption,
                timestamp: Timestamp.now(),
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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

                    <TouchableOpacity
                        style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]}
                        onPressIn={() => setButtonPressed(true)}
                        onPressOut={() => setButtonPressed(false)}
                        onPress={handlePost}
                        activeOpacity={1}
                    >
                        <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>Post</Text>
                    </TouchableOpacity>

                    {/* Closet Modal */}
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

                    {/* Outfits Modal */}
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
            </ScrollView>
        </KeyboardAvoidingView>
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
    selectedItemContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        width: '45%',
        height: '45%',
        aspectRatio: 1,
    },
    selectedItemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        aspectRatio: 1,
        resizeMode: 'contain'
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
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginVertical: 10,
    },
    button: {
        borderWidth: 1,
        borderColor: 'purple',
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        width: '100%',
        alignSelf: 'center',
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    buttonPressed: {
        backgroundColor: 'purple',
    },
    buttonText: {
        color: 'purple',
        fontSize: 15,
        fontWeight: 'regular',
        fontFamily: 'Helvetica',
    },
    buttonTextPressed: {
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    modalGridItem: {
        flex: 1,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden',
        aspectRatio: 1,
    },
    modalGridItemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
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
});

export default PostScreen;