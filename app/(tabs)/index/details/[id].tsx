import { getReminderById, updateReminder } from '@/app/store/reminderStore';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; // Import necessary hooks
import { ChevronLeft, Save } from 'lucide-react-native'; // Import Save icon
import React, { useEffect, useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Hook to get navigation parameters

  // Get ID from URL params. It will always be a string.
  const id = params.id as string;

  // State for editable fields
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // Effect to load initial data when the component mounts or id changes
  useEffect(() => {
    if (id) {
      const reminder = getReminderById(id);
      if (reminder) {
        setEditedTitle(reminder.title);
        setEditedDescription(reminder.description);
      } else {
        // If reminder not found by ID (e.g., direct deep link to non-existent ID)
        Alert.alert("Error", "Reminder not found.");
        router.back();
      }
    }
  }, [id]); // Re-run if ID changes

  const handleSave = () => {
    if (!editedTitle.trim()) {
      Alert.alert("Error", "Title cannot be empty.");
      return;
    }

    // Call the update function from the central store
    updateReminder(id, { title: editedTitle, description: editedDescription });

    Alert.alert("Success", "Reminder saved!", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          headerShown: false, // Hide the default header as we'll create a custom one
        }}
      />
      
      {/* Custom Header */}
      <View className="py-4 px-5 flex-row items-center justify-between w-full border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Icon as={ChevronLeft} size="lg" className="text-typography-900" />
        </TouchableOpacity>
        <Heading className="flex-1 text-center text-3xl">Edit Reminder</Heading>
        <TouchableOpacity onPress={handleSave} className="p-2 rounded-md bg-blue-600">
          <Icon as={Save} size="lg" className="text-white" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-5">
        <Text className="text-lg text-typography-700 mb-2">Title:</Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-md mb-5 text-xl font-bold text-typography-900"
          value={editedTitle}
          onChangeText={setEditedTitle}
          placeholder="Reminder Title"
          multiline
        />

        <Text className="text-lg text-typography-700 mb-2">Description:</Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-md mb-5 text-base text-typography-800"
          value={editedDescription}
          onChangeText={setEditedDescription}
          placeholder="Reminder Description"
          multiline
          numberOfLines={6}
          style={{ minHeight: 120 }} // Ensure enough space for description
        />

        {/* The save button is now in the header */}
      </View>
    </SafeAreaView>
  );
}
