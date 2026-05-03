import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { petService, Pet } from '../../../services/petService';
import { PetCard } from '../../../components/pets/PetCard';
import { Colors, Spacing, FontSize, Shadow, Radius } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function PetsListScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPets = async () => {
    try {
      const data = await petService.getMyPets();
      setPets(data);
    } catch (error) {
      console.error('Failed to load pets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Pets</Text>
      <Text style={styles.subtitle}>{pets.length} {pets.length === 1 ? 'Pet' : 'Pets'} registered</Text>
    </View>
  );

  const renderAddCard = () => (
    <TouchableOpacity 
      style={styles.addCard} 
      onPress={() => router.push('/(tabs)/pets/add')}
      activeOpacity={0.7}
    >
      <View style={styles.addIconContainer}>
        <Ionicons name="add" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.addText}>Add New Pet</Text>
      <Text style={styles.addDescription}>AI will help you with the breed!</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <FlatList
        data={pets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderAddCard()}
          </>
        }
        renderItem={({ item }) => (
          <PetCard 
            pet={item} 
            onPress={() => router.push(`/(tabs)/pets/${item._id}`)} 
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={Colors.primary} 
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  addCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary + '40', // 40% opacity
    ...Shadow.sm,
  },
  addIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '15', // 15% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  addDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});
