import React, {useState} from 'react';
import { TouchableOpacity, Modal, View, StyleSheet, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';  // For icons

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationScreen from '../screens/NotificationScreen';
import UserProfile from '../screens/Profile/UserProfile';
import Welcome from '../screens/Welcome';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PostScreen from '../screens/PostScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileCreation from '../screens/Profile/ProfileCreation';
import AddToCloset from '../screens/Profile/AddToCloset';
import PostDetailsScreen from '../screens/PostDetailScreen';
import Outfits from '../screens/Profile/Outfits';
import ProfileEdit from '../screens/Profile/ProfileEdit';
import OutfitGeneration from '../screens/OutfitGenerateDisplay';

// Create the Tab Navigator for the Main Page
const Tab = createBottomTabNavigator();

function MainTabs({navigation}) {
  const [globalModalVisible, setGlobalModalVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
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
            } else if (route.name === 'Notifications') {
              iconName = 'notifications-outline';
            } else if (route.name === 'Profile') {
              iconName = 'person-outline';
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
        <Tab.Screen
          name="Post"
          component={View} 
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                onPress={() => setGlobalModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={40} color="gray" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen name="Notifications" component={NotificationScreen} />
        <Tab.Screen name="Profile" component={UserProfile} />
      </Tab.Navigator>

      <Modal
        transparent={true}
        visible={globalModalVisible}
        animationType="fade"
        onRequestClose={() => setGlobalModalVisible(false)}   
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

          <TouchableOpacity onPress={() => setGlobalModalVisible(false)}>
            <Text style={styles.closeButton}></Text>
            <Ionicons name="close" size='30' style={styles.closeButton}></Ionicons>
          </TouchableOpacity>
          <Text style={styles.modalText}>Let's Create</Text>

          <TouchableOpacity style = {styles.button3} onPress={() => { setGlobalModalVisible(false); navigation.navigate('PostScreen');}}>
          <Ionicons name="create" size='30' color={'purple'}></Ionicons>
          </TouchableOpacity>
          <Text style={{top: 140, right: 272, position: 'absolute'}}> Post </Text>

          <TouchableOpacity style = {styles.button2} onPress={() => { setGlobalModalVisible(false); navigation.navigate('OutfitGeneration'); }} >
          <Ionicons name="sparkles" size='30' color={'purple'}></Ionicons>
          </TouchableOpacity>
          <Text style={{alignSelf: 'center', top: 140, position: 'absolute'}}> Modista </Text>

          <TouchableOpacity style = {styles.button} onPress={() => { setGlobalModalVisible(false); navigation.navigate('AddToCloset'); }} >
          <Ionicons name="shirt" size='30' color={'purple'}></Ionicons>
          </TouchableOpacity>
          <Text style={{top: 140, left: 265, position: 'absolute'}}> Closet </Text>

          </View>
        </View>
      </Modal>
    </View>
  );
}

// Create the Stack Navigator for Welcome, Login, and SignUp screens
const Stack = createStackNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Profile" 
        component={UserProfile} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserProfile"
        component={UserProfile}
        options={({ route }) => ({
          title: route.params?.username || 'Profile',
          headerBackTitle: 'Back'
        })}
      />
      <Stack.Screen 
        name="ProfileEdit" 
        component={ProfileEdit}
        options={{
          headerTitle: 'Edit Profile',
          headerBackTitle: 'Back'
        }}
      />
      {/* ... other screens ... */}
    </Stack.Navigator>
  );
}

function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}  // Hide header for all screens
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} /> 
        <Stack.Screen name="ProfileCreation" component={ProfileCreation} />
        <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
        <Stack.Screen name="PostScreen" component={PostScreen} />
        <Stack.Screen name="AddToCloset" component={AddToCloset} />
        <Stack.Screen name="OutfitGeneration" component={OutfitGeneration} />
        <Stack.Screen name="Main" component={MainTabs}>
        </Stack.Screen>
        <Stack.Screen 
            name="PostDetailsScreen" 
            component={PostDetailsScreen}
            options={{
                headerShown: true,
                title: 'Post Details',
                headerBackTitle: 'Back'
            }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: 200, 
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '350',
    position: 'absolute',
    top: 25
  },
  closeButton: {
    color: 'black',
    position: 'absolute',
    left: -190
  },
  button: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'purple',
    paddingVertical: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 70,
    right: 110,
    width: 60,
    height: 60,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  button2: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'purple',
    paddingVertical: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 70,
    width: 60,
    height: 60,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  button3: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'purple', 
    paddingVertical: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 70,
    right: 260,
    width: 60,
    height: 60,
    alignSelf: 'center',
    justifyContent: 'center'
  },
});

export default App;