import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AdminUserForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    role: 'owner' as 'owner' | 'veterinarian' | 'admin',
  });
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.id as string | undefined;
  const isEditMode = !!userId;

  // Load user data if editing
  useEffect(() => {
    if (isEditMode) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setInitialLoading(true);
      const user = await adminService.getUserById(userId!);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        password: '', // Don't populate password for security
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'owner',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load user data.');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    // For edit mode, password is optional
    if (!formData.fullName || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Email).');
      return;
    }

    // Password is required only for create mode
    if (!isEditMode && !formData.password) {
      Alert.alert('Error', 'Password is required when creating a new user.');
      return;
    }

    // Validate email format (must be valid email)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address (e.g., user@example.com).');
      return;
    }

    // Validate Gmail specifically if you want only Gmail
    // Uncomment this if you want to restrict to Gmail only
    // if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
    //   Alert.alert('Validation Error', 'Only Gmail addresses are allowed.');
    //   return;
    // }

    // Validate phone number if provided
    if (formData.phoneNumber) {
      // Remove spaces, dashes, and parentheses for validation
      const cleanPhone = formData.phoneNumber.replace(/[\s\-()]/g, '');
      
      // Check if it's a valid phone number (10-15 digits, optionally starting with +)
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        Alert.alert('Validation Error', 'Please enter a valid phone number (10-15 digits, e.g., +1234567890 or 0771234567).');
        return;
      }
    }

    // Validate password length (only if password is provided)
    if (formData.password && formData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    // Validate username if provided
    if (formData.username) {
      if (formData.username.length < 3) {
        Alert.alert('Validation Error', 'Username must be at least 3 characters.');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        Alert.alert('Validation Error', 'Username can only contain letters, numbers, and underscores.');
        return;
      }
    }

    setLoading(true);
    try {
      // Prepare data - don't send empty password in edit mode
      const submitData: any = { ...formData };
      if (isEditMode && !submitData.password) {
        delete submitData.password;
      }

      if (isEditMode) {
        await adminService.updateUser(userId!, submitData);
        Alert.alert('Success', 'User updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await adminService.createUser(submitData);
        Alert.alert('Success', 'User created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${isEditMode ? 'update' : 'create'} user.`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? 'Edit User' : 'Register New User'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={formData.fullName}
                onChangeText={(val) => setFormData({ ...formData, fullName: val })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => setFormData({ ...formData, email: val })}
                editable={!isEditMode}
              />
            </View>
            {isEditMode && (
              <Text style={styles.helperText}>Email cannot be changed</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="+1234567890 or 0771234567"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(val) => setFormData({ ...formData, phoneNumber: val })}
              />
            </View>
            <Text style={styles.helperText}>10-15 digits, can include + prefix</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="at-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Auto-generated from email if empty"
                autoCapitalize="none"
                value={formData.username}
                onChangeText={(val) => setFormData({ ...formData, username: val })}
              />
            </View>
            <Text style={styles.helperText}>Leave empty to use email prefix as username</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isEditMode ? 'New Password (Optional)' : 'Initial Password'}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder={isEditMode ? "Leave empty to keep current password" : "Min. 6 characters"}
                secureTextEntry
                value={formData.password}
                onChangeText={(val) => setFormData({ ...formData, password: val })}
              />
            </View>
            {isEditMode && (
              <Text style={styles.helperText}>Leave empty to keep current password</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User Role</Text>
            <View style={styles.roleContainer}>
              {(['owner', 'veterinarian', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleBtn,
                    formData.role === r && styles.roleBtnActive
                  ]}
                  onPress={() => setFormData({ ...formData, role: r })}
                >
                  <Text style={[
                    styles.roleBtnText,
                    formData.role === r && styles.roleBtnTextActive
                  ]}>
                    {r === 'owner' ? 'Pet Owner' : r === 'veterinarian' ? 'Vet' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={isEditMode ? "Update User" : "Create User Account"}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            {isEditMode 
              ? 'Update user information. Leave password empty to keep the current password.'
              : 'The new user will be able to log in immediately with the credentials you provide here.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  scroll: {
    padding: 24,
  },
  form: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 32,
    ...Shadow.md,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#1e293b',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  roleBtnTextActive: {
    color: Colors.white,
  },
  submitBtn: {
    marginTop: 10,
    height: 55,
    borderRadius: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 20,
    marginTop: 24,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  }
});
