import { Stack } from 'expo-router';
import { Colors } from '../../../constants/theme';

export default function PetsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.white,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'My Pets',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: 'Add Pet',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Pet Details',
          headerTitleAlign: 'center',
        }} 
      />
    </Stack>
  );
}
