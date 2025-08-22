import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          title: '',
          headerStyle: {
          },
          contentStyle: {
            backgroundColor: 'transparent'
          },
          animation: 'none'
        }}
      />
    </AuthProvider>
  );
}