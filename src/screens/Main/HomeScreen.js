// MyAwesomeShop/src/screens/Main/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, useTheme, Searchbar, Button } from 'react-native-paper'; // Added Button
import { fetchProducts } from '../../api/products';
import config from '../../config'; // Import config for ITEMS_PER_PAGE

// const ITEMS_PER_PAGE = 20; // Now comes from config

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = useCallback(async (pageNum = 1, isRefresh = false, query = '') => {
    if (isLoading && !isRefresh) return;

    setIsLoading(true);
    if (isRefresh) {
      setIsRefreshing(true);
      // Do not clear products here if you want a smoother search experience
      // or clear them if you prefer a fresh list on new search/refresh
      // setProducts([]);
    }
    setError(null);

    try {
      // fetchProducts now uses the config internally
      const result = await fetchProducts(pageNum, config.ITEMS_PER_PAGE, query);

      if (result.error) {
        throw new Error(result.error);
      }

      const newProducts = result.data;
      const totalCount = result.totalCount;

      setProducts(prevProducts => {
        if (isRefresh || pageNum === 1) return newProducts; // For refresh or first page of new search
        return [...prevProducts, ...newProducts];
      });
      setHasMoreData((pageNum * config.ITEMS_PER_PAGE) < totalCount);
      setPage(pageNum);

    } catch (e) {
      console.error("Failed to load products:", e);
      const errorMessage = e.message || "Could not fetch products. Please try again.";
      setError(errorMessage);
      // Only show alert if it's not a subsequent load error after some data is already shown
      if (products.length === 0) {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoading, products.length]); // products.length helps in deciding to show alert

  useEffect(() => {
    // Initial load: Load page 1, treat as refresh, with current search query (empty initially)
    loadProducts(1, true, searchQuery);
  }, []); // Only run on mount (search is handled by handleSearch)

  const handleLoadMore = () => {
    if (!isLoading && hasMoreData && !isRefreshing) { // Added !isRefreshing
      loadProducts(page + 1, false, searchQuery);
    }
  };

  const handleRefresh = () => {
    setPage(1); // Reset page for refresh
    setHasMoreData(true); // Assume there's data on refresh
    loadProducts(1, true, searchQuery);
  };

  const handleSearch = () => {
    setPage(1); // Reset page for new search
    setProducts([]); // Clear current products for a new search
    setHasMoreData(true); // Assume there might be data
    loadProducts(1, true, searchQuery); // isRefresh = true to replace product list
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x300.png?text=No+Image' }} />
        <Card.Content>
          <Title numberOfLines={1} style={{ color: theme.colors.text }}>{item.name}</Title>
          <Paragraph style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            ${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
          </Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    if (!hasMoreData && products.length > 0) {
        return <Text style={styles.endMessage}>No more products to load.</Text>;
    }
    return <ActivityIndicator style={{ marginVertical: 20 }} animating={true} color={theme.colors.primary} />;
  };

  if (error && products.length === 0 && !isLoading) {
    return (
      <View style={styles.centerMessageContainer}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>{error}</Text>
        <Button onPress={handleRefresh} mode="outlined" style={{ marginTop: 10 }}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onIconPress={handleSearch}
        onSubmitEditing={handleSearch}
        style={styles.searchbar}
        elevation={2}
      />
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={() => (
            !isLoading && !error && products.length === 0 ? (
                <View style={styles.centerMessageContainer}>
                    <Text style={{color: theme.colors.text}}>
                        {searchQuery ? `No products found for "${searchQuery}".` : "No products available."}
                    </Text>
                    {searchQuery && <Button onPress={() => { setSearchQuery(''); handleSearch(); }}>Clear Search</Button>}
                </View>
            ) : null
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 8,
  },
  listContentContainer: {
    paddingHorizontal: 4,
  },
  card: {
    flex: 1,
    margin: 4,
  },
  centerMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  endMessage: {
    textAlign: 'center',
    marginVertical: 20,
    color: 'grey',
  }
});