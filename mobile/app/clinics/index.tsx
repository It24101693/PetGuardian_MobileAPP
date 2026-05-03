import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { vetService, Vet } from '../../services/vetService';
import { ClinicCard } from '../../components/vets/ClinicCard';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';

export default function ClinicBrowserScreen() {
  const router = useRouter();
  const [vets, setVets] = useState<Vet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'nearby' | 'emergency'>('all');

  const loadVets = async () => {
    try {
      const data = await vetService.getVets();
      setVets(data);
    } catch (error) {
      console.error('Failed to load vets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVets();
    setRefreshing(false);
  };

  const filteredVets = vets.filter(v => {
    const matchesSearch = (v.clinicName || v.name).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'emergency' && v.isEmergency);
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Find a Clinic</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search clinics or specialists..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterIcon}>
          <Ionicons name="options-outline" size={24} color={Colors.primaryLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['all', 'nearby', 'emergency'].map((f) => (
          <TouchableOpacity 
            key={f}
            style={[styles.tab, filter === f && styles.activeTab]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.tabText, filter === f && styles.activeTabText]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={filteredVets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ClinicCard 
              clinic={item} 
              onPress={() => router.push(`/clinics/${item._id}`)} 
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No clinics found</Text>
              <Text style={styles.emptyText}>Try searching for something else or check your filters.</Text>
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
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 15,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  filterIcon: {
    marginLeft: 12,
    width: 50,
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: Colors.surfaceAlt,
  },
  activeTab: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
