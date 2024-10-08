import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Saved = () => {
    const [boards, setBoards] = useState([
        {
            id: 1,
            name: 'Summer Outfits',
            isPublic: true,
            items: Array(4).fill('https://via.placeholder.com/100'),
        },
        {
            id: 2,
            name: 'Party Looks',
            isPublic: false,
            items: Array(3).fill('https://via.placeholder.com/100'),
        },
    ]);
    
    const [selectedBoard, setSelectedBoard] = useState(null);
    
    const openBoardDetails = (board) => {
        setSelectedBoard(board);
    };

    const closeBoardDetails = () => {
        setSelectedBoard(null);
    };

    const showEditMenu = () => {
        // Placeholder for editing functionality
        console.log("Edit Menu: Show options to edit title or toggle privacy.");
    };

    const deleteBoard = () => {
        // Remove the selected board from the boards array
        setBoards(boards.filter(board => board.id !== selectedBoard.id));
        closeBoardDetails(); // Close the modal after deletion
    };

    const showDeleteConfirmation = () => {
        if (!selectedBoard) return; // Ensure there's a selected board

        Alert.alert(
            "Delete Board",
            "Are you sure you want to delete this board?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: deleteBoard }
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Your Saved Boards</Text>
            <View style={styles.boardContainer}>
                {boards.map((board) => (
                    <TouchableOpacity key={board.id} style={styles.board} onPress={() => openBoardDetails(board)}>
                        <View style={styles.boardPreview}>
                            {board.items.slice(0, 3).map((item, index) => (
                                <Image key={index} source={{ uri: item }} style={styles.boardImage} />
                            ))}
                        </View>
                        <Text style={styles.boardName}>{board.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Detailed View Modal for Selected Board */}
            {selectedBoard && (
                <Modal visible={true} transparent={true} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={closeBoardDetails}>
                                <Text style={styles.backButton}>←</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={showDeleteConfirmation}>
                                <MaterialIcons name="more-vert" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalTitle}>{selectedBoard.name}</Text>
                        <Text style={styles.privacyText}>
                            {selectedBoard.isPublic ? 'Public' : 'Private'}
                        </Text>
                        <ScrollView contentContainerStyle={styles.grid}>
                            {selectedBoard.items.map((item, index) => (
                                <Image key={index} source={{ uri: item }} style={styles.boardImage} />
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={closeBoardDetails} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    boardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    board: {
        width: '48%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
    },
    boardPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
    },
    boardImage: {
        width: '30%',
        height: 100,
        borderRadius: 5,
    },
    boardName: {
        padding: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: 'white',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 40,
    },
    backButton: {
        fontSize: 24,
        marginRight: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10, // Added margin for space
    },
    privacyText: {
        fontSize: 16,
        marginBottom: 20, // Increased margin for space
        textAlign: 'center',
        color: 'gray',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Saved;
