import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Appbar, useTheme } from 'react-native-paper'; // Added Appbar
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { signOut, user } = useAuth();
  const theme = useTheme();

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="My Profile" />
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{color: theme.colors.text, fontSize: 18, marginBottom: 10}}>Welcome, {user?.name || 'User'}!</Text>
        <Text style={{color: theme.colors.text, marginBottom: 20}}>Email: {user?.email}</Text>
        <Button mode="contained" onPress={signOut} style={{backgroundColor: theme.colors.error}}>
          Logout
        </Button>
        {/* More profile details and edit options will go here */}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20, paddingHorizontal: 16 },
});