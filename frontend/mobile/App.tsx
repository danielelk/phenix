import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/styles/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AuthProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}