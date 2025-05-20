// MyAwesomeShop/src/screens/Main/ProductDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Title, Paragraph, Card, Button, IconButton, useTheme, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProductById } from '../../api/products'; // Import the API function

const FAVORITES_STORAGE_KEY = '@MyApp:Favorites';

export default function ProductDetailScreen({ route, navigation }) {
  const theme = useTheme();
  const { productId } = route.params; // Get productId from navigation

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const loadProductDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchProductById(productId);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        setProduct(result.data);
        checkIfFavorite(result.data.id); // Check favorite status after product loads
      } else {
        throw new Error("Product not found.");
      }
    } catch (e) {
      console.error("Failed to load product details:", e);
      setError(e.message || "Could not fetch product details.");
      Alert.alert("Error", e.message || "Could not fetch product details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const getFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (e) {
      console.error("Failed to get favorites:", e);
      return [];
    }
  };

  const checkIfFavorite = async (id) => {
    const favorites = await getFavorites();
    setIsFavorite(favorites.includes(id));
  };

  const toggleFavorite = async () => {
    if (!product) return;
    const currentFavorites = await getFavorites();
    let updatedFavorites;

    if (isFavorite) {
      updatedFavorites = currentFavorites.filter(favId => favId !== product.id);
    } else {
      updatedFavorites = [...currentFavorites, product.id];
    }

    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      setIsFavorite(!isFavorite);
      Alert.alert(
        "Favorites",
        isFavorite ? `${product.name} removed from favorites.` : `${product.name} added to favorites.`
      );
    } catch (e) {
      console.error("Failed to update favorites:", e);
      Alert.alert("Error", "Could not update favorites.");
    }
  };

  useEffect(() => {
    loadProductDetails();
  }, [loadProductDetails]);

  // Set the header title dynamically once product is loaded
  useEffect(() => {
    if (product && product.name) {
      navigation.setOptions({ title: product.name });
    }
  }, [product, navigation]);


  if (isLoading) {
    return (
      <View style={styles.centerMessageContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerMessageContainer}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
          {error || "Product not found."}
        </Text>
        <Button onPress={loadProductDetails} mode="outlined" style={{ marginTop: 10 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <>
      {/* Appbar.Header is managed by StackNavigator options, no need to repeat unless custom */}
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.card}>
          <Card.Cover
            source={{ uri: product.imageUrl || 'https://via.placeholder.com/400x300.png?text=No+Image' }}
            style={styles.image}
          />
          <Card.Content style={styles.content}>
            <View style={styles.titleContainer}>
                <Title style={[styles.title, { color: theme.colors.text, flex: 1 }]}>{product.name}</Title>
                <IconButton
                    icon={isFavorite ? "heart" : "heart-outline"}
                    color={isFavorite ? theme.colors.error : theme.colors.placeholder}
                    size={30}
                    onPress={toggleFavorite}
                    style={styles.favoriteButton}
                />
            </View>
            <Paragraph style={[styles.price, { color: theme.colors.primary }]}>
              ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
            </Paragraph>
            {product.category && (
                <Text style={[styles.category, {color: theme.colors.accent}]}>
                    Category: {product.category}
                </Text>
            )}
            <Paragraph style={[styles.description, { color: theme.colors.text }]}>
              {product.description}
            </Paragraph>
            {/* Add more product details here as needed */}
          </Card.Content>
        </Card>
        {/* You could add related products or other sections below */}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    margin: 0, // Take full width within ScrollView
    borderRadius: 0, // No border radius for full width card
    elevation: 2,
  },
  image: {
    height: 300, // Adjust as needed
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  favoriteButton: {
    // marginLeft: 8,
    // marginRight: -8, // Counteract default padding if needed
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
});