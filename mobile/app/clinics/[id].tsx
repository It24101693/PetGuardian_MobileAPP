import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { vetService, Vet } from '../../services/vetService';
import { petService, Pet } from '../../services/petService';
import { appointmentService } from '../../services/appointmentService';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function ClinicDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [clinic, setClinic] = useState<Vet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection states
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  // Generate next 7 days for selection
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  const loadData = async () => {
    try {
      const [clinicData, petData] = await Promise.all([
        vetService.getVetById(id as string),
        petService.getMyPets(),
      ]);
      setClinic(clinicData);
      setPets(petData);
      if (petData.length > 0) setSelectedPet(petData[0]._id);
    } catch (error) {
      console.error('Failed to load clinic details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const openMaps = () => {
    if (!clinic?.location?.coordinates) return;
    const [lng, lat] = clinic.location.coordinates;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = clinic.clinicName || clinic.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  const handleBooking = async () => {
    const hasDoctors = (clinic as any).doctors?.length > 0;
    
    if (!selectedPet || (hasDoctors && !selectedDoctor) || !selectedSlot) {
      const missing = [];
      if (!selectedPet) missing.push('a pet');
      if (hasDoctors && !selectedDoctor) missing.push('a doctor');
      if (!selectedSlot) missing.push('a time slot');
      
      Alert.alert('Selection Required', `Please select ${missing.join(', ')}.`);
      return;
    }

    try {
      setBooking(true);
      const pet = pets.find(p => p._id === selectedPet);
      
      await appointmentService.createAppointment({
        petId: selectedPet,
        petName: pet?.name,
        petSpecies: pet?.species,
        vetId: clinic?._id,
        vetUserId: clinic?.userId, 
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason: selectedDoctor 
          ? `Checkup with Dr. ${selectedDoctor.name}`
          : 'General checkup with available staff',
        status: 'pending'
      });

      Alert.alert(
        'Success! 🐾',
        'Your appointment request has been sent. You will receive a notification once the clinic confirms.',
        [{ text: 'Great!', onPress: () => router.replace('/(tabs)/appointments') }]
      );
    } catch (error) {
      Alert.alert('Booking Failed', 'Something went wrong. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading || !clinic) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: clinic.profileImageUrl || defaultImage }} style={styles.image} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{clinic.clinicName || clinic.name}</Text>
              <Text style={styles.specialty}>{clinic.specialization?.join(', ') || 'Veterinary Care'}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>{clinic.rating || '4.8'}</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color={Colors.primaryLight} />
            <Text style={styles.addressText}>{clinic.address || 'Colombo, Sri Lanka'}</Text>
            <TouchableOpacity onPress={openMaps} style={styles.mapLink}>
              <Text style={styles.mapLinkText}>Show on Map</Text>
            </TouchableOpacity>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
              {dates.map(d => (
                <TouchableOpacity 
                  key={d.full} 
                  style={[styles.dateItem, selectedDate === d.full && styles.selectedDate]}
                  onPress={() => setSelectedDate(d.full)}
                >
                  <Text style={[styles.dateMonth, selectedDate === d.full && styles.selectedTextMuted]}>{d.month}</Text>
                  <Text style={[styles.dateNum, selectedDate === d.full && styles.selectedText]}>{d.dayNum}</Text>
                  <Text style={[styles.dateDay, selectedDate === d.full && styles.selectedTextMuted]}>{d.dayName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Pet Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Pet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petList}>
              {pets.map(p => (
                <TouchableOpacity 
                  key={p._id} 
                  style={[styles.petItem, selectedPet === p._id && styles.selectedPet]}
                  onPress={() => setSelectedPet(p._id)}
                >
                  <Text style={[styles.petName, selectedPet === p._id && styles.selectedText]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Doctor Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Doctors</Text>
            <View style={styles.doctorGrid}>
              {(clinic as any).doctors?.length > 0 ? (clinic as any).doctors.map((doc: any, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.doctorCard, selectedDoctor?.name === doc.name && styles.selectedDoctor]}
                  onPress={() => setSelectedDoctor(doc)}
                >
                  <View style={styles.doctorIcon}>
                    <Ionicons name="person" size={24} color={selectedDoctor?.name === doc.name ? Colors.white : Colors.primaryLight} />
                  </View>
                  <Text style={[styles.doctorName, selectedDoctor?.name === doc.name && styles.selectedText]}>Dr. {doc.name}</Text>
                  <Text style={[styles.doctorSpec, selectedDoctor?.name === doc.name && styles.selectedTextMuted]}>{doc.specialization || 'Vet'}</Text>
                </TouchableOpacity>
              )) : (
                <Text style={styles.emptyText}>No specific doctors listed. General staff available.</Text>
              )}
            </View>
          </View>

          {/* Time Slots */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Slots</Text>
            <View style={styles.slotGrid}>
              {['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'].map(slot => (
                <TouchableOpacity 
                  key={slot} 
                  style={[styles.slot, selectedSlot === slot && styles.selectedSlot]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotText, selectedSlot === slot && styles.selectedText]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button 
            title="Book Appointment" 
            onPress={handleBooking} 
            loading={booking}
            style={styles.bookBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  specialty: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d97706',
    marginLeft: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 20,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 10,
  },
  mapLink: {
    marginLeft: 10,
  },
  mapLinkText: {
    color: Colors.primaryLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  dateList: {
    flexDirection: 'row',
  },
  dateItem: {
    width: 70,
    height: 90,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  selectedDate: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
    ...Shadow.sm,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  dateDay: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  petList: {
    flexDirection: 'row',
  },
  petItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    marginRight: 10,
  },
  selectedPet: {
    backgroundColor: Colors.primaryLight,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  doctorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  doctorCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.sm,
  },
  selectedDoctor: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  doctorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  doctorSpec: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedText: {
    color: Colors.white,
  },
  selectedTextMuted: {
    color: 'rgba(255,255,255,0.7)',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slot: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSlot: {
    backgroundColor: Colors.primaryLight,
  },
  slotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  bookBtn: {
    height: 58,
    borderRadius: 18,
    marginTop: 20,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
