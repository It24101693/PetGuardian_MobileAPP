import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Badge, statusToBadgeVariant } from '../../components/ui/Badge';

export default function VetHomeScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const todayAppts = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Dr. {user?.fullName?.split(' ')[0]}</Text>
            <Text style={styles.subtitle}>Veterinarian Dashboard</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="calendar" size={32} color={Colors.primaryLight} />
            <Text style={styles.statValue}>{todayAppts.length}</Text>
            <Text style={styles.statLabel}>Today's Appts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="medical" size={32} color={Colors.success} />
            <Text style={styles.statValue}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Total Appts</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>

          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : todayAppts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="cafe-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyCardText}>No appointments today.</Text>
            </Card>
          ) : (
            todayAppts.map((appt) => (
              <Card key={appt._id} style={{ marginBottom: Spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.apptTime}>
                    {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Badge label={appt.status} variant={statusToBadgeVariant(appt.status)} size="sm" />
                </View>
                <Text style={styles.apptPet}>
                  {typeof appt.petId === 'object' ? appt.petId.name : 'Unknown Pet'} 
                  {typeof appt.petId === 'object' && appt.petId.species ? ` (${appt.petId.species})` : ''}
                </Text>
                <Text style={styles.apptOwner}>
                  Owner: {typeof appt.ownerId === 'object' ? appt.ownerId.fullName : 'Unknown'}
                </Text>
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
  },
  header: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 0.48,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statValue: {
    fontSize: FontSize.display,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyCardText: {
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
  },
  apptTime: {
    color: Colors.primaryLight,
    fontWeight: 'bold',
    fontSize: FontSize.md,
  },
  apptPet: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  apptOwner: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
});
