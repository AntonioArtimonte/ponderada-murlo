// MyAwesomeShop/src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function AppNavigator() {
  const { userToken, isBootstrapping } = useAuth(); // Use isBootstrapping here

  console.log("AppNavigator rendering - isBootstrapping:", isBootstrapping, "userToken:", userToken);

  if (isBootstrapping) { // Check isBootstrapping instead of isLoading
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? <AuthNavigator /> : <MainNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});