// MyAwesomeShop/src/screens/Auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Appbar, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const { sendOTP, isLoading } = useAuth();
  const theme = useTheme();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    const result = await sendOTP(email);
    if (result.success) {
        console.log("OTP success, attempting to navigate to OTP screen with email:", email);
      Alert.alert("OTP Sent", result.message); // Or just rely on the alert from AuthContext
      navigation.navigate('OTP', { email: email }); // Pass email to OTP screen
    } else {
      Alert.alert("Error", result.message || "Failed to send OTP. Please try again.");
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Forgot Password" />
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium" style={styles.instructionText}>
          Enter your email address below and we'll send you a One-Time Password (OTP) to reset your password.
        </Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
        />
        {isLoading ? (
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={styles.button}/>
        ) : (
          <Button mode="contained" onPress={handleSendOTP} style={styles.button} labelStyle={styles.buttonLabel}>
            Send OTP
          </Button>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center', // Center content vertically
  },
  instructionText: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});