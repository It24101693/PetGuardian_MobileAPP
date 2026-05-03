import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Custom colors
const TEAL = '#0d9488';
const DARK_TEXT = '#111827';
const GRAY_TEXT = '#4b5563';

// Reliable direct image URL
const HERO_IMAGE_URL = 'https://images.pexels.com/photos/6235227/pexels-photo-6235227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const handleDashboardNav = () => {
    if (user?.role === 'veterinarian') {
      router.push('/(tabs)/vet-home');
    } else {
      router.push('/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background Image */}
      <Image 
        source={{ uri: HERO_IMAGE_URL }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Smooth Gradient overlay to transition from image to white background */}
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.8)', '#ffffff']}
        style={styles.gradientOverlay}
        locations={[0, 0.6, 1]}
      />

      {/* Top Navigation Bar */}
      <SafeAreaView edges={['top']} style={styles.navBar}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={28} color={TEAL} />
          <Text style={styles.logoText}>PetGuardian</Text>
        </View>
        <View>
          <TouchableOpacity onPress={() => isAuthenticated ? handleDashboardNav() : router.push('/(auth)/login')} style={styles.loginBtn}>
            <Text style={styles.loginText}>{isAuthenticated ? 'Dashboard' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content Area */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          
          {/* Badge */}
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={14} color="#0f766e" style={{marginRight: 4}} />
            <Text style={styles.badgeText}><Text style={{color: '#0f766e', fontWeight: 'bold'}}>New:</Text> AI Symptom Analyzer</Text>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            Your Pet's Complete
          </Text>
          <Text style={styles.headingTeal}>
            Health Passport
          </Text>

          {/* Subtext */}
          <Text style={styles.subtext}>
            Digital health records, AI-powered care insights, and instant veterinary connections - all in one beautiful place.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {isAuthenticated ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleDashboardNav}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Get Started Free</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{marginLeft: 8}} />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Watch Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  heroImage: {
    width: width,
    height: height * 0.55,
    position: 'absolute',
    top: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.6,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: TEAL,
    marginLeft: 6,
    letterSpacing: -0.5,
  },
  loginBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_TEXT,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  textContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#ccfbf1',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '600',
  },
  heading: {
    fontSize: 42,
    fontWeight: '900',
    color: DARK_TEXT,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  headingTeal: {
    fontSize: 42,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: -1.5,
    marginBottom: 16,
    lineHeight: 48,
  },
  subtext: {
    fontSize: 17,
    color: GRAY_TEXT,
    lineHeight: 26,
    marginBottom: 40,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: TEAL,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    color: DARK_TEXT,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
