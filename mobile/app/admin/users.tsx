import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { notificationService } from '../../services/notificationService';
import { Modal, Pressable } from 'react-native';

export default function AdminUserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('PetGuardian Update');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await adminService.deleteUser(id);
              loadUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user.');
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await adminService.toggleUserStatus(id);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status.');
    }
  };

  const handleSendNotification = async () => {
    if (!notifyMessage.trim()) return;
    try {
      setSending(true);
      await notificationService.sendNotification({
        userId: selectedUser._id,
        title: notifyTitle,
        message: notifyMessage,
        type: 'system',
        priority: 'high'
      });
      Alert.alert('Success', `Notification sent to ${selectedUser.fullName}`);
      setShowNotifyModal(false);
      setNotifyMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: item.role === 'admin' ? '#fef3c7' : item.role === 'veterinarian' ? '#dcfce7' : '#f1f5f9' }]}>
              <Text style={[styles.badgeText, { color: item.role === 'admin' ? '#d97706' : item.role === 'veterinarian' ? '#166534' : '#64748b' }]}>
                {item.role}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={[styles.statusText, { color: item.isActive ? '#166534' : '#ef4444' }]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => router.push(`/admin/user-form?id=${item._id}`)} 
            style={styles.actionBtn}
          >
            <Ionicons name="create-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setSelectedUser(item); setShowNotifyModal(true); }} 
            style={styles.actionBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleToggleStatus(item._id)} style={styles.actionBtn}>
            <Ionicons name={item.isActive ? "close-circle-outline" : "checkmark-circle-outline"} size={22} color={item.isActive ? "#ef4444" : "#22c55e"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id, item.fullName)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity onPress={() => router.push('/admin/user-form')}>
          <Ionicons name="person-add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder="Search by name or email..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found.</Text>
          }
        />
      )}

      <Modal
        visible={showNotifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifyModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifyModal(false)}>
          <View style={{ width: '100%' }} onStartShouldSetResponder={() => true}>
            <Card style={styles.modalContent}>
              <Text style={styles.modalTitle}>Send Notification</Text>
            <Text style={styles.modalSub}>To: {selectedUser?.fullName}</Text>
            
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={notifyTitle}
              onChangeText={setNotifyTitle}
              placeholder="Notification Title"
            />

            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notifyMessage}
              onChangeText={setNotifyMessage}
              placeholder="Type your message here..."
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNotifyModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sendBtn, !notifyMessage.trim() && { opacity: 0.5 }]} 
                onPress={handleSendNotification}
                disabled={!notifyMessage.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>Send Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </Card>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    padding: 24,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  email: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  emptyText: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    padding: 24,
    borderRadius: 24,
    ...Shadow.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  sendBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...Shadow.sm,
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
