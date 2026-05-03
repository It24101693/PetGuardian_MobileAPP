import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService, AdminStats } from '../../services/adminService';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, FontSize, Radius, Shadow, FontWeight } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AdminHomeScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Admin Command Center</Text>
                <Text style={styles.subtitle}>System Health & User Management</Text>
              </View>
              <TouchableOpacity 
                style={styles.notifyBtn}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications" size={24} color={Colors.white} />
                <View style={styles.badge} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="people" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="paw" size={20} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>{stats?.totalPets || 0}</Text>
            <Text style={styles.statLabel}>Total Pets</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="medical" size={20} color="#22c55e" />
            </View>
            <Text style={styles.statValue}>{stats?.vets || 0}</Text>
            <Text style={styles.statLabel}>Total Vets</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => router.push('/admin/users')}
            >
              <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.actionGradient}>
                <Ionicons name="people-circle" size={28} color={Colors.white} />
                <Text style={styles.actionText}>Manage Users</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => router.push('/admin/clinics')}
            >
              <LinearGradient colors={['#0d9488', '#0f766e']} style={styles.actionGradient}>
                <Ionicons name="business" size={28} color={Colors.white} />
                <Text style={styles.actionText}>Clinic Approvals</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Registrations</Text>
            <TouchableOpacity onPress={() => router.push('/admin/users')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {stats?.recentUsers.map((u, i) => (
            <Card key={u._id} style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{u.fullName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.fullName}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: u.role === 'admin' ? '#fef3c7' : u.role === 'veterinarian' ? '#dcfce7' : '#f1f5f9' }]}>
                <Text style={[styles.roleText, { color: u.role === 'admin' ? '#d97706' : u.role === 'veterinarian' ? '#166534' : '#64748b' }]}>
                  {u.role}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  notifyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: -25,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  seeAll: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadow.md,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  actionText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  }
});
