import { useAudioFilesStore } from '@/app/store/audioFileStore';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CheckIcon, CloseIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AudioFileSelect } from './SelectAudioFile';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from './ui/checkbox';
import { FormControl } from './ui/form-control';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
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
    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
    );

    // Reanimated shared value for height
    const descriptionHeight = useSharedValue(80); // Initial height for h-20 (assuming 20 * 4 = 80px)

    // Animated style for the Input component
    const animatedDescriptionStyle = useAnimatedStyle(() => {
      return {
        height: withTiming(descriptionHeight.value, {
          duration: 300, // Animation duration
          easing: Easing.ease, // Smooth easing
        }),
      };
    });

    // This useEffect handles initial setup: permissions and fetching Cloudflare files
    useEffect(() => {
        const initializeScreen = async () => {
            await fetchAudioFiles();
        };
        initializeScreen();
    }, []); // Empty dependency array means it runs once on mount

    useEffect(() => {
      registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

      if (Platform.OS === 'android') {
          Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
      }
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
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
        await schedulePushNotification(reminderDate)
    }

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

            <DateTimePicker
              value={reminderDate}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setReminderDate(selectedDate);
                }
              }}
              style={{ marginBottom: 16 }}
            />

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

let futureDate = new Date(2025, 6, 29, 12, 51, 0);

export async function schedulePushNotification(reminderDate: Date) {
    // Ensure the date is in the future
    if (futureDate.getTime() <= Date.now()) {
        console.warn("Attempted to schedule a notification in the past or present. Adjusting to 1 minute from now.");
        futureDate = new Date(Date.now() * 1000);
    }
    await Notifications.scheduleNotificationAsync({
        content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        data: { data: 'goes here', test: { test1: 'more data' }, url: '/settings' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          year: reminderDate.getFullYear(),
          month: reminderDate.getMonth(),
          day: reminderDate.getDay(),
          hour: reminderDate.getHours(),
          minute: reminderDate.getMinutes(),
          second: reminderDate.getSeconds()
        },
    });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
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
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
