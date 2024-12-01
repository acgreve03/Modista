import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView, Alert } from 'react-native';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Closet = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [buttonPressed, setButtonPressed] = useState(false);

    const categories = ['All', 'Tops', 'Bottoms', 'Dresses'];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchItems(currentUser.uid);
            } else {
                console.log('No user logged in');
                setItems([]);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchItems = async (uid) => {
        try {
            setLoading(true);
            const userRef = collection(db, `users/${uid}/closet`);
            const querySnapshot = await getDocs(userRef);

            const fetchedItems = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setItems(fetchedItems);
        } catch (error) {
            console.error('Error fetching closet items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleDelete = async () => {
        try {
            Alert.alert(
                "Delete Item",
                "Are you sure you want to delete this item?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const itemRef = doc(db, `users/${user.uid}/closet/${selectedItem.id}`);
                                await deleteDoc(itemRef);

                                alert("Item deleted successfully!");
                                setSelectedItem(null);
                                fetchItems(user.uid); 
                            } catch (error) {
                                console.error("Error deleting item:", error);
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Error triggering delete alert:", error);
        }
    };

    const filteredItems = activeFilter === 'All'
        ? items
        : items.filter((item) => item.subcategory?.toLowerCase() === activeFilter.toLowerCase());

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Your Closet</Text>
            <View style={styles.filterContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[styles.filterTab, activeFilter === category && styles.activeFilterTab]}
                        onPress={() => setActiveFilter(category)}
                    >
                        <Text style={[styles.filterText, activeFilter === category && styles.activeFilterText]}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : filteredItems.length === 0 ? (
                <Text style={styles.emptyStateText}>No items found in this category.</Text>
            ) : (
                <View style={styles.grid}>
                    {filteredItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.pin} onPress={() => handleSelectItem(item)}>
                            <Image source={{ uri: item.closetItemUrl }} style={styles.pinImage} />
                            <Text style={styles.pinText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Modal for Selected Item */}
            <Modal visible={!!selectedItem} animationType="slide">
                <View style={styles.modalContainer}>
                    {selectedItem && (
                        <>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            <Image source={{ uri: selectedItem.closetItemUrl }} style={styles.modalImage} />
                            <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                            <Text>Category: {selectedItem.subcategory}</Text>
                            
                            {selectedItem.occasion && (
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tag}>Style: {selectedItem.occasion}</Text>
                                </View>
                            )}

                            {selectedItem.color && (
                                <View style={styles.colorContainer}>
                                    <Text style={styles.colorText}>Color: {selectedItem.color}</Text>
                                </View>
                            )}

                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={[styles.button, buttonPressed ? styles.buttonPressed : styles.button]}
                                    onPressIn={() => setButtonPressed(true)}
                                    onPressOut={() => setButtonPressed(false)}
                                    onPress={handleDelete}
                                    activeOpacity={1}
                                >
                                    <Text style={buttonPressed ? styles.buttonTextPressed : styles.buttonText}>
                                        Delete Item
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        alignItems: 'center', 
        padding: 20, 
        backgroundColor: 'white' 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    filterContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '100%', 
        marginBottom: 20 
    },
    filterTab: { 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        borderRadius: 8, 
        backgroundColor: '#e0e0e0', 
        marginHorizontal: 5 
    },
    activeFilterTab: { 
        backgroundColor: 'purple' 
    },
    filterText: { 
        color: '#333', 
        fontWeight: 'bold' 
    },
    activeFilterText: { 
        color: 'white' 
    },
    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        width: '100%' 
    },
    pin: { 
        width: '48%', 
        aspectRatio: 1, 
        borderRadius: 15, 
        marginBottom: 10, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f9f9f9', 
        overflow: 'hidden' 
    },
    pinImage: {
        width: '100%',
        height: '100%',
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    pinText: { 
        color: '#333', 
        fontWeight: 'bold', 
        marginTop: 5, 
        textAlign: 'center' 
    },
    modalContainer: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 20 
    },
    modalImage: { 
        width: '50%', 
        height: '50%',
        aspectRatio: 1,
        marginBottom: 10, 
        borderRadius: 10 
    },
    modalTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 10 
    },
    closeButton: { 
        position: 'absolute', 
        top: 50, 
        right: 30 
    },
    closeButtonText: { 
        fontSize: 24, 
        color: '#333' 
    },
    actionsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%', 
        marginTop: 20 
    },
    button: {
        borderWidth: 1,
        borderColor: "red",
        paddingVertical: 12,
        paddingHorizontal: 20, 
        alignItems: 'center',
        width: '100%',
        alignSelf: 'center',
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    buttonPressed: {
        backgroundColor: "red",
    },
    buttonText: {
        color: "red", 
        fontSize: 15, 
        fontWeight: 'bold',
    },
    buttonTextPressed: {
        color: "white",
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 20,
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 20,
    },
    tagContainer: {
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 15,
        marginTop: 10,
    },
    tag: {
        color: '#333',
        fontWeight: 'bold',
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    colorCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 10,
    },
    colorText: {
        color: '#333',
    },
});

export default Closet;