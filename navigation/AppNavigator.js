// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserProfile from '../screens/Profile/UserProfile';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//import EditProfile from '../screens/Profile/EditProfile';

const Tab = createBottomTabNavigator(); // Ensure this line is present
const Stack = createStackNavigator();
// Stack Navigator for Profile
const ProfileStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="UserProfile" component={UserProfile} />
        {/* Add more screens within the Profile stack if needed */}
      </Stack.Navigator>
    );
  };
  
  // Tab Navigator setup
  const AppNavigator = () => {
    return (
      <Tab.Navigator>
        <Tab.Screen name="HomeScreen" component={HomeScreen} />
        <Tab.Screen name="UserProfile" component={ProfileStack} />
        <Tab.Screen name="Login" component={LoginScreen} />
        <Tab.Screen name="SignUp" component={SignUpScreen} />
      </Tab.Navigator>
    );
  };
  
  export default AppNavigator;