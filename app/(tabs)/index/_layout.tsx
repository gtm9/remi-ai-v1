import { Stack } from "expo-router";
import React from "react";

export const ColorModeContext = React.createContext({});

export default function HomeLayout() {

  return (
    <>
      <Stack screenOptions={{ animation: "slide_from_right" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}