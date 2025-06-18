import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Link, LinkText } from '@/components/ui/link';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
    Blinds,
    ChevronRight,
    HeadsetIcon,
    MessageCircleQuestionIcon,
    Settings,
    Tablets,
    User,
} from "lucide-react-native";
import { useState } from 'react';
import {
    ScrollView
} from 'react-native';

// export default function ProfileScreen() {
//   // State to manage login status
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // Dummy notification data
//   const notifications = [
//     { id: '1', text: 'Your daily reminder is set for 3 PM.' },
//     { id: '2', text: 'New feature: Set location-based reminders!' },
//     { id: '3', text: 'You have 2 pending reminders.' },
//     { id: '4', text: 'Welcome to the updated Reminder App!' },
//   ];

//   // Handler for login/logout button press
//   const handleAuthPress = () => {
//     setIsLoggedIn(!isLoggedIn); // Toggle login status
//     // In a real app, you would integrate with your authentication service here (e.g., Firebase Auth)
//     if (!isLoggedIn) {
//       console.log('User logged in!');
//       // Perform actual login logic
//     } else {
//       console.log('User logged out!');
//       // Perform actual logout logic
//     }
//   };

//   // Render item for the FlatList (each notification)
//   const renderNotificationItem = ({ item }) => (
//     <View
//       className="
//         bg-white p-4 rounded-md mb-3 shadow-md border-l-4 border-indigo-500
//       "
//     >
//       <Text className="text-base text-gray-800">
//         {item.text}
//       </Text>
//     </View>
//   );

//   return (
//     <SafeAreaView className="flex-1 pt-12 bg-gray-100">
//       {/* Profile Heading */}
//       <View className="mb-6 items-center">
//         <Text className="text-4xl font-bold text-gray-900">
//           Profile
//         </Text>
//       </View>

//       {/* Avatar Section */}
//       <View className="items-center mb-8">
//         <Image
//           source={{ uri: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=AVATAR' }} // Placeholder avatar image
//           className="w-24 h-24 rounded-full border-2 border-blue-500"
//         />
//         <Text className="text-lg font-medium text-gray-700 mt-2">John Doe</Text>
//         <Text className="text-sm text-gray-500">john.doe@example.com</Text>
//       </View>

//       {/* Notifications Section */}
//       <View className="flex-1 px-5"> {/* flex-1 ensures this section takes available space */}
//         <View className="flex-row justify-between items-center mb-4">
//           <Text className="text-2xl font-semibold text-gray-800">
//             Notifications
//           </Text>
//           <TouchableOpacity
//             onPress={() => console.log('View All Notifications')}
//           >
//             <Text className="text-base text-blue-500">View All</Text>
//           </TouchableOpacity>
//         </View>
//         {notifications.length > 0 ? (
//           <FlatList
//             data={notifications}
//             keyExtractor={(item) => item.id}
//             renderItem={renderNotificationItem}
//             contentContainerStyle={{ paddingBottom: 20 }}
//             showsVerticalScrollIndicator={false}
//           />
//         ) : (
//           <View className="flex-1 items-center justify-center">
//             <Text className="text-lg text-gray-500">No new notifications.</Text>
//           </View>
//         )}
//       </View>

//       {/* Login/Logout Section - Moved to bottom */}
//       <View className="px-5 pb-4 items-center">
//         <TouchableOpacity
//           onPress={handleAuthPress}
//           className={`
//             w-full rounded-xl py-4 items-center justify-center mb-20 md:mb-0
//             ${isLoggedIn ? 'bg-red-500' : 'bg-blue-600'}
//           `}
//         >
//           <Text className="text-xl font-bold text-white">
//             {isLoggedIn ? 'Log Out' : 'Log In'}
//           </Text>
//         </TouchableOpacity>
//         {isLoggedIn && (
//           <Text className="text-base text-gray-600 mt-3">
//             You are currently logged in.
//           </Text>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }


const MobileProfilePage = () => {
  const [openLogoutAlertDialog, setOpenLogoutAlertDialog] =
    useState(false);
  return (
    <ScrollView style={{ display: "flex" }}>
      <VStack className="px-5 py-4 my-20 flex-1" space="lg">
        <ProfileCard />
        <LogoutButton
          openLogoutAlertDialog={openLogoutAlertDialog}
          setOpenLogoutAlertDialog={setOpenLogoutAlertDialog}
        />
      </VStack>
    </ScrollView>
  );
};

const ProfileCard = () => {
  return (
    <HStack className="justify-between items-center">
      <HStack space="md">
        <Avatar className="bg-primary-500">
          <AvatarFallbackText>Henry Stan</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
            }}
          />
        </Avatar>
        <VStack>
          <Text>Henry Stan</Text>
          <Link>
            <LinkText
              size="sm"
              className="text-typography-500 no-underline hover:text-typography-500 active:text-typography-500"
            >
              Show Profile
            </LinkText>
          </Link>
        </VStack>
      </HStack>
      <Pressable>
        <Icon as={ChevronRight} />
      </Pressable>
    </HStack>
  );
};

const PersonalInfoSection = () => {
  return (
    <VStack space="lg">
      <HStack className="justify-between">
        <HStack space="md">
          <Icon as={User} />
          <Text>Personal Info</Text>
        </HStack>
        <Pressable>
          <Icon as={ChevronRight} />
        </Pressable>
      </HStack>
      <HStack className="justify-between">
        <HStack space="md">
          <Icon as={Settings} />
          <Text>Account</Text>
        </HStack>
        <Pressable>
          <Icon as={ChevronRight} />
        </Pressable>
      </HStack>
    </VStack>
  );
};

const HostingSection = () => {
  return (
    <VStack space="lg">
      <Heading className="mb-1">Hosting</Heading>
      <HStack className="justify-between">
        <HStack space="md">
          <Icon as={Blinds} />
          <Text>Host a home</Text>
        </HStack>
        <Pressable>
          <Icon as={ChevronRight} />
        </Pressable>
      </HStack>
      <HStack className="justify-between">
        <HStack space="md">
          <Icon as={Tablets} />
          <Text>Host an experience</Text>
        </HStack>
        <Pressable>
          <Icon as={ChevronRight} />
        </Pressable>
      </HStack>
    </VStack>
  );
};

const SupportSection = () => {
  return (
    <VStack space="lg">
      <Heading className="mb-1">Support</Heading>
      <HStack className="justify-between">
        <HStack space="md">
          <Icon as={MessageCircleQuestionIcon} />
          <Text>Get Help</Text>
        </HStack>
        <Pressable>
          <Icon as={ChevronRight} />
        </Pressable>
      </HStack>
      <HStack className="justify-between">
        <HStack space="md">
          <Icon as={HeadsetIcon} />
          <Text>Contact Support</Text>
        </HStack>
        <Pressable>
          <Icon as={ChevronRight} />
        </Pressable>
      </HStack>
    </VStack>
  );
};

const LogoutButton = ({ setOpenLogoutAlertDialog }: any) => {
  return (
    <Button
      action="secondary"
      variant="outline"
      onPress={() => {
        setOpenLogoutAlertDialog(true);
      }}
    >
      <ButtonText>Logout</ButtonText>
    </Button>
  );
};

export default MobileProfilePage;
