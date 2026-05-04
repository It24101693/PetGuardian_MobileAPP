import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation Error States
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });

  const validateForm = () => {
    let isValid = true;
    let newErrors = { fullName: '', username: '', email: '', password: '' };

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
      isValid = false;
    }
    
    if (!username.trim() || username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return; 
    }

    try {
      setLoading(true);
      const user = await register({
        fullName,
        username,
        email,
        phoneNumber: phone,
        password,
        role: 'owner',
      });

      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Back Button */}
        <View style={styles.navHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join PetGuardian today.</Text>
          </View>

          <View style={styles.card}>

            <Input
              label="Full Name *"
              placeholder="John Doe"
              value={fullName}
              onChangeText={(text) => { setFullName(text); setErrors(prev => ({...prev, fullName: ''})) }}
              leftIcon="person-outline"
              error={errors.fullName}
            />
            
            <View style={{ height: Spacing.md }} />

            <Input
              label="Username *"
              placeholder="johndoe123"
              autoCapitalize="none"
              value={username}
              onChangeText={(text) => { setUsername(text); setErrors(prev => ({...prev, username: ''})) }}
              leftIcon="at-circle-outline"
              error={errors.username}
            />

            <View style={{ height: Spacing.md }} />

            <Input
              label="Email *"
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrors(prev => ({...prev, email: ''})) }}
              leftIcon="mail-outline"
              error={errors.email}
            />

            <View style={{ height: Spacing.md }} />

            <Input
              label="Phone Number"
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              leftIcon="call-outline"
            />
            
            <View style={{ height: Spacing.md }} />

            <Input
              label="Password *"
              placeholder="Create a password"
              isPassword
              value={password}
              onChangeText={(text) => { setPassword(text); setErrors(prev => ({...prev, password: ''})) }}
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <Button
              title="Sign Up"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  navHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
    marginBottom: Spacing.xl,
  },
  registerButton: {
    marginTop: Spacing.xl,
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  loginText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
});
