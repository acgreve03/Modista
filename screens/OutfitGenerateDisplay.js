import { useState, useEffect } from 'react';
import { Modal, Alert, View, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
//import { fetchUserClosetItems, generateOutfit } from '../services/outfitGenerator'; // Assuming these are in outfitGeneration.js
import {  addDoc, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const OutfitGenerateDisplay = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [isSeasonExpanded, setIsSeasonExpanded] = useState(false);
    const [customOccasion, setCustomOccasion] = useState("");  // For special occasion input
    const [generatedOutfit, setGeneratedOutfit] = useState(null);  // Outfit state
    const [closetItems, setClosetItems] = useState([]); // State for closet items
    const [loading, setLoading] = useState(true); // Loading state
    const [userProfile, setUserProfile] = useState(null); // State for user profile
    const [modalVisible, setModalVisible] = useState(false);


    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser; // Get the current logged-in user
                if (user) {
                    // Fetch user profile
                    const userRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                        //console.log(docSnap.data())
                    } else {
                        console.log('No such document!');
                    }
    
                    // Fetch closet items directly here
                    const closetRef = collection(db, `users/${user.uid}/closet`);

                    const querySnapshot = await getDocs(closetRef);
                    //console.log('Attempting to fetch from path:', `users/${user.uid}/closet`);
                    //console.log('Number of documents in closet:', querySnapshot.size);

                    const items = querySnapshot.docs.map(documentSnapshot => ({
                        ItemID: documentSnapshot.id,
                        category: documentSnapshot.data().category,
                        color: documentSnapshot.data().color,
                        season: documentSnapshot.data().season,
                        occasion: documentSnapshot.data().occasion,
                        subcategory: documentSnapshot.data().subcategory,
                        imageUrl: documentSnapshot.data().closetItemUrl 
                    }));
    
                    //console.log('Fetched closet items:', items);
                    setClosetItems(items);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Set loading to false once both profile and items are fetched
            }
        };
    
        fetchData();
    }, []);
    

    const handleGenerateOutfit = () => {
        if (loading) {
            console.log("Still loading closet items...");
            return;
        }
        const occasion = customOccasion || selectedType;
        //console.log(closetItems.length)
        const outfit = generateOutfit(closetItems, occasion, selectedSeason); 
        setGeneratedOutfit(outfit);  // Save generated outfit to state
        setModalVisible(true); // Open the modal to display the outfit
    };

    const handleSurpriseOutfit = () => {
        //const outfit = generateOutfit();
        //setGeneratedOutfit(outfit);
    };

    const toggleSeason = (season) => {
        setSelectedSeason(selectedSeason === season ? null : season);  // Toggle season
        setIsSeasonExpanded(false); // Close options after selection
    };

    const handleSpecialOccasionChange = (text) => {
        setCustomOccasion(text);  // Update custom occasion directly
    };

    const handleClose = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.closeButtonModista}
                onPress={handleClose}
            >
                <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Generate Your Outfit</Text>

            {/* Season Selector */}
            <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setIsSeasonExpanded(!isSeasonExpanded)}
            >
                <Text style={styles.selectorText}>{selectedSeason || "Choose Season"}</Text>
            </TouchableOpacity>

            {isSeasonExpanded && (
                <View style={styles.optionsContainer}>
                    {["Spring", "Summer", "Fall", "Winter"].map((season) => (
                        <TouchableOpacity
                            key={season}
                            style={[styles.optionButton, selectedSeason === season && styles.selectedButton]}
                            onPress={() => toggleSeason(season)}
                        >
                            <Text style={styles.optionText}>{season}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Occasion Selector */}
            <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setSelectedType(selectedType ? null : "Choose Occasion")}
            >
                <Text style={styles.selectorText}>{selectedType || "Choose Occasion"}</Text>
            </TouchableOpacity>

            {selectedType === "Choose Occasion" && (
                <View style={styles.optionsContainer}>
                    {["Casual", "Formal", "Sporty", "Party"].map((occasion) => (
                        <TouchableOpacity
                            key={occasion}
                            style={[styles.optionButton, selectedType === occasion && styles.selectedButton]}
                            onPress={() => setSelectedType(occasion)}
                        >
                            <Text style={styles.optionText}>{occasion}</Text>
                        </TouchableOpacity>
                    ))}
                    <TextInput
                        style={styles.customInput}
                        placeholder="Type a special occasion"
                        value={customOccasion}
                        onChangeText={handleSpecialOccasionChange}
                        onSubmitEditing={() => setSelectedType(customOccasion)}
                    />
                </View>
            )}

            {/* Generate Outfit Button */}
            <TouchableOpacity 
                style={styles.generateButton}
                onPress={handleGenerateOutfit}
            >
                <Text style={styles.generateText}>Generate Outfit</Text>
                 {/* Conditionally render OutfitDisplay if generatedOutfit exists */}
                 {generatedOutfit && (
                    <OutfitDisplay 
                        generatedOutfit={generatedOutfit} 
                        modalVisible={modalVisible} 
                        setModalVisible={setModalVisible} 
                    />)}
            </TouchableOpacity>

            {/* Surprise Me Button */}
            <TouchableOpacity 
                style={styles.surpriseButton}
                onPress={handleSurpriseOutfit}
            >
                <Text style={styles.surpriseText}>Surprise Me!</Text>
            </TouchableOpacity>

            
        </View>
    );
};

const isValidUrl = (url) => {
    try {
        const validUrl = new URL(url);
        
        // Check if the protocol is either "http:", "https:", or "file:"
        const isValidProtocol = 
            validUrl.protocol === "http:" || 
            validUrl.protocol === "https:" || 
            validUrl.protocol === "file:";
        
        // Check if the URL ends with a valid image file extension
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(validUrl.pathname);
        
        return isValidProtocol && isImage;
    } catch (error) {
        return false;
    }
};

export const generateOutfit = async (closetItems, season, occasion) => {
    // Step 1: Filter items by season and/or occasion
    const filteredItems = closetItems.filter((item) => {

        // Ensure season, occasion, category, and subcategory are defined
        const hasValidSeason = item.season !== undefined && item.season !== null;
        const hasValidOccasion = item.occasion !== undefined && item.occasion !== null;
        const hasValidCategory = item.category !== undefined && item.category !== null;
        const hasValidSubcategory = item.subcategory !== undefined && item.subcategory !== null;
        const hasValidURL = item.imageUrl !== undefined && item.imageUrl !== null;
        
        // Check if the season or occasion exists and matches
        // Check if season and occasion are valid before matching
        const matchesSeason = season ? (hasValidSeason && item.season === season) : true;
        const matchesOccasion = occasion ? (hasValidOccasion && item.occasion === occasion) : true;

        
  
      // Log to debug the filtering process
      //console.log(`Item: ${item.ItemID}, Season: ${item.season}, Occasion: ${item.occasion}, Matches Season: ${matchesSeason}, Matches Occasion: ${matchesOccasion}`);
      //console.log(isValidUrl(item.imageUrl))
      // Return true if item matches the season or occasion, or both
      return (matchesSeason || matchesOccasion) && hasValidCategory && hasValidSubcategory && isValidUrl(item.imageUrl); //&& hasValidURL;
    });
  
    //console.log(`Filtered items:`, filteredItems);
  
    if (filteredItems.length === 0) {
      //console.log('No items available for this season and occasion.');
      return {}; // Return an empty object if no matching items are found
    }
  
    // Step 2: Randomly select a top
    const tops = filteredItems.filter(item => item.category === 'Top');
    const bottoms = filteredItems.filter(item => item.category === 'Bottom');
    const shoes = filteredItems.filter(item => item.category === 'Shoes');
    const accessories = filteredItems.filter(item => item.category === 'Accessory');
  
    if (!tops.length || !bottoms.length){ //|| !shoes.length) {
        
      console.log('Missing essential components for outfit.');
      if(!tops.length){
        console.log('Missing top components for outfit.');
      }
      if(!bottoms.length){
        console.log('Missing bottom essential components for outfit.');
      }

      return {}; // Return an empty object if one of the essential items is missing
    }
  
    // Randomly select a top
    
    const randomTop = tops[Math.floor(Math.random() * tops.length)];
    
    
  
    // Step 3: Automatically determine the color scheme based on the selected top's color
    const colorScheme = determineColorScheme(randomTop.color);
  
    // Step 4: Filter bottoms and shoes based on the color scheme
    const colorFilteredItems = applyColorScheme(filteredItems, colorScheme, randomTop.color);
  
    const colorFilteredBottoms = colorFilteredItems.filter(item => item.subcategory === 'bottom');
    const colorFilteredShoes = colorFilteredItems.filter(item => item.subcategory === 'shoes');
  
    // Ensure all components are selected
    const outfit = {
      top: randomTop, // Always use the randomly selected top
      bottom: colorFilteredBottoms.length > 0 ? colorFilteredBottoms[0] : bottoms[0], // Select based on color scheme, fallback to first item
      //shoes: colorFilteredShoes.length > 0 ? colorFilteredShoes[0] : shoes[0], // Select based on color scheme, fallback to first item
    };
  
    // // Add accessory if available
    // if (accessories.length) {
    //   outfit.accessory = accessories[0]; // Select first available accessory
    // }
    //console.log("Outfit generated with image URLs:", outfit);

  
    return outfit; // Return the generated outfit as an object
  };
  
  
  // Function to determine the color scheme based on the top's color
  const determineColorScheme = (color) => {
    const neutralColors = ['black', 'white', 'gray', 'beige'];
    if (neutralColors.includes(color.toLowerCase())) {
      return 'monochromatic'; // Use monochromatic if the color is neutral
    } else {
      // For non-neutral colors, let's pick a complementary or analogous scheme
      return Math.random() > 0.5 ? 'complementary' : 'analogous'; // Randomly choose between complementary or analogous
    }
  };

  // Function to calculate complementary color
    const getComplementaryColor = (color) => {
        const [h, s, l] = rgbToHsl(color.r, color.g, color.b); // Assuming color is in RGB format
        const compH = (h + 180) % 360;
        const [r, g, b] = hslToRgb(compH, s, l); // Convert back to RGB
        return { r, g, b };
    };

    // Helper function to convert RGB to HSL
    const rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
    
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        let d = max - min;
        
        if (d === 0) {
        h = s = 0; // achromatic
        } else {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
        }
    
        return [h * 360, s * 100, l * 100]; // HSL
    };

    const hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r, g, b;
      
        if (h >= 0 && h < 60) {
          r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
          r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
          r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
          r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
          r = x; g = 0; b = c;
        } else {
          r = c; g = 0; b = x;
        }
      
        return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
      };
      

    // Function to calculate analogous colors
    const getAnalogousColors = (color) => {
        const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
        const analogous1 = (h + 30) % 360;
        const analogous2 = (h - 30 + 360) % 360;
        
        const [r1, g1, b1] = hslToRgb(analogous1, s, l); // First analogous color
        const [r2, g2, b2] = hslToRgb(analogous2, s, l); // Second analogous color
        
        return [
        { r: r1, g: g1, b: b1 },
        { r: r2, g: g2, b: b2 },
        ];
    };
  
  
  // Function to apply the color scheme to the outfit
  const applyColorScheme = (items, colorScheme, baseColor) => {
    const colorTheory = {
      monochromatic: (color) => {
        return items.filter(item => item.color === color); // Filter items with the same color -> update so that monochromatic expands from just neutrals 
      },
      complementary: (color) => {
        const complementaryColor = getComplementaryColor(color);
        return items.filter(item => {
          return isColorMatch(item.color, complementaryColor);
        });
      },
      analogous: (color) => {
        const analogousColors = getAnalogousColors(color);
        return items.filter(item => {
          return analogousColors.some(analogousColor =>
            isColorMatch(item.color, analogousColor)
          );
        });
      },
    };
    
  
    return colorTheory[colorScheme](baseColor);
  };

  // Helper function to check if two colors match (basic RGB comparison)
    const isColorMatch = (color1, color2) => {
        return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
    };

