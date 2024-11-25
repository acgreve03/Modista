import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Button,
} from 'react-native';
import { addDoc, doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons'; // or any icon library you're using


const Saved = () => {
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // State to control visibility of the delete button


    const handleEditPress = () => {
        setIsEditing(prevState => !prevState); // Toggle editing state
      };

    useEffect(() => {
        const fetchSavedOutfits = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const outfitsRef = collection(db, `users/${user.uid}/outfits`);
                    const querySnapshot = await getDocs(outfitsRef);
                    const outfits = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setSavedOutfits(outfits);
                }
            } catch (error) {
                console.error('Error fetching saved outfits:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedOutfits();
    }, []);

    const handleOutfitClick = (outfit) => {
        setSelectedOutfit(outfit);
    };

    const closeModal = () => {
        setSelectedOutfit(null);
    };

    const handleDeleteOutfit = async (outfitId) => {
        try {
            const user = auth.currentUser;
            if (user) {
                const outfitDocRef = doc(db, `users/${user.uid}/outfits`, outfitId);
                await deleteDoc(outfitDocRef);

                // Update the state to remove the deleted outfit
                setSavedOutfits((prevOutfits) =>
                    prevOutfits.filter((outfit) => outfit.id !== outfitId)
                );

                closeModal(); // Close the modal after deletion
            }
        } catch (error) {
            console.error('Error deleting outfit:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saved Outfits</Text>
            <ScrollView contentContainerStyle={styles.grid}>
                {savedOutfits.length > 0 ? (
                    savedOutfits.map((outfit) => (
                        <TouchableOpacity
                            key={outfit.id}
                            onPress={() => handleOutfitClick(outfit)}
                            style={styles.outfitContainer}
                        >
                            <Image
                                source={{ uri: outfit.outfitImageUrl }}
                                style={styles.outfitImage}
                            />
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No saved outfits found.</Text>
                )}
            </ScrollView>

            {selectedOutfit && (
                <Modal
                    visible={true}
                    animationType="slide"
                    onRequestClose={closeModal}
                    transparent={false}
                >
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                        <Text style={styles.closeButtonText}>X</Text>
                    </TouchableOpacity>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Image
                            source={{ uri: selectedOutfit.outfitImageUrl }}
                            style={styles.modalOutfitImage}
                        />
                        <Text style={styles.detailTitle}>Outfit Details</Text>
                        <View style={styles.detailsContainer}>
                            <ScrollView
                                contentContainerStyle={styles.horizontalScroll}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            >
                                {selectedOutfit.outfit.items ? (
                                    selectedOutfit.outfit.items.map((item, index) => (
                                        <View style={styles.itemDetails} key={index}>
                                            <View style={styles.imageContainer}>
                                                <Image
                                                    source={{ uri: item.imageUrl }}
                                                    style={styles.itemImage}
                                                />
                                                <Text style={styles.subheading}>{item.subcategory}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <>
                                        <View style={styles.itemDetails}>
                                            <View style={styles.imageContainer}>
                                                <Image
                                                    source={{ uri: selectedOutfit.outfit.top.imageUrl }}
                                                    style={styles.itemImage}
                                                />
                                                <Text style={styles.subheading}>
                                                    {selectedOutfit.outfit.top.subcategory}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.itemDetails}>
                                            <View style={styles.imageContainer}>
                                                <Image
                                                    source={{ uri: selectedOutfit.outfit.bottom.imageUrl }}
                                                    style={styles.itemImage}
                                                />
                                                <Text style={styles.subheading}>
                                                    {selectedOutfit.outfit.bottom.subcategory}
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </ScrollView>
                        </View>

                        {/* Edit Button Container */}
                        <View style={styles.containeredit}>
                            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                                {/* Edit Icon */}
                                <MaterialIcons name="edit" size={24} color="black" />
                            </TouchableOpacity>

                            {/* Show Delete Button if in Edit Mode */}
                            {isEditing && (
                                <Button
                                    title="Delete Outfit"
                                    color="red"
                                    onPress={() => handleDeleteOutfit(selectedOutfit.id)}
                                />
                            )}
                        </View>
                    </ScrollView>
                </Modal>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        
    },
    containeredit: {
        marginTop: 20,
    padding: 10,
    top: 10,
        right: 10

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    outfitContainer: {
        width: '48%',
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: .7, // Adding border
        borderColor: '#d3d3d3', // Greyish color for the outline
        
    },
    outfitImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
        resizeMode: 'cover', // Ensures the image fits within its dimensions
        borderRadius: 8, // Adds a slight rounding to match the container
        overflow: 'hidden', // Ensures no content spills out
        resizeMode: 'contain', // Ensure the image fits within the bounds without cropping
        backgroundColor: 'white',


    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    modalContent: {
        paddingTop: 90,
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        paddingBottom: 10,
    },
    modalOutfitImage: {
        width: '85%', // Smaller width for the zoomed-in image
        height: 350, // Smaller height for the zoomed-in image
        marginBottom: 20,
        resizeMode: 'contain',
        backgroundColor: 'white',
        borderWidth: 1, // Adding border
        borderColor: '#d3d3d3', // Greyish color for the outline
        borderRadius: 10,
    },
    detailsContainer: {
        borderRadius: 1,
        borderColor: 'grey',
        flexDirection: 'row', // Aligns image and details horizontally
        alignItems: 'center', // Centers items vertically
        width: '100%',
        //marginTop: 40,
    },
    itemDetails: {
        flex: 1, // Ensures text takes up the remaining space
        alignContent: 'center',
    },
    subheading: {
        fontSize: 18,
        fontWeight: '600',
        alignItems: 'center',
        
    },
    imageContainer: {
        position: 'relative', // Enables absolute positioning for the text
        width: 100, // Adjust to your desired image size
        height: 100, // Match your image dimensions
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        marginTop: 5,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginVertical: 10,
        resizeMode: 'contain',
    },
    detailTitle: {
        paddingTop: 15,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    }, 
    closeButton: {
        position: 'absolute',
        top: 45,
        left: 20,
        zIndex: 1,
        backgroundColor: 'white',
       
        borderColor: '#d3d3d3',
        borderRadius: 20,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemDetails: {
        marginRight: 10, // Add spacing between items
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    horizontalScroll: {
        flexDirection: 'row', // Ensure items are aligned in a row
        paddingHorizontal: 10, // Add some horizontal padding for spacing
        alignItems: 'center', // Center align items vertically
    },
    editButton: {
        position: 'absolute',
        top: 45,
        right: 20,
        zIndex: 1,
        backgroundColor: 'white',
        borderColor: '#d3d3d3',
        borderRadius: 20,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Saved;
