import React from 'react';
import { View } from 'react-native';
import { LoadingScreen } from '../components/ui/LoadingScreen';

// This index file just serves as a mount point.
// The routing logic in _layout.tsx will immediately redirect 
// to either /(auth)/welcome or /(tabs)/home based on auth state.
export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <LoadingScreen />
    </View>
  );
}