export const OutfitDisplay = ({ generatedOutfit, modalVisible, setModalVisible }) => {

    const [loading, setLoading] = useState(false);




    // Close the modal
    const closeOutfit = () => {
        setModalVisible(false);
    };

    const handleSaveOutfit = async () => {
        const user = auth.currentUser;
    
        // Check for user and ensure generatedOutfit is a valid object and not empty
        if (!user || !generatedOutfit || Object.keys(generatedOutfit).length === 0) {
            Alert.alert('Error', 'User not authenticated or no outfit generated.');
            return;
        }
    
        try {
            setLoading(true);
    
            // Reference to the user's outfits collection in Firestore
            const userRef = doc(db, 'users', user.uid);
            const outfitsRef = collection(userRef, 'outfits');
    
            // Ensure `_j` exists and is iterable
            const validItems = [];
            const items = generatedOutfit._j; // Access `_j` directly
    

            const outfitData = {}; // This will hold the entire outfit
            ['top', 'bottom'].forEach((key) => {
                const item = items[key]; // Access individual item (e.g., top, bottom)
    
                // Validate the item
                if (item?.ItemID && item?.imageUrl) {
                    outfitData[key] = {
                        itemID: item.ItemID, // Save the ItemID (unique identifier)
                        imageUrl: item.imageUrl, // Save the imageUrl (for the outfit)
                        color: item.color, // Optional: Save additional metadata
                        occasion: item.occasion,
                        season: item.season,
                        subcategory: item.subcategory,
                    };
                } else {
                    console.log(`Skipping invalid item: ${key}`, item); // Log invalid items
                }
            });
    
            // Save valid items to Firestore if any
    
            // Save valid items to Firestore if any
            // Ensure there is at least one valid item before saving
        if (Object.keys(outfitData).length > 0) {
            // Save the entire outfit as one document
            await addDoc(outfitsRef, {
                outfit: outfitData, // Contains all valid items (top, bottom, etc.)
                createdAt: new Date(), // Optional: Add a timestamp
            });

            Alert.alert('Success', 'Outfit saved successfully!');
        } else {
            Alert.alert('Error', 'No valid items to save.');
        }
        } catch (error) {
            console.error("Error saving outfit:", error);
            Alert.alert('Error', 'Failed to save outfit.');
        } finally {
            setLoading(false);
        }
    };
    
    
    
    

    // Create a collage of images
    const renderCollage = () => {
        if (!generatedOutfit) return null;
        // Log the generatedOutfit to see its structure
        //console.log("Generated Outfit:", generatedOutfit);
       // console.log ("Generated Type:", typeof generatedOutfit)


        const items = Object.values(generatedOutfit._j).filter(item => item && item.imageUrl);
        //console.log("Filtered Items for Collage:", items.length);


        //items.forEach(item => console.log(item.imageUrl));

        return (
            <View style={styles.collageContainer}>
                {items.map((item, index) => (
                    <Image
                        key={index}
                        source={{ uri: item.imageUrl }}
                        style={styles.collageImage}
                    />
                ))}
            </View>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeOutfit}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Your Outfit</Text>
                    {renderCollage()}
                    <TouchableOpacity 
                        style={styles.saveButton}
                        //onPress={saveOutfit}
                        onPress={() => handleSaveOutfit(generatedOutfit)}
                    >
                        <Text style={styles.saveText}>Save Outfit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={closeOutfit}
                    >
                        <Text style={styles.closeText}>X</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
    };

  

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    closeText: {
        fontSize: 18,
        color: 'grey',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        color: '#6a0dad',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    selectorButton: {
        backgroundColor: '#ddd',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '100%',
        marginVertical: 8,
        alignItems: 'center',
    },
    selectorText: {
        fontSize: 18,
        color: '#6a0dad',
        fontWeight: '500',
    },
    optionsContainer: {
        width: '100%',
        marginTop: 10,
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    optionButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        width: '90%',
        marginVertical: 5,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#6a0dad',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    generateButton: {
        backgroundColor: '#6a0dad',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        marginTop: 20,
    },
    generateText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    surpriseButton: {
        backgroundColor: '#4c4c4c',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        marginTop: 10,
    },
    surpriseText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    customInput: {
        width: '90%',
        borderColor: '#6a0dad',
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginTop: 10,
        backgroundColor: '#fff',
        color: '#333',
    },
    outfitContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    outfitTitle: {
        fontSize: 20,
        color: '#6a0dad',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    outfitImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    outfitDescription: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        // Removed extra paddingTop
        paddingTop: 0,   // Remove unnecessary paddingTop
        height: '38%',   // Let content determine the height
    },
    
      outfitTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      itemContainer: {
        alignItems: 'center',
        marginVertical: 5,
      },
      itemImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: 5,
    },
      itemDescription: {
        textAlign: 'center',
        fontSize: 14,
    },
    outfitTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#6a0dad',
    },
    itemContainer: {
        alignItems: 'center',
        marginVertical: 5,
    },
    itemImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginBottom: 5,
    },
    itemDescription: {
        textAlign: 'center',
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
    closeButton: {
        position: 'absolute', // Keeps the close button in the top-right corner
        top: 5,             // Adjust top to ensure it's placed properly
        left: 20,           // Move it to the right edge
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        
    },
    saveButton: {
        backgroundColor: '#6a0dad',
        paddingVertical: 10,  // Increased padding for height
        paddingHorizontal: 20, // Increased padding for width
        borderRadius: 12,     // Optional: increase the border radius for a more rounded look
        marginHorizontal: 10, // Optional: more margin to give space on the sides
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
    },
    saveText: {
        color: 'white',
        fontSize: 18, // Larger font size for the text
        fontWeight: 'bold', // Optional: to make the text bold
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    collageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space'
    },
    collageImage: {
        width: 120,
        height: 150,
        margin: 5,
        borderRadius: 10,
    },
    closeButtonModista: {
        position: 'absolute',
        top: 40, // Adjusted for better visibility
        right: 20, // Using 'right' instead of 'left' for top-right positioning
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    modalTitle: {
        paddingTop: 20,
        fontSize: 27,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#6a0dad',
    },
});

export default OutfitGenerateDisplay;

