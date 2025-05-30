import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PlanningScreen from '../screens/planning/PlanningScreen';
import AdherentsScreen from '../screens/adherents/AdherentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ActivityDetailScreen from '../screens/activities/ActivityDetailScreen';
import ActivityPresenceScreen from '../screens/activities/ActivityPresenceScreen';
import ActivityExpensesScreen from '../screens/activities/ActivityExpensesScreen';
import ParticipantDetailsScreen from '../screens/adherents/ParticipantDetailsScreen';
import { colors } from '../styles/theme';

export type MainTabParamList = {
  PlanningTab: undefined;
  AdherentsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ActivityDetail: { activityId: number };
  ActivityPresence: { activityId: number; participants: any[] };
  ActivityExpenses: { activityId: number };
  ParticipantDetails: { participant: any };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundLight,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.backgroundLight,
      }}
    >
      <Tab.Screen
        name="PlanningTab"
        component={PlanningScreen}
        options={{
          title: 'Planning',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdherentsTab"
        component={AdherentsScreen}
        options={{
          title: 'Adhérents',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
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
        name="MainTabs" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
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
      <Stack.Screen 
        name="ParticipantDetails" 
        component={ParticipantDetailsScreen}
        options={{ title: 'Détails de l\'adhérent' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;