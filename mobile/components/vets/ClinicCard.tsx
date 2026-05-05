import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Vet } from '../../services/vetService';
import { Card } from '../ui/Card';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ClinicCardProps {
  clinic: Vet;
  onPress: () => void;
}

export function ClinicCard({ clinic, onPress }: ClinicCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <Card style={styles.card} padding={0}>
        <Image 
          source={{ uri: clinic.profileImageUrl || defaultImage }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>{clinic.clinicName || clinic.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.rating}>{clinic.rating || '4.8'}</Text>
            </View>
          </View>
          
          <Text style={styles.specialties} numberOfLines={1}>
            {clinic.specialization?.join(' • ') || 'General Veterinary Care'}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.infoText} numberOfLines={1}>{clinic.city || 'Colombo'}</Text>
            </View>
            <View style={[styles.infoItem, { marginLeft: 12 }]}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.infoText}>09:00 AM - 05:00 PM</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.emergencyBadge}>
              <Ionicons name={clinic.isEmergency ? "flash" : "shield-checkmark"} size={12} color={clinic.isEmergency ? Colors.danger : Colors.success} />
              <Text style={[styles.emergencyText, { color: clinic.isEmergency ? Colors.danger : Colors.success }]}>
                {clinic.isEmergency ? 'Emergency' : 'Available'}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={onPress}>
              <Text style={styles.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Shadow.md,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceAlt,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d97706',
    marginLeft: 4,
  },
  specialties: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emergencyText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  bookBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    ...Shadow.sm,
  },
  bookBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
