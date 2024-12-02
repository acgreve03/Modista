import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { doc, getDoc, updateDoc, addDoc, collection, getDocs, arrayUnion, arrayRemove, query, orderBy, Timestamp, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PostDetailsScreen = ({ route, navigation }) => {
    const { postId } = route.params;
    const [post, setPost] = useState(null);
    const [userData, setUserData] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [liked, setLiked] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const createNotification = async (type, recipientId, postId, commentText = null) => {
        if (!auth.currentUser) return; // Safety check
        
        try {
            // Get current user's data
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            // Create notification object
            const notificationData = {
                type, // 'like' or 'comment'
                senderId: auth.currentUser.uid,
                recipientId,
                postId,
                senderName: userData.userName || 'User',
                senderProfilePic: userData.profilePictureUrl || 'https://via.placeholder.com/40',
                commentText,
                createdAt: serverTimestamp(),
                read: false
            };

            // Add notification to collection
            const notificationsRef = collection(db, 'notifications');
            await addDoc(notificationsRef, notificationData);
            
            console.log(`${type} notification created for user ${recipientId}`);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    };

    useEffect(() => {
        const fetchCurrentUser = () => {
            const user = auth.currentUser;
            setCurrentUser(user);
        };

        fetchCurrentUser();
        fetchPostDetails(postId);
        fetchComments(postId);
    }, [postId]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchPostDetails(postId);
            if (route.params?.onPostUpdated) {
                route.params.onPostUpdated();
            }
        };
        fetchData();
    }, [postId]);

    useEffect(() => {
        const checkIfSaved = async () => {
            if (post && currentUser) {
                setIsSaved(post.saves?.includes(currentUser.uid) || false);
            }
        };
        checkIfSaved();
    }, [post, currentUser]);

    const fetchPostDetails = async (postId) => {
        try {
            setLoading(true);
            const postRef = doc(db, 'posts', postId);
            const postSnapshot = await getDoc(postRef);

            if (postSnapshot.exists()) {
                const postData = postSnapshot.data();
                console.log('Fetched post data:', postData); // Debug log
                setPost(postData);

                if (postData.userId) {
                    fetchUserData(postData.userId);
                }

                if (postData.likes?.includes(auth.currentUser?.uid)) {
                    setLiked(true);
                }

                // Check saved status
                if (auth.currentUser) {
                    const isSavedByUser = postData.saves?.includes(auth.currentUser.uid) || false;
                    console.log('Initial saved status:', isSavedByUser); // Debug log
                    setIsSaved(isSavedByUser);
                }
            } else {
                console.error('Post not found');
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                setUserData(userSnapshot.data());
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchComments = async (postId) => {
        try {
            const commentsRef = collection(db, `posts/${postId}/comments`);
            const q = query(commentsRef, orderBy('timestamp', 'asc'));
            const querySnapshot = await getDocs(q);

            const fetchedComments = await Promise.all(
                querySnapshot.docs.map(async (commentDoc) => {
                    const commentData = commentDoc.data();
                    const userRef = doc(db, 'users', commentData.userId);
                    const userSnapshot = await getDoc(userRef);
                    let userData = userSnapshot.exists() ? userSnapshot.data() : {};

                    return {
                        id: commentDoc.id,
                        ...commentData,
                        username: userData.userName || 'Anonymous',
                        profilePicture: userData.profilePictureUrl || 'https://via.placeholder.com/40',
                    };
                })
            );

            setComments(fetchedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };


    const handleDeletePost = async () => {
        try {
            Alert.alert(
                "Delete Post",
                "Are you sure you want to delete this post?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            const postRef = doc(db, 'posts', postId);
                            await deleteDoc(postRef);
    
                            alert("Post deleted successfully!");
    
                            if (route.params?.onPostDeleted) {
                                route.params.onPostDeleted();
                            }
    
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;

        try {
            const commentsRef = collection(db, `posts/${postId}/comments`);
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnapshot = await getDoc(userRef);
            const userData = userSnapshot.data();

            await addDoc(commentsRef, {
                userId: currentUser.uid,
                text: newComment.trim(),
                timestamp: new Date().toISOString(),
                username: userData.userName,
                userProfilePic: userData.profilePictureUrl
            });

            // Create notification for comment (only if the post isn't the current user's)
            if (post.userId !== currentUser.uid) {
                await createNotification('comment', post.userId, postId, newComment.trim());
            }

            setNewComment('');
            fetchComments(postId);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleLike = async () => {
        console.log('handleLike started');
        if (!currentUser || !post) {
            console.log('No currentUser or post:', { currentUser, post });
            return;
        }

        try {
            console.log('Attempting to update like status');
            const postRef = doc(db, 'posts', postId);

            if (liked) {
                console.log('Removing like');
                await updateDoc(postRef, {
                    likes: arrayRemove(currentUser.uid),
                });
                setPost((prevPost) => ({
                    ...prevPost,
                    likes: prevPost.likes.filter((uid) => uid !== currentUser.uid),
                }));
                setLiked(false);
            } else {
                console.log('Adding like');
                await updateDoc(postRef, {
                    likes: arrayUnion(currentUser.uid),
                });
                setPost((prevPost) => ({
                    ...prevPost,
                    likes: [...(prevPost.likes || []), currentUser.uid],
                }));
                setLiked(true);

                // Create notification for like (only if the post isn't the current user's)
                if (post.userId !== currentUser.uid) {
                    console.log('Creating notification for:', { recipientId: post.userId, postId });
                    try {
                        await createNotification('like', post.userId, postId);
                    } catch (notifError) {
                        console.error('Error in createNotification:', notifError);
                    }
                }
            }
        } catch (error) {
            console.error('Error in handleLike:', error);
            console.error('Error stack:', error.stack);
        }
    };

    const handleSavePost = async () => {
        if (!currentUser) return;
        
        try {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);
            
            if (postDoc.exists()) {
                const currentSaves = postDoc.data().saves || [];
                let newSaves;
                
                if (isSaved) {
                    newSaves = currentSaves.filter(id => id !== currentUser.uid);
                } else {
                    newSaves = [...currentSaves, currentUser.uid];
                }
                
                await updateDoc(postRef, {
                    saves: newSaves
                });
                
                setIsSaved(!isSaved);
                
                if (route.params?.onPostUnsaved) {
                    route.params.onPostUnsaved();
                }
            }
        } catch (error) {
            console.error('Error saving/unsaving post:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading post details...</Text>
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>Post not found. Please try again later.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: post.itemImage || 'https://via.placeholder.com/150' }} style={styles.fullImage} />
            <Text style={styles.postTimestamp}>
                {post.timestamp?.seconds ? new Date(post.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown Time'}
            </Text>

            {/* Engagement Metrics */}
            <View style={styles.engagementMetrics}>
                <View style={styles.metricsRow}>
                    {/* Like Button */}
                    <TouchableOpacity style={styles.metricItem} onPress={handleLike}>
                        <MaterialCommunityIcons
                            name={liked ? "heart" : "heart-outline"}
                            size={30}
                            color={liked ? "red" : "black"}
                        />
                        <Text style={styles.metricText}>{post.likes?.length || 0} </Text>
                    </TouchableOpacity>

                    {/* Comments Count */}
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.metricItem}>
                        <MaterialCommunityIcons name="comment-outline" size={25} />
                        <Text style={styles.metricText}>{comments.length} </Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    {post.userId === currentUser?.uid && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
                            <MaterialCommunityIcons name="trash-can-outline" size={25} color={"red"}/>
                        </TouchableOpacity>
                    )}

                    {/* Save Button */}
                    <TouchableOpacity onPress={handleSavePost}>
                        <MaterialCommunityIcons
                            name={isSaved ? "bookmark" : "bookmark-outline"}
                            size={24}
                            color={isSaved ? "#007AFF" : "#000"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* User Profile Section */}
            <View style={styles.profileSection}>
                <Image
                    source={{ uri: userData?.profilePictureUrl || 'https://via.placeholder.com/40' }}
                    style={styles.profileImage}
                />
                <Text style={styles.username}>{userData?.userName || 'Anonymous'}</Text>
            </View>

            <Text style={styles.postCaption}>{post.caption || 'No caption available'}</Text>

            {/* Comments Section */}
            <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.commentItem}>
                    <Image source={{ uri: item.profilePicture }} style={styles.commentProfileImage} />
                    <View style={styles.commentContentContainer}>
                        <View style={styles.commentTextContainer}>
                            <Text style={styles.commentUsername}>{item.username}</Text>
                            <Text style={styles.commentText}>{item.text}</Text>
                        </View>
                        <Text style={styles.commentTimestamp}>
                                    {item.timestamp?.seconds ? new Date(item.timestamp.seconds * 1000).toLocaleDateString(): 'Unknown Date'}
                        </Text>
                    </View>
                </View>
                )}
            ListEmptyComponent={<Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>}
            />

            {/* Modal for Adding Comments */}
            <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalView}
                    >
                        <Text style={styles.modalTitle}>Add a Comment</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Write your comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <View style={styles.modalButton}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={addComment} style={styles.submitButton}>
                                 <MaterialCommunityIcons name="send-outline" marginBottom={5} size={25} color={"black"} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    fullImage: {
        width: '100%',
        resizeMode: 'contain',
        aspectRatio: 1,
        borderRadius: 10,
        marginBottom: 5,
        marginTop: 40
    },
    postCaption: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    postTimestamp: { 
        fontSize: 14, 
        color: '#999', 
        marginBottom: 6 
    },
    engagementMetrics: { 
        marginVertical: 10 
    },
    metricsRow: { 
        flexDirection: 'row',
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: 8, 
    },
    metricItem: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    metricText: { 
        fontSize: 14, 
        marginLeft: 5 
    },
    profileSection: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    profileImage: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: '#ddd' 
    },
    username: { 
        marginLeft: 10, 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    noComments: { 
        fontSize: 14, 
        color: '#999', 
        textAlign: 'center', 
        marginTop: 20 
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    commentContentContainer: {
        flex: 1,
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
    },
    commentProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#ddd',
    },
    commentTextContainer: {
        flex: 1,
    },
    commentUsername: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    commentText: {
        fontSize: 16,
    },
    commentTimestamp: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        alignSelf: 'flex-start',
        marginLeft: 10,
    },
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#fff' 
    },
    deleteButton: {
        padding: 10,
        paddingLeft: 240,
        borderRadius: 5,
        marginTop: 20,
    },
    errorContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    errorMessage: { 
        fontSize: 16, 
        color: 'red' 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        textAlignVertical: 'top',
    },
    modalButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default PostDetailsScreen;

