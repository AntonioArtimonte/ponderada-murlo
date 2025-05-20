import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Appbar, useTheme } from 'react-native-paper'; // Added Appbar

export default function NotificationsScreen({ navigation }) {
  const theme = useTheme();
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Notifications" />
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{color: theme.colors.text}}>Notifications Screen - List of notifications here!</Text>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});