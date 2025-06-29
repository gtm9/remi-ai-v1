import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

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
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  onAddReminder,
  reminderTitle,
  setReminderTitle,
  reminderDescription,
  setReminderDescription,
}) => {

    const [expoPushToken, setExpoPushToken] = useState('');
    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
    );

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

    const addReminderFinal = async () => {
        onAddReminder();
        await schedulePushNotification()
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
                onChangeText={setReminderDescription}
                placeholder="Reminder Description"
                />
            </Input>
            </ModalBody>
            <ModalFooter>
            <Button
                variant="outline"
                action="secondary"
                onPress={onClose}
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

export async function schedulePushNotification() {
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
        // set custom time
        seconds: 2,
        year: 2025,
        month: 6,
        day: 29,
        hour: 13,
        minute: 35,
        second: 0
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
