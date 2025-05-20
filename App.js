// MyAwesomeShop/App.js
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext'; // Import
import AppNavigator from './src/navigation/AppNavigator';
import { customTheme } from './src/constants/theme';

export default function App() {
  return (
    <PaperProvider theme={customTheme}>
      <AuthProvider>
        <NotificationsProvider> {/* Wrap AppNavigator */}
          <AppNavigator />
        </NotificationsProvider>
      </AuthProvider>
    </PaperProvider>
  );
}