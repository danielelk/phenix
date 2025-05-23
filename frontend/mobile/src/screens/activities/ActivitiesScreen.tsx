import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ActivityDetailScreen from './ActivityDetailScreen';
import ActivityPresenceScreen from './ActivityPresenceScreen';
import ActivityExpensesScreen from './ActivityExpensesScreen';
import { colors } from '../../styles/theme';

const Stack = createStackNavigator();

const ActivitiesScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.backgroundLight,
      }}
    >
      <Stack.Screen 
        name="ActivityDetail" 
        component={ActivityDetailScreen}
        options={{ title: 'Détails de l\'activité' }}
      />
      <Stack.Screen 
        name="ActivityPresence" 
        component={ActivityPresenceScreen}
        options={{ title: 'Gestion de la présence' }}
      />
      <Stack.Screen 
        name="ActivityExpenses" 
        component={ActivityExpensesScreen}
        options={{ title: 'Gestion des dépenses' }}
      />
    </Stack.Navigator>
  );
};

export default ActivitiesScreen;