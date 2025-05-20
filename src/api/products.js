// MyAwesomeShop/src/api/products.js
import config from '../config'; // <--- IMPORT THE CONFIG

export const fetchProducts = async (page = 1, limit = config.ITEMS_PER_PAGE, query = '') => { // Use config for limit
  try {
    let queryString = `_page=${page}&_limit=${limit}`;
    if (query) {
      queryString += `&q=${encodeURIComponent(query)}`;
    }

    const response = await fetch(`${config.API_BASE_URL}/products?${queryString}`); // <--- USE CONFIG
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);
    return { data, totalCount, error: null };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { data: [], totalCount: 0, error: error.message || "Failed to fetch products" };
  }
};

export const fetchProductById = async (productId) => {
    try {
        const response = await fetch(`${config.API_BASE_URL}/products/${productId}`); // <--- USE CONFIG
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return { data: null, error: error.message || "Failed to fetch product details" };
    }
};