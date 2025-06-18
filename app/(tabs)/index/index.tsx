import ReminderCard from "@/components/ReminderCard";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React from "react";
import { ScrollView } from 'react-native';
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

const Header = () => {
  return (
    <HStack className="flex-1 max-w-[1730px] w-full mx-auto justify-between">
      <VStack className="w-full md:max-w-[630px] lg:max-w-[400px] xl:max-w-[480px] mx-5 md:ml-8 mb-8 mt-10 lg:my-[44px] xl:ml-[80px] flex-1">
        <Heading className="mb-2 xl:mb-[18px] text-4xl lg:text-5xl xl:text-[56px]">
          Remi
        </Heading>
        <Text className="text-sm lg:text-base xl:text-lg">
          Tell Remi what you need reminded of
        </Text>
      </VStack>
      {/* <VStack className="hidden lg:flex flex-1 max-h-[510px] h-full aspect-[1075/510]">
        <ExpoImage
          source={{
            uri:"https://i.imgur.com/icZHMep.png"
          }}
          alt="header_image"
          className="flex-1"
          cachePolicy="memory-disk"
        />
      </VStack> */}
    </HStack>
  );
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background-0 relative">
      <ScrollView>
        <Box className="bg-background-50 flex-1">
          <Header />
        </Box>
        <HStack
          className="flex-wrap justify-center gap-x-3 gap-y-4 md:gap-x-4 lg:gap-x-7 lg:gap-y-8 py-6 px-5 md:px-8 md:pt-9 xl:pt-[90px] lg:pt-[70px] lg:px-[70px] xl:px-[100px] max-w-[1730px] mx-auto"
        >
          <VStack space="md" reversed={false} className="pb-20">
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
  );
}


// import { Box } from "@/components/ui/box";
// import { Center } from "@/components/ui/center";
// import { HStack } from "@/components/ui/hstack";
// import { Icon } from "@/components/ui/icon";
// import { Image } from "@/components/ui/image";
// import { ChevronLeft, ChevronRight } from "lucide-react-native";
// import React, { useRef, useState } from "react";
// import { Pressable, ScrollView } from "react-native";


// const data = [
//   {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
//     {
//     src: require("../../../assets/images/partial-react-logo.png"),
//   },
// ];

// const NewThisWeekFold = () => {
//   const scrollViewRef = useRef(null);
//   const scrollAmount = 400;
//   const [scrollPosition, setScrollPosition] = useState(0);
//   const [isContentAtRight, setIsContentAtRight] = useState(true);

//   const handleScrollLeft = () => {
//     const newScrollPosition = scrollPosition - scrollAmount;
//     if (scrollViewRef.current) {
//       // @ts-ignore
//       scrollViewRef?.current?.scrollTo({
//         x: newScrollPosition,
//         animated: true,
//       });
//       setScrollPosition(newScrollPosition);
//     }
//   };

//   const handleScrollRight = () => {
//     const newScrollPosition = scrollPosition + scrollAmount;
//     if (scrollViewRef.current)
//       // @ts-ignore
//       scrollViewRef?.current?.scrollTo({
//         x: newScrollPosition,
//         animated: true,
//       });
//     setScrollPosition(newScrollPosition);
//   };

//   const checkContentAtLeft = () => {
//     if (scrollPosition > 0) {
//       return true;
//     }
//     return false;
//   };

//   const isCloseToRight = (event: any) => {
//     const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
//     const isScrollAtEnd =
//       contentOffset.x + layoutMeasurement.width >= contentSize.width;
//     if (isScrollAtEnd) {
//       return true;
//     }
//     return false;
//   };

//   return (
//     <Box className="w-full">
//       <ScrollView
//         horizontal
//         style={{ width: "100%" }}
//         showsHorizontalScrollIndicator={false}
//         ref={scrollViewRef}
//         scrollEventThrottle={50}
//         onScroll={(event) => {
//           if (isCloseToRight(event)) {
//             setIsContentAtRight(false);
//           } else {
//             setIsContentAtRight(true);
//           }
//           setScrollPosition(event.nativeEvent.contentOffset.x);
//         }}
//       >
//         <HStack space="md" className="w-full px-4 md:px-0">
//           {data.map((image, index) => {
//             return (
//               <Box key={index} className="flex-1">
//                 <Image
//                   source={image.src}
//                   alt={"place" + index}
//                   // @ts-ignore
//                   className="w-64 h-64 rounded-md"
//                   resizeMode="cover"
//                 />
//               </Box>
//             );
//           })}
//         </HStack>
//       </ScrollView>
//       <ScrollLeft
//         handleScrollLeft={handleScrollLeft}
//         disabled={!checkContentAtLeft()}
//       />
//       <ScrollRight
//         handleScrollRight={handleScrollRight}
//         disabled={!isContentAtRight}
//       />
//     </Box>
//   );
// };

// const ScrollLeft = ({ handleScrollLeft, disabled }: any) => {
//   return (
//     <Center className="absolute left-0 h-full hidden md:flex">
//       <Pressable
//         className={`p-1 ml-3 rounded-full border-outline-300 border bg-background-50 md:-ml-[16px] hover:bg-background-100 ${
//           disabled
//             ? "data-[disabled=true]:opacity-0"
//             : "data-[disabled=true]:opacity-100"
//         }`}
//         disabled={disabled}
//         onPress={handleScrollLeft}
//       >
//         <Icon
//           as={ChevronLeft}
//           size="lg"
//           color={"#535252"}
//         />
//       </Pressable>
//     </Center>
//   );
// };

// const ScrollRight = ({ handleScrollRight, disabled }: any) => {
//   return (
//     <Center className="absolute right-0 h-full hidden md:flex">
//       <Pressable
//         className={`p-1 ml-3 rounded-full border-outline-300 border bg-background-50 md:-mr-4 hover:bg-background-100 ${
//           disabled
//             ? "data-[disabled=true]:opacity-0"
//             : "data-[disabled=true]:opacity-100"
//         }`}
//         onPress={handleScrollRight}
//         disabled={disabled}
//       >
//         <Icon
//           as={ChevronRight}
//           size="lg"
//           color={"#535252"}
//         />
//       </Pressable>
//     </Center>
//   );
// };

// export default NewThisWeekFold;

