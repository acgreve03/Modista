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
    Alert, FlatList
} from 'react-native';
import { addDoc, doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons'; // or any icon library you're using
import { MaterialCommunityIcons } from '@expo/vector-icons';



const Saved = () => {
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // State to control visibility of the delete button
    const [isFavorited, setIsFavorited] = useState(false); // State to track if the outfit is favorited



    const handleEditPress = () => {
        setIsEditing(prevState => !prevState); // Toggle editing state
      };

    const handleFavoredOutfit = () => {
        setIsFavorited(prev => !prev); // Toggle editing state
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

    const handleDeleteOutfit = (outfitId) => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete this outfit?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: async () => {
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
                    },
                    style: "destructive", // Optional: Red color for Delete button on iOS
                },
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleOutfitClick(item)}
            style={styles.outfitContainer}
        >
            <Image source={{ uri: item.outfitImageUrl }} style={styles.outfitImage} />
        </TouchableOpacity>
    );

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
            <FlatList
                data={savedOutfits}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2} // Number of columns for the grid
                columnWrapperStyle={styles.columnWrapper} // Ensures proper spacing between columns
                showsVerticalScrollIndicator={false} // Hide vertical scroll indicator if desired
                //contentContainerStyle={styles.grid}
                ListEmptyComponent={<Text style={styles.emptyText}>No saved outfits found.</Text>}
            />
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
                    
                    

                    <TouchableOpacity style={styles.backButton} onPress={closeModal}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress= {handleFavoredOutfit}>
                        <MaterialCommunityIcons
                            name={isFavorited ? 'heart' : 'heart-outline'} // Change icon based on state
                            size={30}
                            color={isFavorited ? 'red' : 'black'} // Change color based on state
                        />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        {/* Edit Button Container */}
                        <View style={styles.containeredit}>
                            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                                <MaterialIcons name="edit" size={24} color="black" />
                            </TouchableOpacity>

                            {/* Show Delete Button if in Edit Mode */}
                            {isEditing && (
                                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteOutfit(selectedOutfit.id)}>
                                    <MaterialIcons name="delete" size={24} color="red" />
                                </TouchableOpacity>
                            )}
                        </View>
                    

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

                        

                        <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.postButton} onPress={() => console.log('Post Outfit')}>
                            <Text style={styles.postButtonText}>Post Outfit</Text>
                        </TouchableOpacity>
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
        padding: 10,  
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    outfitContainer: {
        width: '45%', // Adjust container size for grid layout
        aspectRatio: 0.85, // Change aspect ratio for Pinterest-style pins (e.g., 4:5 or 3:4)
        marginBottom: 15, // Increased margin for better separation
        borderRadius: 10,
        borderWidth: 1, // Thin border around the container
        borderColor: '#d3d3d3', // Light grey border for a subtle effect
        backgroundColor: 'white', // Ensure the container background is white
        padding: 10, // Padding inside the container
        elevation: 2, // Add subtle shadow for a more lifted effect
 
    },
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
        alignItems: 'center',
    },
    
    containeredit: {
        position: 'absolute',
        bottom: 330, // Adjust as needed
        right: 40, // Adjust as needed
        zIndex: 10,
        flexDirection: 'row', // Align buttons horizontally
        alignItems: 'center', // Vertically center buttons
        backgroundColor: 'transparent', // No background to avoid clashing
    },
    editButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        zIndex: 10, // Ensure it's above other elements
    },
    deleteButton: {
        marginLeft: 10, // Space between edit and delete buttons
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 30,
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },

    modalContent: {
        paddingTop: 60,
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        paddingBottom: 10,
    },
    modalOutfitImage: {
        width: '95%', // Smaller width for the zoomed-in image
        height: 450, // Smaller height for the zoomed-in image
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
        borderWidth: 1, // Adds border
        //borderColor: '#d3d3d3', // Color for border
        borderRadius: 8, // Optional: rounded corners
        position: 'relative', 
        width: 130, 
        height: 160,
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
    backButton: {
        position: 'absolute',
        top: 70,
        left: 30,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        zIndex: 10,  // Ensure the back button appears on top
      },
    iconButton: {
        position: 'absolute',
        top: 70,
        right: 30,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        zIndex: 10,  // Ensure the back button appears on top
    },
    itemDetails: {
        marginRight: 10, // Add spacing between items
    },
    horizontalScroll: {
        flexDirection: 'row', // Ensure items are aligned in a row
        paddingHorizontal: 10, // Add some horizontal padding for spacing
        alignItems: 'center', // Center align items vertically
    },
    
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    postButton: {
        backgroundColor: 'purple',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    
    postButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
});

export default Saved;
