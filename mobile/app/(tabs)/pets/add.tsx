import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { petService } from '../../../services/petService';
import { scanService } from '../../../services/scanService';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PetImagePicker } from '../../../components/ui/PetImagePicker';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPetScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [birthday, setBirthday] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleImagePicked = async (uri: string) => {
    setImage(uri);
    
    // Trigger AI Breed/Species prediction
    try {
      setAnalyzing(true);
      const result = await scanService.predictBreed(uri);
      
      if (result.confidence > 0.4) {
        setSpecies(result.species.charAt(0).toUpperCase() + result.species.slice(1));
        setBreed(result.breed);
        
        // Optional toast or feedback
        Alert.alert(
          'AI Prediction', 
          `We think your pet is a ${result.breed} (${result.species})!`,
          [{ text: 'Great!' }]
        );
      }
    } catch (error) {
      console.log('AI Prediction failed:', error);
      // Don't alert user, just let them fill manually
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!name || !species) {
      Alert.alert('Error', 'Name and Species are required');
      return;
    }

    try {
      setLoading(true);
      await petService.createPet({
        name,
        species: species.toLowerCase(),
        breed,
        gender: gender.toLowerCase(),
        weight: weight ? parseFloat(weight) : undefined,
        color,
        dateOfBirth: birthday || undefined,
        imageUrl: image || undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Pet</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI Image Picker */}
          <PetImagePicker 
            image={image} 
            onImagePicked={handleImagePicked} 
            loading={analyzing} 
          />

          <Card style={styles.card}>
            <Input
              label="Pet Name *"
              placeholder="e.g. Max"
              value={name}
              onChangeText={setName}
              leftIcon="heart-outline"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Species *</Text>
                <View style={styles.segmentedControl}>
                  {['Dog', 'Cat', 'Other'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.segment, species === s && styles.segmentActive]}
                      onPress={() => setSpecies(s)}
                    >
                      <Text style={[styles.segmentText, species === s && styles.segmentTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.segmentedControl}>
                  {['Male', 'Female'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.segment, gender === g && styles.segmentActive]}
                      onPress={() => setGender(g)}
                    >
                      <Ionicons 
                        name={g === 'Male' ? 'male' : 'female'} 
                        size={16} 
                        color={gender === g ? Colors.white : Colors.textMuted} 
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Input
              label="Breed"
              placeholder="e.g. Golden Retriever"
              value={breed}
              onChangeText={setBreed}
              leftIcon="paw-outline"
              rightIcon={analyzing ? undefined : "sparkles-outline"}
            />

            <Input
              label="Birthday (YYYY-MM-DD)"
              placeholder="e.g. 2022-05-20"
              value={birthday}
              onChangeText={setBirthday}
              leftIcon="calendar-outline"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: Spacing.md }}>
                <Input
                  label="Weight (kg)"
                  placeholder="e.g. 15"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  leftIcon="fitness-outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Color"
                  placeholder="e.g. Golden"
                  value={color}
                  onChangeText={setColor}
                  leftIcon="color-palette-outline"
                />
              </View>
            </View>
          </Card>

          <Button 
            title="Save Pet Profile" 
            onPress={handleSave} 
            loading={loading} 
            style={styles.saveBtn} 
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    ...Shadow.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.sm,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  saveBtn: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    height: 56,
  },
});
