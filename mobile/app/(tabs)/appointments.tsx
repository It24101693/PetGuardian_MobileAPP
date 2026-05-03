import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appointmentService, Appointment } from '../../services/appointmentService';
import { Card } from '../../components/ui/Card';
import { Badge, statusToBadgeVariant } from '../../components/ui/Badge';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';

export default function AppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = async () => {
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
    loadAppointments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const petName = typeof item.petId === 'object' ? item.petId.name : 'Unknown Pet';
    const vetName = typeof item.vetId === 'object' ? item.vetId.name : 'Unassigned Vet';
    const date = new Date(item.appointmentDate);

    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.date}>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <Badge label={item.status} variant={statusToBadgeVariant(item.status)} size="sm" />
        </View>
        
        <Text style={styles.petName}>{petName}</Text>
        <Text style={styles.vetName}>Dr. {vetName}</Text>
        
        {item.reason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText}>{item.reason}</Text>
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: Colors.textPrimary }]}>Appointments</Text>
        <Button title="Book New" onPress={() => router.push('/clinics')} size="sm" />
      </View>

      <FlatList
        data={appointments}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No appointments booked yet.</Text>
          </View>
        }
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  list: {
    padding: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  date: {
    color: Colors.primaryLight,
    fontWeight: '600',
    fontSize: FontSize.sm,
  },
  petName: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  vetName: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  reasonBox: {
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.sm,
    borderRadius: 6,
    marginTop: Spacing.xs,
  },
  reasonLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  reasonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
  },
});
