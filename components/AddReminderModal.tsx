import { useAudioFilesStore } from '@/app/store/audioFileStore';
import { makeCallViaBackend } from '@/backend-calls/backend';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CheckIcon, CloseIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from "@/components/ui/text";
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import Animated, {
  Layout,
  useSharedValue
} from 'react-native-reanimated';
import { AudioFileSelect } from './SelectAudioFile';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from './ui/checkbox';
import { FormControl } from './ui/form-control';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReminder: () => void;
  reminderTitle: string;
  setReminderTitle: (title: string) => void;
  reminderDescription: string;
  setReminderDescription: (description: string) => void;
  reminderDate: Date;
  setReminderDate: (date: Date) => void;
  remindWithCall: boolean;
  setRemindWithCall: (remindWithCall: boolean) => void;
  selectedAudioFileId: string | null;
  setSelectedAudioFileId: (selectedAudioFileId: string | null) => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  onAddReminder,
  reminderTitle,
  setReminderTitle,
  reminderDescription,
  setReminderDescription,
  reminderDate,
  setReminderDate,
  remindWithCall,
  setRemindWithCall,
  selectedAudioFileId,
  setSelectedAudioFileId
}) => {

    const audioFiles = useAudioFilesStore((state) => state.audioFiles);
    const fetchAudioFiles = useAudioFilesStore((state) => state.fetchAudioFiles);

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
      undefined
    );
    const [showPickerMode, setShowPickerMode] = useState<'date' | 'time' | null>(null);
    const [isCalling, setIsCalling] = useState(false);

    // Reanimated shared value for height
    const descriptionHeight = useSharedValue(80); // Initial height for h-20 (assuming 20 * 4 = 80px)

    const handleMakeCall = async () => {
      setIsCalling(true); // Show a loading indicator
      try {
        const response = await makeCallViaBackend();
        // You can do something with the response here if needed
        console.log("Call initiation finished:", response);
      } catch (error) {
        console.error("Failed to initiate call:", error);
        // Error alert is already handled in makeCallViaBackend
      } finally {
        setIsCalling(false); // Hide loading indicator
      }
    };

    // This useEffect handles initial setup: permissions and fetching Cloudflare files
    useEffect(() => {
        const initializeScreen = async () => {
            await fetchAudioFiles();
        };
        initializeScreen();
    }, []); // Empty dependency array means it runs once on mount

    useEffect(() => {
        registerForPushNotificationsAsync()
          .then(token => setExpoPushToken(token ?? ''))
          .catch((error: any) => setExpoPushToken(`${error}`));
    
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
          handleMakeCall(); // Call the function to handle call initiation
        });
    
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(response);
        });
    
        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
    }, []);

    const handleRemindWithCallChange = (isChecked: boolean) => {
      setRemindWithCall(isChecked);
      if (isChecked) {
        // Expand the description box (assuming h-24 is 24 * 4 = 96px)
        descriptionHeight.value = 96;
      } else {
        // Collapse the description box
        descriptionHeight.value = 80;
        setSelectedAudioFileId(null); // Clear selection if checkbox is unchecked
      }
    };

    const addReminderFinal = async () => {
        onAddReminder();
        // await schedulePushNotification(timeZoneFormatter(reminderDate))
        await schedulePushNotification(reminderDate)
    }

        // --- REFINED onChange handler for DateTimePicker ---
    const onDateTimeChange = (event: any, selectedDateTime: Date | undefined) => {

      // This log is for debugging purposes to see event types
      console.log(`DateTimePicker onChange event type: ${event.type}, Platform: ${Platform.OS}`);

      // On Android, the native dialog dismisses itself, so we hide the RN component
      if (Platform.OS === 'android') {
          setShowPickerMode(null); // Unmounts the component after interaction on Android
      }
      // // On iOS, the picker is inline and doesn't auto-dismiss.
      // // We only hide it if the user explicitly 'dismissed' (cancelled).
      else if (Platform.OS === 'ios' && event.type === 'dismissed') {
          setShowPickerMode(null); // Hide on iOS only if user cancels
      }
      // If event.type === 'set' on iOS, we deliberately DO NOT hide it here,
      // so it stays visible for further interaction or until user taps elsewhere.

      if (event.type === 'set' && selectedDateTime) {
        console.log("172 selectedDateTime")
          setReminderDate(selectedDateTime);
      }
      // No 'else if (event.type === 'dismissed')' for Android specifically here,
      // as the initial `setShowPickerMode(null)` for Android covers both 'set' and 'dismissed' events.
    };


    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
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
          <ModalBody style={{ display: "flex" }}>
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

            {/* Description Input (potentially expands) */}
            <Input
              className={`p-3 mb-4 ${remindWithCall ? 'h-40' : 'h-20'}`} // Conditional height for animation
              variant="outline"
              size="md"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}
            >
              <InputField
                value={reminderDescription}
                onChangeText={setReminderDescription}
                placeholder="Reminder Description"
                multiline // Allow multiline when expanded
                numberOfLines={remindWithCall ? 3 : 2} // More lines when expanded
              />
            </Input>

            {/* Description Input with Reanimated */}
            {/* <Animated.View style={[animatedDescriptionStyle]}>
              <Input // Input needs to be wrapped or directly used with Animated.Input if Gluestack supports it
                className={`p-3 mb-4 ${remindWithCall ? 'h-30' : 'h-15'}`}
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
                // The `className` for height is removed here as it's now controlled by Reanimated style
              >
                <InputField
                  value={reminderDescription}
                  onChangeText={setReminderDescription}
                  placeholder="Reminder Description"
                  multiline={remindWithCall}
                  numberOfLines={remindWithCall ? 3 : 2}
                  // Tailwind classes for padding are applied to the parent Animated.View or here if Input supports it
                  className="p-3" // Apply padding via className for Gluestack InputField directly if possible
                />
              </Input>
            </Animated.View> */}

            {/* DateTimePicker trigger buttons */}
            <Animated.View layout={Layout.duration(300)} style={{ marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setShowPickerMode('date')} className="p-3 border border-gray-300 rounded-md bg-white">
                  <Text className="text-gray-700">Date: {reminderDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPickerMode('time')} className="p-3 border border-gray-300 rounded-md bg-white mt-2">
                  <Text className="text-gray-700">Time: {reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Conditionally render DateTimePicker */}
            {showPickerMode && (
                <DateTimePicker
                    value={reminderDate}
                    mode={showPickerMode}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate)=>onDateTimeChange(event, selectedDate)}
                />
            )}

            {Platform.OS === 'ios' && <DateTimePicker
              value={reminderDate}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setReminderDate(selectedDate)
                }
              }}
              style={{ marginBottom: 16 }}
            />}

            {/* Checkbox for "Remind me with a call" */}
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
                onValueChange={setSelectedAudioFileId}
                // Optionally pass isDisabled based on current modal state if needed
              />
            )}

          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={onClose}
              className='mr-3'
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button onPress={addReminderFinal}>
              <ButtonText>Add</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
};

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export async function schedulePushNotification(reminderDate: Date) {
  console.log("347 reminderDate",reminderDate)
  console.log("348 getFullYear",reminderDate.getFullYear())
  console.log("349 getDay",reminderDate.getDate())
  console.log("350 getMonth",reminderDate.getMonth()+1)
  console.log("351 getHours",reminderDate.getHours())
  console.log("352 getMinutes",reminderDate.getMinutes())
  console.log("353 getSeconds",reminderDate.getSeconds())

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      year: reminderDate.getFullYear(),
      day: reminderDate.getDate(),
      month: reminderDate.getMonth()+1,
      hour: reminderDate.getHours(),
      minute: reminderDate.getMinutes(),
      seconds: 0,
    },
  });
}
