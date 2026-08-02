import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TimelineScreen } from './src/screens/TimelineScreen';
import { LessonsScreen } from './src/screens/LessonsScreen';
import { ChecklistsScreen } from './src/screens/ChecklistsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#090A0F',
    card: '#12131C',
    text: '#F8FAFC',
    border: '#1E2030',
    primary: '#6366F1',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={customDarkTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#12131C',
            borderTopColor: '#1E2030',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#64748B',
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'time';

            if (route.name === 'Timeline') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Lessons') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Checklists') {
              iconName = focused ? 'checkbox' : 'checkbox-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Timeline" component={TimelineScreen} options={{ tabBarLabel: 'Timeline' }} />
        <Tab.Screen name="Lessons" component={LessonsScreen} options={{ tabBarLabel: '503 Lessons' }} />
        <Tab.Screen name="Checklists" component={ChecklistsScreen} options={{ tabBarLabel: 'Checklists' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
