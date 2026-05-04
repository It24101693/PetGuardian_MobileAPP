import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { Pet } from '../../services/petService';
import { Card } from '../ui/Card';
import { Badge, statusToBadgeVariant } from '../ui/Badge';
import { Colors, Radius, Spacing, FontSize, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

// Fallback for local development
import { API_BASE_URL, AI_BASE_URL as AI_SERVER, PUBLIC_WEB_URL } from '../../services/api';
const BASE_URL = API_BASE_URL || 'http://172.28.31.229:5001/api';

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  const [qrVisible, setQrVisible] = useState(false);
  const defaultImage = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';

  const publicProfileUrl = `${PUBLIC_WEB_URL}/api/pets/public/qr/${pet.qrCode}`;

  const getImageUrl = (url: string | undefined) => {
    if (!url) return defaultImage;
    if (url.startsWith('http') || url.startsWith('file:')) return url;
    // Relative path from local storage fallback
    const SERVER_URL = BASE_URL.replace('/api', '');
    return `${SERVER_URL}/${url}`;
  };

  const toggleQrModal = (e?: any) => {
    e?.stopPropagation();
    setQrVisible(!qrVisible);
  };

  return (
    <>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Card style={styles.card} padding={0}>
          <Image
            source={{ 
              uri: getImageUrl(pet.imageUrl),
              headers: { 'Bypass-Tunnel-Reminder': 'true' }
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {pet.name}
                </Text>
                {pet.gender && (
                  <Ionicons
                    name={pet.gender.toLowerCase() === 'male' ? 'male' : 'female'}
                    size={16}
                    color={pet.gender.toLowerCase() === 'male' ? Colors.info : '#ec4899'}
                    style={styles.genderIcon}
                  />
                )}
              </View>
              
              <TouchableOpacity 
                onPress={toggleQrModal}
                style={styles.qrButton}
                activeOpacity={0.6}
              >
                <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.species}>
              {pet.breed ? `${pet.breed} • ` : ''}{pet.species}
            </Text>

            <View style={styles.footer}>
              <Badge
                label={pet.status || 'Active'}
                variant={statusToBadgeVariant(pet.status || 'active')}
                size="sm"
              />
              {pet.weight && (
                <Text style={styles.weight}>{pet.weight} kg</Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* QR Code Modal */}
      <Modal
        visible={qrVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setQrVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pet.name}'s QR Code</Text>
              <TouchableOpacity onPress={() => setQrVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              If ${pet.name} gets lost, scanning this code will show your contact details to the finder.
            </Text>

            <View style={styles.qrContainer}>
              <QRCode
                value={publicProfileUrl}
                size={200}
                color={Colors.textPrimary}
                backgroundColor="white"
              />
            </View>

            <View style={styles.tagPreview}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
              <Text style={styles.tagText}>Attach this QR code to {pet.name}'s collar.</Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.surfaceAlt,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  genderIcon: {
    marginTop: 2,
  },
  qrButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  species: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weight: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...Shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    marginBottom: 24,
    ...Shadow.sm,
  },
  tagPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '10',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  tagText: {
    fontSize: 12,
    color: Colors.info,
    marginLeft: 8,
    flex: 1,
  },
});
