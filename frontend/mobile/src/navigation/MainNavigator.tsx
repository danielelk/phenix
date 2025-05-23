import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PlanningScreen from '../screens/planning/PlanningScreen';
import ActivitiesScreen from '../screens/activities/ActivitiesScreen';
import AdherentsScreen from '../screens/adherents/AdherentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../styles/theme';

export type MainTabParamList = {
  Planning: undefined;
  Activities: undefined;
  Adherents: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
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
        name="Planning"
        component={PlanningScreen}
        options={{
          title: 'Planning',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: 'Activités',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="run" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Adherents"
        component={AdherentsScreen}
        options={{
          title: 'Adhérents',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
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

export default MainNavigator;