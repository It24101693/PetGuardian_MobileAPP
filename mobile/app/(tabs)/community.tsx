import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { communityService, Post } from '../../services/communityService';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, FontSize, Radius, Shadow, FontWeight } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';
import { StatusBar } from 'expo-status-bar';

import * as ImagePicker from 'expo-image-picker';
import { Modal, Pressable } from 'react-native';
import { API_BASE_URL, getImageUrl } from '../../services/api';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'latest' | 'popular'>('latest');
  const { user } = useAuth();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Using shared getImageUrl from api.ts

  const loadPosts = async (filter = activeFilter) => {
    try {
      const data = await communityService.getPosts(filter);
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLike = async (id: string) => {
    try {
      await communityService.toggleLike(id);
      loadPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const feelings = [
    { label: 'Happy', emoji: '😊', icon: 'happy-outline' },
    { label: 'Excited', emoji: '🤩', icon: 'sparkles-outline' },
    { label: 'Sleepy', emoji: '😴', icon: 'moon-outline' },
    { label: 'Proud', emoji: '🦁', icon: 'ribbon-outline' },
    { label: 'Playful', emoji: '🎾', icon: 'tennisball-outline' },
    { label: 'Healthy', emoji: '💪', icon: 'heart-outline' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    try {
      setLoading(true);
      if (editingPostId) {
        await communityService.updatePost(editingPostId, { 
          content: newPostContent,
          feeling: selectedFeeling || undefined 
        });
        Alert.alert('Success', 'Post updated!');
      } else {
        await communityService.createPost({ 
          content: newPostContent || "Shared a photo", 
          image: selectedImage || undefined,
          feeling: selectedFeeling || undefined
        });
      }
      setNewPostContent('');
      setSelectedImage(null);
      setSelectedFeeling(null);
      setEditingPostId(null);
      loadPosts();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', editingPostId ? 'Failed to update post.' : 'Failed to share your post.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPostId(post._id);
    setNewPostContent(post.content);
    setSelectedFeeling(post.feeling || null);
    setSelectedImage(null); 
  };


  const handlePostOptions = (post: Post) => {
    Alert.alert(
      'Post Options',
      'What would you like to do?',
      [
        { text: 'Edit', onPress: () => handleEdit(post) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(post._id) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderCreatePost = () => (
    <Card style={styles.createCard}>
      <View style={styles.editHeaderRow}>
        <Text style={styles.createTitle}>{editingPostId ? 'Edit Story' : 'Share a Story'}</Text>
        {editingPostId && (
          <TouchableOpacity onPress={() => {
            setEditingPostId(null);
            setNewPostContent('');
            setSelectedFeeling(null);
          }}>
            <Text style={styles.cancelEdit}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.createRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {selectedFeeling && (
            <View style={styles.feelingBadge}>
              <Text style={styles.feelingBadgeText}>is feeling {selectedFeeling}</Text>
              <TouchableOpacity onPress={() => setSelectedFeeling(null)}>
                <Ionicons name="close-circle" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            placeholder="What's on your pet's mind today?"
            style={styles.createInput}
            multiline
            value={newPostContent}
            onChangeText={setNewPostContent}
          />
        </View>
      </View>

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.createFooter}>
        <View style={styles.createActions}>
          {!editingPostId && (
            <TouchableOpacity style={[styles.iconBtn, selectedImage && styles.iconBtnActive]} onPress={pickImage}>
              <Ionicons name="image" size={20} color={selectedImage ? Colors.primary : "#64748b"} />
              <Text style={[styles.iconBtnText, selectedImage && { color: Colors.primary }]}>Photo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.iconBtn, selectedFeeling && styles.iconBtnActive]} onPress={() => setShowFeelingModal(true)}>
            <Ionicons name="sparkles" size={20} color={selectedFeeling ? "#f59e0b" : "#64748b"} />
            <Text style={[styles.iconBtnText, selectedFeeling && { color: "#f59e0b" }]}>Feeling</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.postBtn, (!newPostContent.trim() && !selectedImage) && styles.postBtnDisabled]} 
          onPress={handlePost}
          disabled={!newPostContent.trim() && !selectedImage}
        >
          <Text style={styles.postBtnText}>{editingPostId ? 'Update' : 'Post Now'}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFeelingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeelingModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFeelingModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How is your pet feeling?</Text>
            <View style={styles.feelingGrid}>
              {feelings.map((f) => (
                <TouchableOpacity 
                  key={f.label} 
                  style={[styles.feelingItem, selectedFeeling === f.label && styles.feelingItemActive]}
                  onPress={() => {
                    setSelectedFeeling(f.label);
                    setShowFeelingModal(false);
                  }}
                >
                  <Text style={styles.feelingEmoji}>{f.emoji}</Text>
                  <Text style={styles.feelingLabel}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.packTitleRow}>
        <Ionicons name="people" size={32} color="#0d9488" />
        <Text style={styles.packTitle}>The Pack <Text style={{ color: '#f59e0b' }}>Live</Text></Text>
      </View>
      <Text style={styles.packSubtitle}>Join the conversation with over 5,000 pet parents.</Text>
      
      {renderCreatePost()}

      <View style={styles.recentActivityHeader}>
        <Text style={styles.recentTitle}>RECENT ACTIVITY</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterBtn, activeFilter === 'latest' && styles.filterBtnActive]}
            onPress={() => setActiveFilter('latest')}
          >
            <Text style={[styles.filterText, activeFilter === 'latest' && styles.filterTextActive]}>Latest</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, activeFilter === 'popular' && styles.filterBtnActive]}
            onPress={() => setActiveFilter('popular')}
          >
            <Text style={[styles.filterText, activeFilter === 'popular' && styles.filterTextActive]}>Popular</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPostItem = ({ item }: { item: Post }) => {
    const isLiked = user && item.likes?.includes(user.id);
    const isAuthor = user && (
      (typeof item.userId === 'string' && item.userId === user.id) ||
      (typeof item.userId === 'object' && (item.userId as any)._id === user.id)
    );

    const postUserName = typeof item.userId === 'object' ? (item.userId as any).fullName : item.userName;
    const postUserAvatar = typeof item.userId === 'object' ? (item.userId as any).profileImageUrl : item.userAvatar;

    return (
      <Card style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            {postUserAvatar ? (
              <Image 
                source={{ 
                  uri: getImageUrl(postUserAvatar) || '',
                  headers: { 'Bypass-Tunnel-Reminder': 'true' }
                }} 
                style={styles.avatarImg} 
              />
            ) : (
              <Text style={styles.avatarText}>{postUserName?.charAt(0) || 'U'}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.postUserName}>{postUserName}</Text>
              {item.feeling && (
                <Text style={styles.postFeelingText}> is feeling {item.feeling}</Text>
              )}
            </View>
            <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          {(isAuthor || user?.role === 'admin') && (
            <TouchableOpacity onPress={() => handlePostOptions(item)}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.postContent}>{item.content}</Text>
        {item.imageUrl && (
          <Image 
            source={{ 
              uri: getImageUrl(item.imageUrl) || '',
              headers: { 'Bypass-Tunnel-Reminder': 'true' }
            }} 
            style={styles.postImg} 
          />
        )}

        <View style={styles.postFooter}>
          <TouchableOpacity style={styles.postAction} onPress={() => handleLike(item._id)}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? Colors.danger : "#64748b"} />
            <Text style={[styles.postActionText, isLiked && { color: Colors.danger }]}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
            <Text style={styles.postActionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="share-social-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader()}
        renderItem={renderPostItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={48} color={Colors.divider} />
            </View>
            <Text style={styles.emptyTitle}>The field is empty!</Text>
            <Text style={styles.emptySubtitle}>Be the first to share something with the community!</Text>
            <TouchableOpacity style={styles.inviteBtn}>
              <Text style={styles.inviteText}>Invite a Friend</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    paddingBottom: 40,
  },
  headerSection: {
    padding: Spacing.xl,
    paddingTop: 30,
  },
  packTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  packTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
  },
  packSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 24,
  },
  createCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: Colors.white,
    ...Shadow.md,
  },
  editHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cancelEdit: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '700',
  },
  createRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#d97706',
    fontWeight: 'bold',
    fontSize: 18,
  },
  createInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  feelingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  feelingBadgeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  createFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  createActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtnActive: {
    opacity: 1,
  },
  iconBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  postBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    ...Shadow.sm,
  },
  postBtnDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  postBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  recentActivityHeader: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterBtnActive: {
    backgroundColor: '#0d9488',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  filterTextActive: {
    color: Colors.white,
  },
  postCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  postFeelingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  postTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  postContent: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 16,
  },
  postImg: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginHorizontal: Spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 32,
    backgroundColor: Colors.white,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  inviteBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inviteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    ...Shadow.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  feelingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  feelingItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  feelingItemActive: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  feelingEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  feelingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
});
