import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vetService, Vet } from '../../services/vetService';
import { Colors, Spacing, FontSize, Shadow } from '../../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function AdminClinicsScreen() {
  const router = useRouter();
  const [clinics, setClinics] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClinics = async () => {
    try {
      const data = await vetService.getVets();
      setClinics(data);
    } catch (error) {
      console.error('Failed to load clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Clinic', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await vetService.deleteVet(id);
            setClinics(clinics.filter(c => c._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete clinic.');
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Clinics</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => router.push('/admin/clinic-form')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.clinicItem}>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{item.clinicName || item.name}</Text>
                <Text style={styles.clinicAddress}>{item.address || 'No address'}</Text>
                <View style={styles.badgeRow}>
                  {item.isEmergency && (
                    <View style={styles.emergencyBadge}>
                      <Text style={styles.badgeText}>Emergency</Text>
                    </View>
                  )}
                  <View style={styles.statusBadge}>
                    <Text style={styles.badgeText}>{item.isAvailable ? 'Active' : 'Hidden'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  onPress={() => router.push(`/admin/clinic-form?id=${item._id}`)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="create-outline" size={20} color={Colors.primaryLight} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(item._id, item.clinicName || item.name)}
                  style={[styles.actionBtn, { marginLeft: 8 }]}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No clinics registered yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.primaryLight,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  listContent: {
    padding: Spacing.lg,
  },
  clinicItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Shadow.xs,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyBadge: {
    backgroundColor: Colors.danger + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadge: {
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
});
