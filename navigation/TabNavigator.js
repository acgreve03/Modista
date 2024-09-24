// navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserProfile from './screens/Profile/UserProfile';
import HomeScreen from './screens/HomeScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={UserProfile} 
        options={{ title: 'User Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

