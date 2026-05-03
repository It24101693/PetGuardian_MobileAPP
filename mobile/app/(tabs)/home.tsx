import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { petService, Pet } from '../../services/petService';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PetCard } from '../../components/pets/PetCard';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { notificationService } from '../../services/notificationService';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fetchedPets, fetchedAppts, notificationData] = await Promise.all([
        petService.getMyPets(),
        appointmentService.getMyAppointments(),
        notificationService.getMyNotifications()
      ]);
      setPets(fetchedPets);
      setUnreadNotifications(notificationData.unreadCount);
      // Only show upcoming appointments
      setAppointments(fetchedAppts.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 3));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <TouchableOpacity 
              style={styles.avatar}
              onPress={() => router.push('/(tabs)/profile')}
            >
              {user?.profileImageUrl ? (
                <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{user?.fullName?.charAt(0).toUpperCase()}</Text>
              )}
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0]} 👋</Text>
              <Text style={styles.subtitle}>Welcome back to PetGuardian</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={26} color={Colors.textPrimary} />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/pets/add')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="add" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Add Pet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/appointments')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="calendar" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionText}>Book Vet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="scan" size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionText}>AI Scan</Text>
          </TouchableOpacity>
        </View>

        {/* My Pets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Pets</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/pets')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.emptyText}>Loading pets...</Text>
            </View>
          ) : pets.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="paw" size={40} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyCardTitle}>No Pets Yet</Text>
              <Text style={styles.emptyCardText}>Your furry friends will appear here once added.</Text>
              <Button 
                title="Add Your First Pet" 
                onPress={() => router.push('/(tabs)/pets/add')} 
                style={styles.addPetBtn}
              />
            </Card>
          ) : (
            <View style={styles.petList}>
              {pets.slice(0, 2).map((pet) => (
                <PetCard 
                  key={pet._id} 
                  pet={pet} 
                  onPress={() => router.push(`/(tabs)/pets/${pet._id}`)} 
                />
              ))}
            </View>
          )}
        </View>

        {/* Upcoming Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Visits</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.emptyText}>Loading appointments...</Text>
            </View>
          ) : appointments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={[styles.emptyIconContainer, { backgroundColor: '#f1f5f9' }]}>
                <Ionicons name="calendar-clear" size={32} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyCardText}>No upcoming appointments scheduled.</Text>
            </Card>
          ) : (
            appointments.map((appt) => (
              <Card key={appt._id} style={styles.apptCard}>
                <View style={styles.apptContent}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateMonth}>
                      {new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                    </Text>
                    <Text style={styles.dateDay}>
                      {new Date(appt.appointmentDate).getDate()}
                    </Text>
                  </View>
                  <View style={styles.apptInfo}>
                    <Text style={styles.apptPetName}>
                      {typeof appt.petId === 'object' ? appt.petId.name : 'Unknown Pet'}
                    </Text>
                    <View style={styles.vetRow}>
                      <Ionicons name="medical-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.apptVetName}>
                        {typeof appt.vetId === 'object' ? appt.vetId.name : 'Veterinarian'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                     <Text style={styles.statusText}>{appt.status}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  petList: {
    gap: 12,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyCardText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  addPetBtn: {
    width: '100%',
    borderRadius: 14,
  },
  apptCard: {
    marginBottom: 12,
    padding: 0,
    borderRadius: 18,
    overflow: 'hidden',
  },
  apptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dateBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 55,
  },
  dateMonth: {
    color: Colors.primary,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  dateDay: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  apptInfo: {
    marginLeft: 16,
    flex: 1,
  },
  apptPetName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  vetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  apptVetName: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
