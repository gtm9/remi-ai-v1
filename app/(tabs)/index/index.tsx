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
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { BellPlusIcon } from "lucide-react-native";
import { cssInterop } from "nativewind";
import React, { useState } from "react";
import {
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

  const reminders = useReminderStore((state) => state.reminders);
  const addReminder = useReminderStore((state) => state.addReminder);
  const deleteReminder = useReminderStore((state) => state.deleteReminder);
  
  const handleAddReminder = () => {
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
    setReminderTitle('');
    setReminderDescription('');
    setReminderDate(new Date());
    setModalVisible(false);
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
                      onPress={() => router.push({
                        pathname: `/details/${reminder.id}`,
                        params: {
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