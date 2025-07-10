import { makeCallViaBackend } from '@/backend-calls/backend';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Button, Platform, Text, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

async function sendPushNotification(expoPushToken: string) {
  // Get the current date and time
  const now = new Date();
  
  // Calculate a time 1 minute from now for testing purposes
  const futureDate = new Date(now.getTime() + 60 * 1000); // Add 60 seconds (60,000 milliseconds)

  console.log("\n--- Scheduling Debug Information ---");
  console.log("Current Time (Local):", now.toLocaleString());
  console.log("Current Time (ISO - UTC):", now.toISOString());
  console.log("Scheduled Time (Local):", futureDate.toLocaleString());
  console.log("Scheduled Trigger Components (Local Time values):");
  console.log("Year:", futureDate.getFullYear());
  console.log("Month:", futureDate.getMonth() + 1); // Month is 0-indexed in Date, 1-indexed for trigger
  console.log("Day:", futureDate.getDate());
  console.log("Hour:", futureDate.getHours());
  console.log("Minute:", futureDate.getMinutes());
  console.log("Second:", futureDate.getSeconds());
  console.log("Timezone (from device):", deviceTimeZone);
  console.log("-----------------------------------\n");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification", // Changed title for clarity
      body: `Scheduled for ${futureDate.toLocaleTimeString()} local time!`, // Dynamic body
      data: { scheduledFor: futureDate.toISOString() },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      year: futureDate.getFullYear(),
      day: futureDate.getDate(),
      month: futureDate.getMonth() + 1, // Remember to add 1 for month!
      hour: futureDate.getHours(),
      minute: futureDate.getMinutes(),
      seconds: 0,
      timezone: deviceTimeZone // Explicitly set device timezone
    },
  });
  console.log("Notification scheduled successfully! Check console for debug info.");
}

const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const [isCalling, setIsCalling] = useState(false);

  const handleMakeCall = async () => {
    setIsCalling(true); // Show a loading indicator
    try {
      const response = await makeCallViaBackend("https://remi-r2.src.xyz/generated_audio_sources/uploaded_1752184065049.wav");
      // You can do something with the response here if needed
      console.log("Call initiation finished:", response);
    } catch (error) {
      console.error("Failed to initiate call:", error);
      // Error alert is already handled in makeCallViaBackend
    } finally {
      setIsCalling(false); // Hide loading indicator
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }

    const notificationListener = Notifications.addNotificationReceivedListener(async notification => {
      console.log("123 making a call")
      handleMakeCall()

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

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map(c => c.id),
        null,
        2
      )}`}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title1: {notification && notification.request.content.title} </Text>
        <Text className="text-gray-700">
          TimeZone: {deviceTimeZone}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}
