import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from "react";
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

let defaultTheme: "dark" | "light" = "light";

type ThemeContextType = {
  colorMode?: "dark" | "light";
  toggleColorMode?: () => void;
};
export const ThemeContext = React.createContext<ThemeContextType>({
  colorMode: "light",
  toggleColorMode: () => {},
});


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [colorMode, setColorMode] = React.useState<"dark" | "light">(
    defaultTheme
  );
  const toggleColorMode = async () => {
    setColorMode((prev) => (prev === "light" ? "dark" : "light"));
  };
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode }}>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GluestackUIProvider>
    </ThemeContext.Provider>
  );
}
