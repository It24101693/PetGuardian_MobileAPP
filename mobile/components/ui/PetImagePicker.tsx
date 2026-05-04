import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow, FontSize } from '../../constants/theme';

interface PetImagePickerProps {
  image: string | null;
  onImagePicked: (uri: string) => void;
  loading?: boolean;
}

export function PetImagePicker({ image, onImagePicked, loading }: PetImagePickerProps) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'We need camera roll permissions to upload your pet photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'We need camera permissions to take a pet photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.imageContainer, loading && styles.loading]} 
        onPress={() => {
          Alert.alert(
            'Select Photo',
            'Choose a way to add your pet photo',
            [
              { text: 'Camera', onPress: takePhoto },
              { text: 'Gallery', onPress: pickImage },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
        activeOpacity={0.8}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={32} color={Colors.textMuted} />
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
        
        {loading && (
          <View style={styles.overlay}>
             <Ionicons name="sparkles" size={24} color={Colors.white} />
             <Text style={styles.overlayText}>AI Analyzing...</Text>
          </View>
        )}

        <View style={styles.editBadge}>
          <Ionicons name="add" size={16} color={Colors.white} />
        </View>
      </TouchableOpacity>
      
      <Text style={styles.tip}>Tip: High quality photos help AI detect breed!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
    borderWidth: 4,
    borderColor: Colors.white,
    position: 'relative',
    overflow: 'hidden',
  },
  loading: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 70, 229, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tip: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
});
