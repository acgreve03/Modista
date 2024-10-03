import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';

const Closet = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null); // State for selected item

    // Simulated item data with additional details
    const items = Array.from({ length: 20 }, (_, index) => ({
        id: index,
        name: `Item ${index + 1}`,
        category: 'Tops',
        occasion: 'Casual',
        color: '#3498db', // Sample color
        size: 'Medium',
        image: 'https://via.placeholder.com/150',
    }));

    const categories = ['All', 'Tops', 'Bottoms', 'Dresses'];

    const handleSelectItem = (item) => {
        setSelectedItem(item); // Set selected item
    };

    const handleCloseModal = () => {
        setSelectedItem(null); // Close modal
    };

    const handleEdit = () => {
        // Handle edit action
        console.log('Edit item:', selectedItem);
    };

    const handleDelete = () => {
        // Handle delete action
        console.log('Delete item:', selectedItem);
    };

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
            <View style={styles.grid}>
                {items.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.pin} onPress={() => handleSelectItem(item)}>
                        <Text style={styles.pinText}>{item.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Modal for Selected Item */}
            <Modal visible={!!selectedItem} animationType="slide">
                <View style={styles.modalContainer}>
                    {selectedItem && (
                        <>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            <Image source={{ uri: selectedItem.image }} style={styles.modalImage} />
                            <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                            <Text>Category: {selectedItem.category}</Text>
                            
                            {/* Occasion Tag */}
                            <View style={styles.tagContainer}>
                                <Text style={styles.tag}>{selectedItem.occasion}</Text>
                            </View>

                            {/* Color Circle */}
                            <View style={styles.colorContainer}>
                                <View style={[styles.colorCircle, { backgroundColor: selectedItem.color }]} />
                                <Text style={styles.colorText}>{selectedItem.color}</Text>
                            </View>

                            {/* Size Tag */}
                            <Text style={styles.sizeTag}>Size: {selectedItem.size}</Text>

                            <View style={styles.actionsContainer}>
                                <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                                    <Text style={styles.actionText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                                    <Text style={styles.actionText}>Delete</Text>
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
    container: { alignItems: 'center', padding: 20, backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
    filterTab: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#e0e0e0', marginHorizontal: 5 },
    activeFilterTab: { backgroundColor: '#333' },
    filterText: { color: '#333', fontWeight: 'bold' },
    activeFilterText: { color: 'white' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
    pin: { width: '48%', height: 150, borderWidth: 2, borderColor: '#ccc', borderRadius: 15, marginBottom: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' },
    pinText: { color: '#333', fontWeight: 'bold' },
    modalContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    modalImage: { width: 150, height: 150, marginBottom: 20, borderRadius: 10 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    closeButton: { position: 'absolute', top: 50, right: 30 },
    closeButtonText: { fontSize: 24, color: '#333' },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
    actionButton: { padding: 10, backgroundColor: '#333', borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    actionText: { color: 'white', fontWeight: 'bold' },
    tagContainer: {
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 15,
        marginTop: 10,
        alignSelf: 'flex-start',
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
    sizeTag: {
        marginTop: 10,
        fontWeight: 'bold',
    },
});

export default Closet;
