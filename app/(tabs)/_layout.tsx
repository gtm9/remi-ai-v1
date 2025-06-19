import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Icon, SettingsIcon } from '@/components/ui/icon';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AudioLines, House, Plus } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon as={House} className="text-typography-500 m-2" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Voices',
          tabBarIcon: ({ color }) => <Icon as={AudioLines} className="text-typography-500 m-2" />,
        }}
      />
      {/* <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Icon as={SettingsIcon} className="text-typography-500 m-2" />,
        }}
      />
      <Tabs.Screen
        name="addreminder"
        options={{
          title: 'Add Reminder',
          tabBarIcon: ({ color }) => <Icon as={Plus} className="text-typography-500 m-2" />,
        }}
      />
    </Tabs>
  );
}
