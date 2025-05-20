import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(0, 100, 200)',      // A nice blue
    accent: 'rgb(0, 180, 150)',       // A teal accent
    background: 'rgb(242, 242, 242)', // Light grey background
    surface: 'rgb(255, 255, 255)',    // White for cards, surfaces
    text: 'rgb(28, 28, 30)',
    placeholder: 'rgb(150,150,150)',
    // You can add more colors or customize existing ones
  },
  // You can also customize fonts, roundness, etc.
  roundness: 8,
};