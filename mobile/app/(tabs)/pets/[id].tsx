import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { petService, Pet } from '../../../services/petService';
import { healthService, HealthPassport, Vaccination, MedicalRecord } from '../../../services/healthService';
import { HealthPassportView } from '../../../components/pets/HealthPassportView';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Badge, statusToBadgeVariant } from '../../../components/ui/Badge';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [healthData, setHealthData] = useState<{
    passport: HealthPassport;
    vaccinations: Vaccination[];
    medicalRecords: MedicalRecord[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [petData, health] = await Promise.all([
        petService.getPetById(id as string),
        healthService.getPassportByPetId(id as string),
      ]);
      setPet(petData);
      setHealthData(health);
    } catch (error: any) {
      console.log('Error loading pet details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleDeletePet = () => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet profile and all its health records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await petService.deletePet(id as string);
              Alert.alert('Deleted', 'Pet profile has been removed.');
              router.replace('/(tabs)/home');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete pet profile.');
            }
          }
        },
      ]
    );
  };

  if (loading || !pet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const defaultImage = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';

  const capitalize = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  const calculateAge = () => {
    if (!pet.dateOfBirth) return '--';
    
    const birthDate = new Date(pet.dateOfBirth);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} ${years === 1 ? 'yr' : 'yrs'}${months > 0 ? ` ${months}m` : ''}`;
    }
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return defaultImage;
    if (url.startsWith('http') || url.startsWith('file:')) return url;
    // Relative path from local storage fallback
    const SERVER_URL = 'http://172.28.31.229:5001';
    return `${SERVER_URL}/${url}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header Actions */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.navActions}>
          <TouchableOpacity 
            onPress={() => router.push(`/(tabs)/pets/edit?id=${id}`)} 
            style={[styles.navBtn, { marginRight: 8 }]}
          >
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeletePet} style={styles.navBtn}>
            <Ionicons name="trash-outline" size={22} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={{ uri: getImageUrl(pet.imageUrl) }} style={styles.image} />
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{pet.name}</Text>
            </View>
            <Text style={styles.breed}>
              {pet.breed ? `${pet.breed} • ` : ''}{capitalize(pet.species)}
            </Text>
            <View style={styles.badges}>
              <Badge label={capitalize(pet.status) || 'Healthy'} variant={statusToBadgeVariant(pet.status || 'healthy')} />
              {pet.gender && (
                <View style={[styles.genderBadge, { backgroundColor: pet.gender.toLowerCase() === 'male' ? '#eff6ff' : '#fdf2f8' }]}>
                  <Ionicons 
                    name={pet.gender.toLowerCase() === 'male' ? 'male' : 'female'} 
                    size={14} 
                    color={pet.gender.toLowerCase() === 'male' ? Colors.info : '#db2777'} 
                  />
                  <Text style={[styles.genderText, { color: pet.gender.toLowerCase() === 'male' ? Colors.info : '#db2777' }]}>
                    {capitalize(pet.gender)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons name="fitness" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{pet.weight ? `${pet.weight} kg` : '--'}</Text>
          </View>
          <View style={styles.infoBox}>
             <View style={[styles.infoIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="color-palette" size={18} color="#d97706" />
            </View>
            <Text style={styles.infoLabel}>Color</Text>
            <Text style={styles.infoValue}>{pet.color || '--'}</Text>
          </View>
          <View style={styles.infoBox}>
            <View style={[styles.infoIcon, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="calendar" size={18} color={Colors.success} />
            </View>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{calculateAge()}</Text>
          </View>
        </View>

        <View style={styles.passportSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Health Passport</Text>
          </View>
          {healthData && (
            <HealthPassportView 
              passport={healthData.passport} 
              vaccinations={healthData.vaccinations} 
              medicalRecords={healthData.medicalRecords}
              onRefresh={loadData}
            />
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
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  navActions: {
    flexDirection: 'row',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    backgroundColor: Colors.background,
  },
  image: {
    width: '100%',
    height: 300,
  },
  headerInfo: {
    padding: Spacing.lg,
    marginTop: -40,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    ...Shadow.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  breed: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: Spacing.sm,
  },
  genderText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 20,
    alignItems: 'center',
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  passportSection: {
    padding: Spacing.lg,
    flex: 1,
    minHeight: 500,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
});
