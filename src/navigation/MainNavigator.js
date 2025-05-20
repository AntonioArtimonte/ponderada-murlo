import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screen shells (we'll create these basic versions next)
import HomeScreen from '../screens/Main/HomeScreen';
import AddItemScreen from '../screens/Main/AddItemScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import NotificationsScreen from '../screens/Main/NotificationsScreen';
import ProductDetailScreen from '../screens/Main/ProductDetailScreen'; // For stack navigation

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const AddItemStack = createStackNavigator(); // If AddItem needs its own stack (e.g. for camera preview)
const ProfileStack = createStackNavigator(); // If Profile needs its own stack (e.g. for edit profile)

// Simple Stack Navigator for Home flow
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
        screenOptions={{
        }}
    >
      <HomeStack.Screen
        name="ProductList"
        component={HomeScreen}
        options={{ title: 'Our Awesome Products' }} // Title for Home screen
      />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({ title: route.params?.productName || 'Product Details' })} // Dynamic title
      />
    </HomeStack.Navigator>
  );
}


export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddTab') {
            iconName = focused ? 'plus-circle' : 'plus-circle-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
          } else if (route.name === 'NotificationsTab') {
            iconName = focused ? 'bell' : 'bell-outline';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato', // Example color
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // We'll handle headers in individual stack navigators
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: "Home"}} />
      <Tab.Screen name="AddTab" component={AddItemScreen} options={{ title: "Add Item"}} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: "Notifications"}} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Profile"}} />
    </Tab.Navigator>
  );
}