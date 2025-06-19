import ReminderCard from "@/components/ReminderCard";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { cssInterop } from "nativewind";
import React, { useState } from "react";
import {
  // Modal, 
  ScrollView,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(SafeAreaView, { className: "style" });
cssInterop(ExpoImage, { className: "style" });

// Define the Reminder type consistent with ReminderCard's expectation
interface ReminderItem {
  id: string;
  title: string;
  description: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  // Update state type to include id
  const [reminders, setReminders] = useState<ReminderItem[]>([]);


  const handleAddReminder = () => {
    if (!reminderTitle.trim()) { // Basic validation
      alert('Reminder title cannot be empty!');
      return;
    }
    const newReminder: ReminderItem = {
      id: Date.now().toString(), // Simple unique ID using timestamp
      title: reminderTitle,
      description: reminderDescription,
    };
    setReminders([...reminders, newReminder]);
    console.log("New Reminder:", newReminder);
    setReminderTitle('');
    setReminderDescription('');
    setModalVisible(false);
  };

  const handleDeleteReminder = (idToDelete: string) => {
    // Filter out the reminder with the matching ID
    setReminders(reminders.filter(reminder => reminder.id !== idToDelete));
    console.log("Deleted Reminder ID:", idToDelete);
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-background-0 relative">
        <View className="py-4 px-5 flex-row items-center justify-between w-full">
          <Heading className="mb-2 xl:mb-[18px] text-4xl lg:text-5xl xl:text-[56px]">
            Remi
          </Heading>
          <TouchableOpacity
            className="px-3 rounded-md bg-blue-700"
            onPress={() => setModalVisible(true)}
          >
            <Icon as={Plus} className="text-typography-500 m-2" />
          </TouchableOpacity>
        </View>
          <Text className="py-4 px-5 flex-row items-center w-full text-sm lg:text-base xl:text-lg">
            Tell Remi what you need reminded of
          </Text>
        <ScrollView>
          <HStack
            className="flex-wrap justify-center gap-x-3 gap-y-4 md:gap-x-4 lg:gap-x-7 lg:gap-y-8 py-4 px-5 md:px-8 md:pt-9 xl:pt-[90px] lg:pt-[70px] lg:px-[70px] xl:px-[100px] max-w-[1730px] mx-auto"
          >
            <VStack space="md" reversed={false} className="pb-20">
              {reminders.map((reminder, index) => (
                <Pressable
                  key={index} // Consider a more robust key in a real app (e.g., a unique ID from your data)
                  onPress={() => router.push("/actionsheet")}
                >
                  <Box className="w-[350px] border-2 border-solid" >
                    <ReminderCard
                      id={reminder.id} // Pass the id to ReminderCard
                      title={reminder.title}
                      description={reminder.description}
                      onDelete={handleDeleteReminder} // Pass the delete function
                    />                  </Box>
                </Pressable>
              ))}
            </VStack>
          </HStack>
        </ScrollView>
      </SafeAreaView>

      <Modal
        isOpen={isModalVisible}
        onClose={() => {
          setModalVisible(false)
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" className="text-typography-950">
              Add Reminder
            </Heading>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                size="md"
                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
              />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
              <Input
                className="p-3 mb-3"
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
              >
                <InputField 
                  placeholder="Reminder Title"
                  value={reminderTitle}
                  onChangeText={setReminderTitle}
                />
              </Input>
              <Input
                className="p-3 mb-4 h-20"
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
              >
                <InputField 
                  value={reminderDescription}
                  multiline
                  numberOfLines={4}
                  onChangeText={setReminderDescription}
                  placeholder="Reminder Description"
                />
              </Input>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => {
                setModalVisible(false)
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={() => {
                handleAddReminder()
              }}
            >
              <ButtonText>Add</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-4/5">
            <Heading className="mb-4 text-2xl">Create New Reminder</Heading>
            <TextInput
              className="border border-gray-300 p-3 rounded-md mb-3 text-base"
              placeholder="Reminder Title"
              value={reminderTitle}
              onChangeText={setReminderTitle}
            />
            <TextInput
              className="border border-gray-300 p-3 rounded-md mb-4 text-base"
              placeholder="Reminder Description"
              value={reminderDescription}
              onChangeText={setReminderDescription}
              multiline
              numberOfLines={4}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-2 bg-gray-200 rounded-md mr-2"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-800 text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-blue-600 rounded-md"
                onPress={handleAddReminder}
              >
                <Text className="text-white text-base">Add Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}
    </>
  );
}