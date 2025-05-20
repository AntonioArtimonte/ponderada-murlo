// MyAwesomeShop/src/screens/Auth/OTPScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native'; // Import Keyboard and TouchableWithoutFeedback
import { TextInput, Button, Text, Appbar, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export default function OTPScreen({ route, navigation }) {
  // ... (rest of your existing state and functions: passedEmail, otp, etc.)
  const theme = useTheme();
  const passedEmail = route.params?.email;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

  const { verifyOTP, resetPassword, isLoading } = useAuth();


  useEffect(() => {
    if (passedEmail) {
      setCurrentEmail(passedEmail);
      // console.log("OTPScreen: Email received:", passedEmail);
    } else {
      // console.error("OTPScreen: Email not provided in route params! Navigating back.");
      Alert.alert("Navigation Error", "Could not retrieve email for OTP. Please try again.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
  }, [passedEmail, navigation]);

  const handleVerifyOTP = async () => {
  console.log("Verify OTP button pressed. OTP:", otp, "Email:", currentEmail); // <--- ADD THIS
  Keyboard.dismiss();
    if (!currentEmail) {
        Alert.alert("Error", "Email address is missing.");
        return;
    }
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }
    // ... (rest of handleVerifyOTP)
    const result = await verifyOTP(currentEmail, otp);
    console.log("AuthContext.verifyOTP result:", result); // <--- ADD THIS LOG

    if (result.success) { // This condition is likely not being met
      Alert.alert("Success", result.message);
      setIsOtpVerified(true); // This is not happening
    } else {
      Alert.alert("Error", result.message || "OTP verification failed.");
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss(); // Dismiss keyboard before async operation
    if (!currentEmail) {
        Alert.alert("Error", "Email address is missing.");
        return;
    }
    // ... (rest of handleResetPassword validation)
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters long.");
        return;
    }

    const result = await resetPassword(currentEmail, otp, newPassword);
    if (result.success) {
      Alert.alert("Success", result.message + " You can now log in with your new password.");
      navigation.popToTop();
      navigation.navigate('Login');
    } else {
      Alert.alert("Error", result.message || "Password reset failed.");
    }
  };

  if (!currentEmail && !isLoading) {
    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center'}]}>
            <ActivityIndicator animating={true} color={theme.colors.primary} />
            <Text style={{marginTop: 10}}>Loading...</Text>
        </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{flex: 1}}> {/* Added a flex:1 View to ensure TouchableWithoutFeedback covers screen if Appbar is present */}
        <Appbar.Header>
          <Appbar.BackAction onPress={() => {
              if (isOtpVerified) setIsOtpVerified(false);
              else navigation.goBack();
          }} />
          <Appbar.Content title={isOtpVerified ? "Set New Password" : "Enter OTP"} />
        </Appbar.Header>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {!isOtpVerified ? (
            <>
              <Text variant="titleMedium" style={styles.instructionText}>
                An OTP should have been sent to <Text style={{fontWeight: 'bold'}}>{currentEmail}</Text>.
                Please enter it below. (Check app alert for mock OTP)
              </Text>
              <TextInput
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                mode="outlined"
                disabled={isLoading}
              />
              {isLoading && !isOtpVerified ? (
                <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={styles.button}/>
              ) : (
                <Button mode="contained" onPress={handleVerifyOTP} style={styles.button} labelStyle={styles.buttonLabel} disabled={isLoading}>
                  Verify OTP
                </Button>
              )}
            </>
          ) : (
            <>
              <Text variant="titleMedium" style={styles.instructionText}>
                OTP Verified! Now set your new password for <Text style={{fontWeight: 'bold'}}>{currentEmail}</Text>.
              </Text>
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                secureTextEntry
                mode="outlined"
                disabled={isLoading}
              />
              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                secureTextEntry
                mode="outlined"
                disabled={isLoading}
              />
              {isLoading && isOtpVerified ? (
                 <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={styles.button}/>
              ) : (
                <Button mode="contained" onPress={handleResetPassword} style={styles.button} labelStyle={styles.buttonLabel} disabled={isLoading}>
                  Reset Password
                </Button>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure this container takes up space for Touchable to work properly
    padding: 20,
    justifyContent: 'center',
  },
  // ... (rest of your styles)
  instructionText: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});