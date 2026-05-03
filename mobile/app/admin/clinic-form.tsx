import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vetService } from '../../services/vetService';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { StatusBar } from 'expo-status-bar';

export default function ClinicFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    specialization: '',
    isEmergency: false,
    isAvailable: true,
    lat: '',
    lng: ''
  });

  useEffect(() => {
    if (isEditing) {
      loadClinic();
    }
  }, [id]);

  const loadClinic = async () => {
    try {
      const data = await vetService.getVetById(id as string);
      setFormData({
        name: data.name,
        clinicName: data.clinicName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        specialization: data.specialization?.join(', ') || '',
        isEmergency: data.isEmergency || false,
        isAvailable: data.isAvailable !== false,
        lat: data.location?.coordinates[1]?.toString() || '',
        lng: data.location?.coordinates[0]?.toString() || ''
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load clinic data.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.clinicName) {
      Alert.alert('Required Fields', 'Please enter at least the doctor name and clinic name.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        specialization: formData.specialization.split(',').map(s => s.trim()).filter(s => s),
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined
      };

      if (isEditing) {
        await vetService.updateVet(id as string, payload);
        Alert.alert('Success', 'Clinic updated successfully!');
      } else {
        await vetService.createVet(payload);
        Alert.alert('Success', 'Clinic added successfully!');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save clinic data.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Clinic' : 'Add New Clinic'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Clinic Name*</Text>
          <TextInput 
            style={styles.input}
            value={formData.clinicName}
            onChangeText={(v) => setFormData({...formData, clinicName: v})}
            placeholder="e.g. PawCare Hospital"
          />

          <Text style={styles.label}>Main Doctor Name*</Text>
          <TextInput 
            style={styles.input}
            value={formData.name}
            onChangeText={(v) => setFormData({...formData, name: v})}
            placeholder="e.g. Dr. John Doe"
          />

          <Text style={styles.label}>Specialties (comma separated)</Text>
          <TextInput 
            style={styles.input}
            value={formData.specialization}
            onChangeText={(v) => setFormData({...formData, specialization: v})}
            placeholder="Surgery, Vaccines, Dental"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Contact Email</Text>
          <TextInput 
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => setFormData({...formData, email: v})}
            placeholder="clinic@example.com"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput 
            style={styles.input}
            value={formData.phone}
            onChangeText={(v) => setFormData({...formData, phone: v})}
            placeholder="+94 11 234 5678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Full Address</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.address}
            onChangeText={(v) => setFormData({...formData, address: v})}
            placeholder="123 Pet Lane, Colombo 07"
            multiline
          />

          <Text style={styles.label}>City</Text>
          <TextInput 
            style={styles.input}
            value={formData.city}
            onChangeText={(v) => setFormData({...formData, city: v})}
            placeholder="Colombo"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput 
              style={styles.input}
              value={formData.lat}
              onChangeText={(v) => setFormData({...formData, lat: v})}
              placeholder="6.9271"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.col, { marginLeft: 12 }]}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput 
              style={styles.input}
              value={formData.lng}
              onChangeText={(v) => setFormData({...formData, lng: v})}
              placeholder="79.8612"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Emergency Services</Text>
            <Switch 
              value={formData.isEmergency}
              onValueChange={(v) => setFormData({...formData, isEmergency: v})}
              trackColor={{ false: '#d1d5db', true: Colors.danger }}
            />
          </View>
          <View style={[styles.switchRow, { marginTop: 16 }]}>
            <Text style={styles.switchLabel}>Visible in Search</Text>
            <Switch 
              value={formData.isAvailable}
              onValueChange={(v) => setFormData({...formData, isAvailable: v})}
              trackColor={{ false: '#d1d5db', true: Colors.success }}
            />
          </View>
        </View>

        <Button 
          title={isEditing ? "Update Clinic" : "Create Clinic"}
          onPress={handleSave}
          loading={loading}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  col: {
    flex: 1,
  },
  switchContainer: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
