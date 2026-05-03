import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize, Radius, Shadow, FontWeight } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        }
      }
    ]);
  };

  const menuGroups = [
    ...(user?.role === 'admin' ? [{
      title: 'Admin Control Center',
      items: [
        { icon: 'business', label: 'Manage Clinics', color: '#0d9488', route: '/admin/clinics' },
        { icon: 'people', label: 'Manage Users', color: '#6366f1', route: '/admin/users' },
        { icon: 'analytics', label: 'System Analytics', color: '#f59e0b', route: '/admin/stats' },
      ]
    }] : []),
    {
      title: 'Account Settings',
      items: [
        { icon: 'person', label: 'Edit Profile', color: '#6366f1' },
        { icon: 'notifications', label: 'Notifications', color: '#f59e0b', route: '/notifications' },
        { icon: 'lock-closed', label: 'Privacy & Security', color: '#10b981' },
      ]
    },
    {
      title: 'Support & About',
      items: [
        { icon: 'help-circle', label: 'Help & Support', color: '#0d9488' },
        { icon: 'information-circle', label: 'About PetGuardian', color: '#64748b' },
      ]
    }
  ];

  const handleMenuPress = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else {
      Alert.alert('Coming Soon', `${item.label} feature is being polished!`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <LinearGradient 
          colors={['#0d9488', '#0f766e']} 
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
                <TouchableOpacity style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.name}>{user?.fullName}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#5eead4" />
                <Text style={styles.roleText}>
                  {user?.role === 'admin' ? 'System Admin' : user?.role === 'veterinarian' ? 'Veterinarian' : 'Pet Owner'}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>My Pets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Jan 24</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuWrapper}>
          {menuGroups.map((group, gIdx) => (
            <View key={gIdx} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupCard}>
                {group.items.map((item, iIdx) => (
                  <TouchableOpacity 
                    key={iIdx} 
                    style={[styles.menuItem, iIdx === group.items.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => handleMenuPress(item)}
                  >
                    <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out of Account</Text>
          </TouchableOpacity>
          <Text style={styles.version}>PetGuardian Mobile v2.1.0 • Proudly Made for Pets</Text>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: 20,
  },
  avatarWrapper: {
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0d9488',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
  },
  roleText: {
    color: '#5eead4',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 30,
    marginTop: -25,
    borderRadius: 24,
    padding: 20,
    ...Shadow.md,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f1f5f9',
  },
  menuWrapper: {
    padding: 24,
    marginTop: 10,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef2f2',
    width: '100%',
    padding: 18,
    borderRadius: 20,
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 16,
  },
  version: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
