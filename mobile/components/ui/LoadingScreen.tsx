import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.paw}>
        <Text style={styles.emoji}>🐾</Text>
      </View>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paw: {
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
  },
  spinner: {
    marginBottom: 12,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
