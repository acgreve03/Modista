import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons for tab icons

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PostScreen from '../screens/PostScreen';
import NotificationScreen from '../screens/NotificationScreen';
import UserProfile from '../screens/Profile/UserProfile';
import Welcome from '../screens/Welcome';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import WeatherOutfit from '../services/WeatherOutfit'; // Import WeatherOutfit

// Define the navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Authentication Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Application Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Search') {
            iconName = 'search-outline';
          } else if (route.name === 'Post') {
            iconName = 'add-circle-outline';
          } else if (route.name === 'Notification') {
            iconName = 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'WeatherOutfit') {
            iconName = 'cloud-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'purple',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={UserProfile} />
      <Tab.Screen
        name="WeatherOutfit"
        component={WeatherOutfit}
        options={{
        tabBarLabel: 'Weather Outfits',
        tabBarIcon: ({ color, size }) => (
      <Ionicons name="cloud-outline" size={size} color={color} />
    ),
  }}
/>

    </Tab.Navigator>
  );
};

// Main Tab Navigator that combines AuthStack and AppTabs
const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Main" component={MainTabNavigator} />
      <Tab.Screen name="Auth" component={AuthStackNavigator} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
