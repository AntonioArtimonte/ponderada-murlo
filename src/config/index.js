// MyAwesomeShop/src/config/index.js

// --- IMPORTANT: Replace with your computer's local IP address ---
const YOUR_COMPUTER_LOCAL_IP_ADDRESS = '10.128.1.56'; // <--- !!! REPLACE THIS !!!
// --- ------------------------------------------------------ ---

// Ensure you replace the placeholder above with your actual IP.
// If you don't, the app won't connect to your local json-server.
if (YOUR_COMPUTER_LOCAL_IP_ADDRESS === '10.128.1.56' || YOUR_COMPUTER_LOCAL_IP_ADDRESS === '10.128.1.56' && process.env.NODE_ENV !== 'test') { // Added a common default to catch if not changed
  console.warn(
    "Configuration Error: Please set your computer's local IP address in src/config/index.js"
  );
  // In a real app, you might throw an error or have a more visible warning
}


const config = {
  API_BASE_URL: `http://${YOUR_COMPUTER_LOCAL_IP_ADDRESS}:3001`,
  ITEMS_PER_PAGE: 20,
  // Add other global configurations here as needed
  // e.g., API_KEY: 'YOUR_API_KEY_IF_NEEDED'
};

export default config;