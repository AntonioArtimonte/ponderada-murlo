// MyAwesomeShop/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import { Alert } from 'react-native';

const AuthContext = createContext();
let mockOTPStore = {};

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For individual operations
  const [isBootstrapping, setIsBootstrapping] = useState(true); // For initial app load

  useEffect(() => {
    const bootstrapAsync = async () => {
      setIsBootstrapping(true); // Explicitly set true at start
      let token;
      let storedUser;
      try {
        token = await AsyncStorage.getItem('userToken');
        const userString = await AsyncStorage.getItem('userData');
        if (userString) {
            storedUser = JSON.parse(userString);
        }
      } catch (e) {
        console.error("Restoring token failed", e);
      }
      setUserToken(token);
      setUser(storedUser);
      setIsBootstrapping(false); // Set false when done
    };
    bootstrapAsync();
  }, []);

  // signIn, signUp, signOut, sendOTP, verifyOTP, resetPassword will use setIsLoading
  // For example, in sendOTP:
  const sendOTP = async (email) => {
    setIsLoading(true); // This is for the button on ForgotPasswordScreen
    // ... (rest of sendOTP logic)
    // Make sure to set setIsLoading(false) in all exit paths of sendOTP
    try {
        const response = await fetch(`${config.API_BASE_URL}/users?email=${email}`);
        const users = await response.json();
        if (users.length === 0) {
            setIsLoading(false);
            return { success: false, message: "Email not registered." };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        mockOTPStore[email] = { otp: otp, timestamp: Date.now(), userId: users[0].id };
        Alert.alert("OTP Sent (Mock)", `For testing, your OTP for ${email} is: ${otp}`);
        console.log(`Mock OTP for ${email}: ${otp}`);
        setIsLoading(false);
        return { success: true, message: "OTP has been sent to your email (simulated)." };
    } catch (error) {
        console.error("Send OTP error:", error);
        setIsLoading(false);
        return { success: false, message: "Failed to send OTP. Please try again." };
    }
  };

  // Ensure setIsLoading(true/false) is used consistently in:
  // signIn, signUp, signOut, verifyOTP, resetPassword

  // MyAwesomeShop/src/contexts/AuthContext.js

// ... (other code in AuthContext.js: imports, createContext, mockOTPStore, AuthProvider, useEffect, sendOTP) ...

  // REPLACE YOUR CURRENT verifyOTP WITH THIS ONE:
  const verifyOTP = async (email, otp) => {
    console.log(`AuthContext: Verifying OTP - Email: ${email}, OTP input: ${otp}`); // Log input OTP
    setIsLoading(true);
    try {
      const storedEntry = mockOTPStore[email];
      console.log("AuthContext: Stored OTP entry for email:", JSON.stringify(storedEntry)); // Log the whole entry

      if (!storedEntry) {
        console.log("AuthContext: No stored OTP entry found for this email.");
        setIsLoading(false);
        return { success: false, message: "OTP not found or may have expired. Please request again." };
      }

      // Check if properties exist before accessing them
      if (typeof storedEntry.timestamp === 'undefined' || typeof storedEntry.otp === 'undefined') {
          console.error("AuthContext: Stored OTP entry is malformed:", JSON.stringify(storedEntry));
          setIsLoading(false);
          return { success: false, message: "Internal error with OTP storage. Please try again."};
      }

      const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
      if (Date.now() - storedEntry.timestamp > OTP_EXPIRY_MS) {
        console.log("AuthContext: Stored OTP has expired.");
        delete mockOTPStore[email]; // Clean up expired OTP
        setIsLoading(false);
        return { success: false, message: "OTP has expired. Please request a new one." };
      }

      console.log(`AuthContext: Comparing stored OTP "${storedEntry.otp}" (type: ${typeof storedEntry.otp}) with input OTP "${otp}" (type: ${typeof otp})`);
      if (String(storedEntry.otp) === String(otp)) { // Explicitly cast to string for comparison
        console.log("AuthContext: OTP Matched!");
        setIsLoading(false);
        return { success: true, message: "OTP verified successfully." };
      } else {
        console.log(`AuthContext: OTP Mismatch.`);
        setIsLoading(false);
        return { success: false, message: "Invalid OTP. Please try again." };
      }
    } catch (error) {
      console.error("AuthContext: Error inside verifyOTP:", error);
      setIsLoading(false);
      return { success: false, message: "An unexpected error occurred during OTP verification." };
    }
    // Note: No fallback return needed here due to the try/catch ensuring a return.
  };

  // MAKE SURE OTHER ASYNC AUTH FUNCTIONS ALSO HAVE setIsLoading(false) IN ALL RETURN/ERROR PATHS
  // Example for signIn (you'll need to fill in the actual fetch logic)
  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      // Your fetch logic for sign in
      const response = await fetch(`${config.API_BASE_URL}/users?email=${email}&password=${password}`);
      if (!response.ok) {
          // Handle non-2xx responses if necessary, or let it fall to users.length check
          console.log("Sign in: API response not OK", response.status);
      }
      const users = await response.json();

      if (users.length > 0) {
        const foundUser = users[0];
        setUserToken(foundUser.id);
        setUser(foundUser);
        await AsyncStorage.setItem('userToken', foundUser.id);
        await AsyncStorage.setItem('userData', JSON.stringify(foundUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error("Sign in error", error);
      setIsLoading(false);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const signUp = async (name, email, password) => {
    setIsLoading(true);
    try {
      const checkResponse = await fetch(`${config.API_BASE_URL}/users?email=${email}`);
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) {
        setIsLoading(false);
        return { success: false, message: 'Email already registered.' };
      }
      const newUser = { name, email, password, phone: '', profilePic: `https://i.pravatar.cc/150?u=${email}` };
      const response = await fetch(`${config.API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        const createdUser = await response.json();
        setUserToken(createdUser.id);
        setUser(createdUser);
        await AsyncStorage.setItem('userToken', createdUser.id);
        await AsyncStorage.setItem('userData', JSON.stringify(createdUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: 'Registration failed. Please try again.' };
      }
    } catch (error) {
      console.error("Sign up error", error);
      setIsLoading(false);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUser(null);
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (e) {
      console.error("Sign out error", e);
      // Still set isLoading false even on error
    }
    setIsLoading(false);
  };


  const resetPassword = async (email, otp, newPassword) => {
    setIsLoading(true);
    try {
        const storedEntry = mockOTPStore[email];
        if (!storedEntry || String(storedEntry.otp) !== String(otp)) {
            setIsLoading(false);
            return { success: false, message: "Invalid or expired OTP for reset. Please start over." };
        }
        const OTP_EXPIRY_MS = 5 * 60 * 1000;
        if (Date.now() - storedEntry.timestamp > OTP_EXPIRY_MS) {
            delete mockOTPStore[email];
            setIsLoading(false);
            return { success: false, message: "OTP has expired. Please request a new one." };
        }
        const response = await fetch(`${config.API_BASE_URL}/users/${storedEntry.userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
        });
        if (response.ok) {
            delete mockOTPStore[email];
            setIsLoading(false);
            return { success: true, message: "Password has been reset successfully." };
        } else {
            const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
            setIsLoading(false);
            return { success: false, message: errorData.message || "Failed to reset password on server." };
        }
    } catch (error) {
        console.error("Reset password error:", error);
        setIsLoading(false);
        return { success: false, message: "An error occurred while resetting password." };
    }
  };

// ... (rest of AuthContext.js: return <AuthContext.Provider ...>, export useAuth)


  return (
    <AuthContext.Provider value={{
      userToken,
      user,
      isLoading, // For screen-level loading indicators
      isBootstrapping, // For AppNavigator's initial load
      signIn,
      signOut,
      signUp,
      sendOTP,
      verifyOTP,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);