import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const isVet = user?.role === 'veterinarian';
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryLight,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBg,
          borderTopColor: Colors.divider,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name={isAdmin ? 'admin-home' : isVet ? 'vet-home' : 'home'}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          href: isAdmin ? '/(tabs)/admin-home' : isVet ? '/(tabs)/vet-home' : '/(tabs)/home',
        }}
      />
      
      <Tabs.Screen
        name="pets"
        options={{
          title: 'Pets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw-outline" size={size} color={color} />
          ),
          href: (isVet || isAdmin) ? null : '/(tabs)/pets',
        }}
      />

      <Tabs.Screen
        name="vets"
        options={{
          title: 'Vets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
          href: isVet ? null : '/(tabs)/vets',
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
          href: isAdmin ? null : '/(tabs)/scan',
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          href: isAdmin ? null : '/(tabs)/community',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hide the default home if we are a vet, and vice versa */}
      <Tabs.Screen
        name={isAdmin ? 'home' : 'admin-home'}
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name={isAdmin ? 'vet-home' : isVet ? 'home' : 'vet-home'}
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
