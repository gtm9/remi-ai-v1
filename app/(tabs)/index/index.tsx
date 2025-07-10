import { useGeneratedAudioStore } from "@/app/store/audioFileStore";
import { ReminderItem, useReminderStore } from "@/app/store/reminderStore";
import { AddReminderModal } from "@/components/AddReminderModal";
import { ReminderCard } from "@/components/ReminderCard";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AudioFileItem } from "@/types/audio";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { BellPlusIcon } from "lucide-react-native";
import { cssInterop } from "nativewind";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity, View
} from 'react-native';
import Animated, { FadeOut, Layout, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";


cssInterop(SafeAreaView, { className: "style" });
cssInterop(ExpoImage, { className: "style" });

export default function HomeScreen() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [remindWithCall, setRemindWithCall] = useState(false);
  const [selectedAudioFileId, setSelectedAudioFileId] = useState<string | null>('');

  const [isPredicting, setIsPredicting] = useState(false); // New loading state for prediction
  const [isPlayingGradioAudio, setIsPlayingGradioAudio] = useState<string | null>(null); // Stores ID of currently playing audio

  const CLOUDFARE_GET_AUDIO_API_ENDPOINT_PREFIX="https://remi-r2.src.xyz/"
  
  const reminders = useReminderStore((state) => state.reminders);
  const addReminder = useReminderStore((state) => state.addReminder);
  const deleteReminder = useReminderStore((state) => state.deleteReminder);
  const addGeneratedAudio = useGeneratedAudioStore((state) => state.addGeneratedAudio);
  const generatedAudios = useGeneratedAudioStore((state) => state.generatedAudios); // To display them later
  const removeGeneratedAudio = useGeneratedAudioStore((state) => state.removeGeneratedAudio); // To manage them
  const getReminderById = useReminderStore((state) => state.getReminderById);
  const BACKEND_BASE_URL = "https://8fed9ad1a857.ngrok-free.app";

  // A reusable function to call your Gradio prediction endpoint
  const callGradioPredictionApi = async (audioRemoteUrl: string, additionalText: string = "Hello!!", reminderid: string) => {
         // Basic validation
      if (!audioRemoteUrl) {
          Alert.alert("Error", "No audio URL provided for prediction.");
          return;
      }

      try {
        console.log("Preparing prediction request...");

        // 1. Prepare the request body as a JSON object
        const requestBody = {
            audioUrl: audioRemoteUrl, // Send the public URL of the audio file
            text: additionalText,
            infer_mode: "ordinary reasoning",
            max_text_tokens_per_sentence: 20,
            sentences_bucket_max_size: 1,
            param_5: true,
            param_6: 0,
            param_7: 0,
            param_8: 0.1,
            param_9: 0,
            param_10: 1,
            param_11: 3,
            param_12: 50,
        };

        console.log("Sending prediction request to backend with URL in body...");

        // 2. Make the fetch request with JSON body
        const response = await fetch(`${BACKEND_BASE_URL}/predict-gradio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // IMPORTANT: Now sending JSON
            },
            body: JSON.stringify(requestBody), // Convert JS object to JSON string
        });

        console.log("93 response",response);

        // 3. Handle the response
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Backend error status: ${response.status}, body: ${errorBody}`);
            throw new Error(`Backend request failed: ${response.status} - ${errorBody}`);
        }

        const result = await response.json();
        console.log('Gradio prediction result from backend:', result);
        const generatedAudioUrl = CLOUDFARE_GET_AUDIO_API_ENDPOINT_PREFIX + result.predictedAudioUrl.fileKey;

        const reminder = getReminderById(reminderid)
        if (reminder) {
          const generatedAudio: AudioFileItem = {
            id: `generated-${Date.now()}`, // Generate a unique ID
            name: result.predictedAudioUrl.fileKey,
            uri: generatedAudioUrl,
            type: 'remote',
          }
          reminder.generatedAudio = generatedAudio
          console.log("106 reminder",reminder)
          addReminder(reminder)
        }
        
        console.log("116 generatedAudioUrl",generatedAudioUrl)
        Alert.alert('Prediction Success', 'Check console for the Gradio result!');
        return result;

    } catch (error: any) {
        console.error('Error during Gradio prediction via backend:', error);
        Alert.alert('Prediction Failed', `Could not get prediction: ${error.message || 'Unknown error'}`);
        throw error;
    }
  };

  const handleGradioPrediction = async (audioRemoteUrl: string, promptText: string, reminderid: string) => {
    setIsPredicting(true); // Start loading indicator
    setModalVisible(false);
    console.log("119 audioRemoteUrl",audioRemoteUrl)
    try {
        const result = await callGradioPredictionApi(audioRemoteUrl, promptText, reminderid);
        // const result = await callGradioPredictionApi("https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav",reminderDescription);

        if (result && result.predictedAudioUrl.data[0].value.url) {

            // const newGeneratedAudio: GeneratedAudioItem = {
            //     id: `received-at-${Date.now()}`, // Generate a unique ID
            //     url: result.predictedAudioUrl.data[0].value.url,
            //     generatedAt: result.predictedAudioUrl.time,
            //     promptText: promptText,
            //     // rawGradioResult: result.rawGradioResult, // Optional: if you passed it from backend
            // };

            // console.log("124 newGeneratedAudio",newGeneratedAudio)
            
            // // --- Store the generated audio in Zustand ---
            // addGeneratedAudio(newGeneratedAudio);

            Alert.alert("Gradio Prediction Success", `Generated audio stored! Play it from the list.`);

            // Optionally, play it immediately
            // await playGeneratedAudio(newGeneratedAudio.url, newGeneratedAudio.id);

        } else {
            Alert.alert("Prediction Result", "Gradio returned no usable audio URL in the expected format.");
        }

    } catch (error) {
        console.error("Failed to get Gradio prediction:", error);
        // Error handling is already in callGradioPredictionApi, but you can add more UI feedback here
    } finally {
        setIsPredicting(false); // End loading indicator
    }
  };

  const handleAddReminder = async () => {
    if (!reminderTitle.trim()) {
      alert('Reminder title cannot be empty!');
      return;
    }
    const newReminder: ReminderItem = {
      id: `${Date.now()}`,
      title: reminderTitle,
      description: reminderDescription,
      date: reminderDate.toISOString(),
      remindWithCall: remindWithCall,
      selectedAudioFileId: selectedAudioFileId
    };
    addReminder({ ...newReminder });
    if (remindWithCall) {
      // callGradioPredictionApi(R2_PUBLIC_BASE_URL+selectedAudioFileId,reminderDescription);
      // const generatedAudioResult = callGradioPredictionApi("https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav",reminderDescription);

      await handleGradioPrediction(CLOUDFARE_GET_AUDIO_API_ENDPOINT_PREFIX+selectedAudioFileId,reminderDescription, newReminder.id);

    }

    setReminderTitle('');
    setModalVisible(false)
    setReminderDescription('');
    setReminderDate(new Date());
    setSelectedAudioFileId('')
    setRemindWithCall(false)
  };

  const handleDeleteReminder = (idToDelete: string) => {
    // Use the deleteReminder from the store
    deleteReminder(idToDelete);
    console.log("Deleted Reminder ID:", idToDelete);
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-background-0 relative">
        <View className="py-4 px-5 flex-row items-center justify-between w-full">
          <Heading className="mb-2 xl:mb-[18px] text-4xl lg:text-5xl xl:text-[56px]">
            Remi
          </Heading>
          {reminders.length !== 0 && <TouchableOpacity
            className="px-3 rounded-md"
            onPress={() => setModalVisible(true)}
          >
            <Icon as={BellPlusIcon} className="text-typography-500 m-2 w-8 h-8" />
          </TouchableOpacity>}
        </View>
        {reminders.length === 0 ? (<Text className="py-4 px-5 flex-row items-center w-full text-sm lg:text-base xl:text-lg">
          Tell Remi what you need reminded of
        </Text>) : 
        (<Text className="py-4 px-5 flex-row items-center w-full text-sm lg:text-base xl:text-lg">
          Reminders
        </Text>)}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {reminders.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <TouchableOpacity
                activeOpacity={0.7} // This provides a subtle press animation
                onPress={() => setModalVisible(true)}
                className="p-8 rounded-full items-center justify-center mb-4" // Adjust padding for size
              >
                <Icon as={BellPlusIcon} className="text-typography-500 m-2 w-32 h-32" />
              </TouchableOpacity>
              <Text className="text-lg text-typography-500">Add a reminder</Text>
            </View>
          ) : (
            <HStack
              className="flex-wrap justify-center gap-x-3 gap-y-4 md:gap-x-4 lg:gap-x-7 lg:gap-y-8 py-4 px-5 md:px-8 md:pt-9 xl:pt-[90px] lg:pt-[70px] lg:px-[70px] xl:px-[100px] max-w-[1730px] mx-auto"
            >
              <VStack space="md" reversed={false} className="pb-20">
                {reminders.map((reminder) => (
                  <Animated.View
                    key={reminder.id}
                    layout={Layout.duration(300)}
                    exiting={FadeOut.duration(300)}
                    entering={SlideInRight.duration(300)}
                  >
                    <Pressable
                      disabled={isPredicting}
                      onPress={() => router.push({
                        pathname: `/details/${reminder.id}`,
                        params: {
                          id: reminder.id,
                          title: reminder.title,
                          description: reminder.description,
                        },
                      })}
                    >
                      <Box className="w-[350px] border-2 border-solid" >
                        <ReminderCard
                          id={reminder.id}
                          title={reminder.title}
                          description={reminder.description}
                          audioFileName={reminder.selectedAudioFileId}
                          remindWithCall={reminder.remindWithCall}
                          onDelete={handleDeleteReminder}
                        />
                      </Box>
                    </Pressable>
                  </Animated.View>
                ))}
              </VStack>
            </HStack>
          )}
        </ScrollView>
      </SafeAreaView>

      <AddReminderModal
        isOpen={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAddReminder={handleAddReminder}
        reminderTitle={reminderTitle}
        setReminderTitle={setReminderTitle}
        reminderDescription={reminderDescription}
        setReminderDescription={setReminderDescription}
        reminderDate={reminderDate}
        setReminderDate={setReminderDate}
        remindWithCall={remindWithCall}
        setRemindWithCall={setRemindWithCall}
        selectedAudioFileId={selectedAudioFileId}
        setSelectedAudioFileId={setSelectedAudioFileId}
      />
    </>
  );
}
