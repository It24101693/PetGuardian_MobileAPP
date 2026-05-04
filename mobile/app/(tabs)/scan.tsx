import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize, Shadow, Radius, FontWeight } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { scanService, ScanResult } from '../../services/scanService';
import { petService, Pet } from '../../services/petService';
import { healthService } from '../../services/healthService';
import { Card } from '../../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { API_BASE_URL } from '../../services/api';

const BASE_URL = API_BASE_URL || 'http://172.28.31.229:5001/api';

export default function ScanScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return 'https://via.placeholder.com/100';
    if (url.startsWith('http') || url.startsWith('file:')) return url;
    
    let cleanUrl = url;
    if (url.includes('uploads')) {
      cleanUrl = 'uploads' + url.split('uploads')[1];
    }
    
    const SERVER_URL = BASE_URL.replace('/api', '');
    return `${SERVER_URL}/${cleanUrl.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const data = await petService.getMyPets();
      setPets(data);
      if (data.length > 0) setSelectedPetId(data[0]._id);
    } catch (error) {
      console.error(error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to scan images.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to scan.');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    try {
      setLoading(true);
      const res = await scanService.analyzeImage(image);
      setResult(res);
      
      // Auto-save to medical records if pet is selected
      if (selectedPetId) {
        try {
          const { passport } = await healthService.getPassportByPetId(selectedPetId);
          await healthService.addMedicalRecord(passport._id, {
            title: `AI Disease Scan: ${res.diseaseName}`,
            type: 'diagnosis',
            diagnosis: res.diseaseName,
            treatment: res.treatment,
            notes: `AI Confidence: ${(res.probability * 100).toFixed(1)}%. ${res.urgencyMessage || ''}`,
            recordDate: new Date().toISOString()
          });
          // Find selected pet name for alert
          const petName = pets.find(p => p._id === selectedPetId)?.name || 'your pet';
          Alert.alert('Success', `AI Analysis complete and saved to ${petName}'s medical records.`);
        } catch (saveErr) {
          console.log('Failed to save auto-record:', saveErr);
        }
      }
    } catch (error: any) {
      Alert.alert('Scan Failed', 'Please ensure the AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  const renderPetSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. Select Pet</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petList}>
        {pets.map(pet => (
          <TouchableOpacity 
            key={pet._id}
            onPress={() => setSelectedPetId(pet._id)}
            style={[styles.petChip, selectedPetId === pet._id ? styles.petChipActive : null]}
          >
            <Image 
              source={{ 
                uri: getImageUrl(pet.imageUrl),
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
              }} 
              style={styles.petThumb} 
            />
            <Text style={[styles.petName, selectedPetId === pet._id && styles.petNameActive]}>{pet.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Disease Scanner</Text>
          <Text style={styles.subtitle}>Our AI will help identify skin issues and more.</Text>
        </View>

        {renderPetSelector()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Upload Photo</Text>
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image }} style={styles.preview} />
              <TouchableOpacity style={styles.removeImg} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={32} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={48} color={Colors.divider} />
              <Text style={styles.placeholderText}>Clear photo of the affected area</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.iconBtn} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color={Colors.primary} />
                  <Text style={styles.iconBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
                  <Ionicons name="images" size={20} color={Colors.primary} />
                  <Text style={styles.iconBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Button 
          title="Analyze Now" 
          onPress={analyzeImage} 
          loading={loading} 
          disabled={!image}
          style={styles.mainBtn}
          icon={<Ionicons name="sparkles" size={20} color={Colors.white} />}
        />

        {result && (
          <View style={styles.resultContainer}>
            <Card style={[styles.resultCard, result.isEmergency ? styles.emergencyCard : null]}>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultTitle, result.isEmergency ? { color: Colors.danger } : null]}>
                    {result.isEmergency ? '⚠️ EMERGENCY DETECTED' : '✓ ANALYSIS COMPLETE'}
                  </Text>
                  <Text style={styles.diseaseName}>{result.diseaseName}</Text>
                </View>
                <View style={styles.confBadge}>
                  <Text style={styles.confText}>{(result.probability * 100).toFixed(0)}% Conf.</Text>
                </View>
              </View>

              {result.urgencyMessage && (
                <View style={[styles.alertBox, { backgroundColor: result.isEmergency ? '#fef2f2' : '#f0fdf4' }]}>
                  <Ionicons 
                    name={result.isEmergency ? "alert-circle" : "checkmark-circle"} 
                    size={20} 
                    color={result.isEmergency ? Colors.danger : Colors.success} 
                  />
                  <Text style={[styles.alertText, { color: result.isEmergency ? Colors.danger : Colors.success }]}>
                    {result.urgencyMessage}
                  </Text>
                </View>
              )}

              <Text style={styles.infoLabel}>Treatment Suggestion:</Text>
              <Text style={styles.treatmentText}>{result.treatment}</Text>

              {result.homeCare && result.homeCare.length > 0 && (
                <View style={styles.homeCareBox}>
                  <Text style={styles.infoLabel}>Home Care Tips:</Text>
                  {result.homeCare.map((tip, i) => (
                    <Text key={i} style={styles.tipText}>• {tip}</Text>
                  ))}
                </View>
              )}

              <View style={styles.resultFooter}>
                {result.isEmergency ? (
                  <TouchableOpacity 
                    style={styles.emergencyBtn} 
                    onPress={() => router.push('/(tabs)/vets')}
                  >
                    <Ionicons name="medical" size={20} color={Colors.white} />
                    <Text style={styles.emergencyBtnText}>Book Emergency Appointment</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.saveAlert}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      <Text style={styles.saveAlertText}>
                        Saved to {pets.find(p => p._id === selectedPetId)?.name || 'pet'}'s records.
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.bookBtn} 
                      onPress={() => router.push('/(tabs)/vets')}
                    >
                      <Ionicons name="calendar" size={18} color={Colors.primary} />
                      <Text style={styles.bookBtnText}>Book Follow-up Appointment</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Card>
          </View>
        )}

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
    paddingBottom: 40,
  },
  header: {
    padding: Spacing.lg,
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: Spacing.lg,
    marginBottom: 12,
  },
  petList: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingRight: 16,
    borderRadius: 50,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  petChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#eff6ff',
  },
  petThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  petNameActive: {
    color: Colors.primary,
  },
  previewContainer: {
    marginHorizontal: Spacing.lg,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    ...Shadow.md,
  },
  removeImg: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
  placeholder: {
    marginHorizontal: Spacing.lg,
    height: 200,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    color: Colors.textMuted,
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  iconBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  mainBtn: {
    marginHorizontal: Spacing.lg,
    height: 56,
    borderRadius: 16,
  },
  resultContainer: {
    padding: Spacing.lg,
  },
  resultCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.lg,
  },
  emergencyCard: {
    borderColor: Colors.danger + '40',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  confBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  alertBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  homeCareBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  resultFooter: {
    marginTop: 10,
  },
  emergencyBtn: {
    backgroundColor: Colors.danger,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadow.md,
  },
  emergencyBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  bookBtn: {
    marginTop: 16,
    backgroundColor: '#eff6ff',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  bookBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  saveAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  saveAlertText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  }
});
