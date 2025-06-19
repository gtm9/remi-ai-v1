import ReminderCard from "@/components/ReminderCard";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { cssInterop } from "nativewind";
import React from "react";
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(SafeAreaView, { className: "style" });
cssInterop(ExpoImage, { className: "style" });
const componentsList = [
  {
    title: "ActionSheet",
    link: "/actionsheet",
    url: "https://i.imgur.com/WOc44VL.png",
    darkUrl: "https://i.imgur.com/lXBHovv.png",
  },
  {
    title: "AlertDialog",
    link: "/alert-dialog",
    url: "https://i.imgur.com/8wbsESv.png",
    darkUrl: "https://i.imgur.com/LRCCXxT.png",
  },
  {
    title: "Alert",
    link: "/alert",
    url: "https://i.imgur.com/xfmvFSy.png",
    darkUrl: "https://i.imgur.com/C8yWYco.png",
  },
    {
    title: "Alert",
    link: "/alert",
    url: "https://i.imgur.com/xfmvFSy.png",
    darkUrl: "https://i.imgur.com/C8yWYco.png",
  },
    {
    title: "Alert",
    link: "/alert",
    url: "https://i.imgur.com/xfmvFSy.png",
    darkUrl: "https://i.imgur.com/C8yWYco.png",
  },
    {
    title: "Alert",
    link: "/alert",
    url: "https://i.imgur.com/xfmvFSy.png",
    darkUrl: "https://i.imgur.com/C8yWYco.png",
  },
];

cssInterop(SafeAreaView, { className: "style" });
cssInterop(ExpoImage, { className: "style" });

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <SafeAreaView className="flex-1 bg-background-0 relative">
        <View className="py-4 px-5 flex-row items-center justify-between w-full">
          <Heading className="mb-2 xl:mb-[18px] text-4xl lg:text-5xl xl:text-[56px]">
            Remi
          </Heading>
          <TouchableOpacity
            className="px-3 rounded-md bg-blue-700"
            onPress={() => console.log('Menu button pressed')}
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
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className=" border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className="h-[100px] w-[350px] bg-primary-300 border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className="h-[100px] w-[350px] bg-primary-300 border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className="h-[100px] w-[350px] bg-primary-300 border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className="h-[100px] w-[350px] bg-primary-300 border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className="h-[100px] w-[350px] bg-primary-300 border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className="h-[100px] w-[350px] bg-primary-300 border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
              <Pressable
                onPress={()=>router.push("/actionsheet")}
              >
                <Box className="h-[100px] w-[350px] bg-primary-300 border-2 border-solid" >
                  <ReminderCard title={"Reminder1"} description={"Reminder1"} />
                </Box>
              </Pressable>
            </VStack>
          </HStack>
        </ScrollView>
      </SafeAreaView>
    </>
    
  );
}
