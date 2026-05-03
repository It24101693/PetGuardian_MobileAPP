import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AdminUserForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'owner' as 'owner' | 'veterinarian' | 'admin',
  });
  const router = useRouter();

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await adminService.createUser(formData);
      Alert.alert('Success', 'User created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Register New User</Text>
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
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Initial Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                secureTextEntry
                value={formData.password}
                onChangeText={(val) => setFormData({ ...formData, password: val })}
              />
            </View>
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
            title="Create User Account"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            The new user will be able to log in immediately with the credentials you provide here.
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
