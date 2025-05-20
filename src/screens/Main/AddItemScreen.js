// MyAwesomeShop/src/screens/Main/AddItemScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, ActivityIndicator, useTheme, Card, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera'; // For Camera.Constants if needed, and permissions
import config from '../../config'; // For API_BASE_URL
import { useAuth } from '../../contexts/AuthContext'; // For isLoading from context if needed, or local isLoading

console.log("Checking ImagePicker.MediaType:", ImagePicker.MediaType);


export default function AddItemScreen({ navigation }) {
  const theme = useTheme();
  // const { isLoading: authIsLoading } = useAuth(); // If you need global loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for submission

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(''); // Optional
  const [imageUri, setImageUri] = useState(null); // To store local URI of selected/taken image

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        console.log("[Permissions useEffect] Requesting camera permissions...");
        const cameraStatusResult = await Camera.requestCameraPermissionsAsync();
        console.log("[Permissions useEffect] Camera permission status:", cameraStatusResult.status, cameraStatusResult); // Log the full result

        console.log("[Permissions useEffect] Requesting media library permissions...");
        const galleryStatusResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("[Permissions useEffect] Media Library permission status:", galleryStatusResult.status, galleryStatusResult); // Log the full result
      }
    })();
  }, []);

  const handleChooseFromGallery = async () => {
    console.log("handleChooseFromGallery called");
    const permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync(); // Check current
    console.log("Current Media Library permission for gallery:", permissionResult.status);
    if (permissionResult.status !== 'granted') {
        const requestResult = await ImagePicker.requestMediaLibraryPermissionsAsync(); // Re-request
        console.log("Re-requested Media Library permission:", requestResult.status);
        if (requestResult.status !== 'granted') {
            Alert.alert("Permissions Denied", "Photo Library permission was denied. Please enable it in your phone's settings for this app.");
            return;
        }
    }

    let result;
    try {
        result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'Images', // UPDATED
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });
    } catch (e) {
        console.error("Error launching image library:", e);
        Alert.alert("Gallery Error", "Could not open image gallery.");
        return;
    }

    console.log("Gallery launchImageLibraryAsync result:", JSON.stringify(result, null, 2));

    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("Setting image URI from gallery:", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    } else {
      console.log("Gallery selection canceled or no assets returned.");
    }
  };

  const handleTakePhoto = async () => {
    console.log("--- handleTakePhoto called ---");

    // 1. Check current camera permission status
    let permissionResult = await Camera.getCameraPermissionsAsync();
    console.log("handleTakePhoto: Current camera permission status before request:", permissionResult.status, permissionResult);

    // 2. If not granted, request it
    if (permissionResult.status !== 'granted') {
      console.log("handleTakePhoto: Camera permission not granted, requesting again...");
      permissionResult = await Camera.requestCameraPermissionsAsync();
      console.log("handleTakePhoto: Re-requested camera permission status:", permissionResult.status, permissionResult);
    }

    // 3. If still not granted, alert and exit
    if (permissionResult.status !== 'granted') {
      Alert.alert(
        "Camera Permission Required",
        "This app needs access to your camera to take photos. Please enable it in your iPhone's Settings > Privacy & Security > Camera, or Settings > BahTche.",
        [{ text: "OK" }]
      );
      return;
    }

    // 4. If granted, attempt to launch camera
    console.log("handleTakePhoto: Camera permission is granted. Attempting to launch camera...");
    let result;
    try {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
    } catch (e) {
      console.error("handleTakePhoto: Error launching camera via ImagePicker:", e);
      Alert.alert("Camera Error", "Could not open camera. An error occurred: " + e.message);
      return;
    }

    console.log("handleTakePhoto: ImagePicker.launchCameraAsync result:", JSON.stringify(result, null, 2));

    if (result.assets && result.assets.length > 0 && !result.canceled) {
      console.log("handleTakePhoto: Setting image URI from camera:", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    } else {
      console.log("handleTakePhoto: Camera action canceled or no assets returned.");
      if(result.canceled) {
        // Alert.alert("Camera", "Photo taking was cancelled."); // Optional: notify user of cancellation
      }
    }
  };


  // ... (handleAddProduct and rest of the component) ...
  const handleAddProduct = async () => {
    if (!productName || !description || !price) {
      Alert.alert('Missing Information', 'Please fill in product name, description, and price.');
      return;
    }
    if (isNaN(parseFloat(price))) {
        Alert.alert('Invalid Price', 'Please enter a valid number for the price.');
        return;
    }
    setIsSubmitting(true);
    const randomSeed = Math.random().toString(36).substring(7);
    const mockImageUrl = `https://picsum.photos/seed/${randomSeed}/400/300`;
    const newProductData = {
      name: productName,
      description: description,
      price: parseFloat(price),
      category: category || 'Miscellaneous',
      imageUrl: imageUri ? mockImageUrl : 'https://via.placeholder.com/400x300.png?text=No+Image+Provided',
    };
    try {
      const response = await fetch(`${config.API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(newProductData),
      });
      if (response.ok) {
        Alert.alert('Success', 'Product added successfully!');
        setProductName(''); setDescription(''); setPrice(''); setCategory(''); setImageUri(null);
        // navigation.goBack(); // Consider if goBack or navigate to Home is better
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to add product. Server error."}));
        Alert.alert('Error', errorData.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error("Add product error:", error);
      Alert.alert('Error', 'An unexpected error occurred while adding the product.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add New Item" />
      </Appbar.Header>
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title title="Product Image" />
            <Card.Content>
              {imageUri ? (
                <View>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <IconButton
                        icon="close-circle"
                        size={24}
                        onPress={() => setImageUri(null)}
                        style={styles.removeImageButton}
                        color={theme.colors.error}
                    />
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={{color: theme.colors.placeholder}}>No image selected</Text>
                </View>
              )}
              <View style={styles.imageButtonsContainer}>
                <Button
                  icon="camera"
                  mode="outlined"
                  onPress={handleTakePhoto}
                  style={styles.imageButton}
                  disabled={isSubmitting}
                >
                  Take Photo
                </Button>
                <Button
                  icon="image-multiple"
                  mode="outlined"
                  onPress={handleChooseFromGallery}
                  style={styles.imageButton}
                  disabled={isSubmitting}
                >
                  From Gallery
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Product Details" />
            <Card.Content>
              <TextInput
                label="Product Name"
                value={productName}
                onChangeText={setProductName}
                style={styles.input}
                mode="outlined"
                disabled={isSubmitting}
              />
              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                disabled={isSubmitting}
              />
              <TextInput
                label="Price ($)"
                value={price}
                onChangeText={setPrice}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                disabled={isSubmitting}
              />
              <TextInput
                label="Category (Optional)"
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                mode="outlined"
                disabled={isSubmitting}
              />
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleAddProduct}
            style={styles.submitButton}
            loading={isSubmitting}
            disabled={isSubmitting}
            icon="plus-circle"
            labelStyle={{fontSize: 16}}
          >
            Add Product
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
    backgroundColor: '#e0e0e0', // Placeholder background for the image container
    alignSelf: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(255,255,255,0.7)', // Slight background for visibility
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4, // Match card border radius
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  imageButton: {
    flex: 1, // Make buttons take equal space
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});