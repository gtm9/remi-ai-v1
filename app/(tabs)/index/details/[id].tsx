import { GeneratedAudioItem, useGeneratedAudioStore } from '@/app/store/audioFileStore';
import { ReminderItem, useReminderStore } from '@/app/store/reminderStore';
import { AudioFileSelect } from '@/components/SelectAudioFile';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { FormControl } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { CheckIcon, Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import VoiceCard from '@/components/VoiceCard';
import { AudioFileItem } from '@/types/audio';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; // Import necessary hooks
import { ChevronLeft, Save } from 'lucide-react-native'; // Import Save icon
import React, { useEffect, useState } from 'react';
import { Alert, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Hook to get navigation parameters

  // Get ID from URL params. It will always be a string.
  const id = params.id as string;

  // State for editable fields
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminder, setReminder] = useState<ReminderItem>();
  const [selectedAudioFileId, setSelectedAudioFileId] = useState<string | null>('');
  const [remindWithCall, setRemindWithCall] = useState(false);
  const [showPickerMode, setShowPickerMode] = useState<'date' | 'time' | null>(null);

  const getReminderById = useReminderStore((state) => state.getReminderById);
  const updateReminder = useReminderStore((state) => state.updateReminder);
  const generatedAudios = useGeneratedAudioStore((state) => state.generatedAudios); // To display them later
  
  
  // Effect to load initial data when the component mounts or id changes
  useEffect(() => {
    if (id) {
      const currentReminder = getReminderById(id);
      if (currentReminder) {
        console.log("45 Current Reminder:", currentReminder);
        setReminder(currentReminder)
        setEditedTitle(currentReminder.title);
        setEditedDescription(currentReminder.description);
        setReminderDate(new Date(currentReminder.date))
        setRemindWithCall(currentReminder.remindWithCall)
        setSelectedAudioFileId(currentReminder.selectedAudioFileId)
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
    updateReminder(id, { title: editedTitle, description: editedDescription, date: reminderDate.toISOString(), remindWithCall: remindWithCall, selectedAudioFileId: selectedAudioFileId });

    Alert.alert("Success", "Reminder saved!", [{ text: "OK", onPress: () => router.back() }]);
  };

  const handleCastGeneratedAudio = (generatedAudio: GeneratedAudioItem) : AudioFileItem => {
    const generatedAudioFileItem : AudioFileItem = {
        id: generatedAudio.id,
        name: generatedAudio.url,
        audioText: generatedAudio.promptText,
        uri: generatedAudio.url,
        type: 'remote',
    }

    return generatedAudioFileItem
  }

  const handleAudioFileChange = (value: string) => {
    console.log("60 value",value)
    updateReminder(id, { title: editedTitle, description: editedDescription, date: reminderDate.toISOString() });
    setSelectedAudioFileId(value)
  }

  const handleRemindWithCallChange = (isChecked: boolean) => {
    setRemindWithCall(isChecked);
    updateReminder(id, { remindWithCall: remindWithCall });
  }

  // --- REFINED onChange handler for DateTimePicker ---
  const onDateTimeChange = (event: any, selectedDateTime: Date | undefined) => {
      // This log is for debugging purposes to see event types
      console.log(`DateTimePicker onChange event type: ${event.type}, Platform: ${Platform.OS}`);

      // On Android, the native dialog dismisses itself, so we hide the RN component
      if (Platform.OS === 'android') {
          setShowPickerMode(null); // Unmounts the component after interaction on Android
      }
      // On iOS, the picker is inline and doesn't auto-dismiss.
      // We only hide it if the user explicitly 'dismissed' (cancelled).
      else if (Platform.OS === 'ios' && event.type === 'dismissed') {
          setShowPickerMode(null); // Hide on iOS only if user cancels
      }
      // If event.type === 'set' on iOS, we deliberately DO NOT hide it here,
      // so it stays visible for further interaction or until user taps elsewhere.

      if (event.type === 'set' && selectedDateTime) {
          setReminderDate(selectedDateTime);
      }
      // No 'else if (event.type === 'dismissed')' for Android specifically here,
      // as the initial `setShowPickerMode(null)` for Android covers both 'set' and 'dismissed' events.
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

        {/* DateTimePicker trigger buttons */}
        {Platform.OS !== 'ios'  && <Animated.View layout={Layout.duration(300)} style={{ marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setShowPickerMode('date')} className="p-3 border border-gray-300 rounded-md bg-white">
              <Text className="text-gray-700">Date: {reminderDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPickerMode('time')} className="p-3 border border-gray-300 rounded-md bg-white mt-2">
              <Text className="text-gray-700">Time: {reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        </Animated.View>}

        {/* Conditionally render DateTimePicker based on showPickerMode */}
        {Platform.OS !== 'ios'  && showPickerMode && (
            <DateTimePicker
                value={reminderDate}
                mode={showPickerMode}
                // For iOS, 'spinner' usually gives a better inline visual than 'default'
                onChange={onDateTimeChange}
            />
        )}

        {Platform.OS === 'ios'  && <DateTimePicker
          value={reminderDate}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setReminderDate(selectedDate);
            }
          }}
          style={{ marginBottom: 16 }}
        />}
        <FormControl className="mb-4">
          <Checkbox
            value="remind_with_call"
            aria-label="Remind me with a call"
            onChange={handleRemindWithCallChange}
            isChecked={remindWithCall}
          >
            <CheckboxIndicator className="mr-2">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel>Remind me with a call</CheckboxLabel>
          </Checkbox>
        </FormControl>

        {/* Select Menu for Audio Files (conditionally rendered) */}
        {remindWithCall && (
          <AudioFileSelect
            label="Choose Audio for Call"
            placeholder="Select an audio file"
            selectedValue={selectedAudioFileId}
            onValueChange={(value)=>handleAudioFileChange(value)}
            // Optionally pass isDisabled based on current modal state if needed
          />
        )}

        {reminder?.generatedAudio && <VoiceCard key={id} audioFile={reminder?.generatedAudio} onDelete={()=>{}} />}
        {/* The save button is now in the header */}
      </View>
    </SafeAreaView>
  );
}
