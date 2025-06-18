import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { MoonIcon, SunIcon } from "lucide-react-native";
import React, { useContext } from "react";
import { ThemeContext } from "../_layout";


const ToggleMode = () => {
  const { colorMode, toggleColorMode } = useContext(ThemeContext);
  return (
    <Pressable onPress={toggleColorMode}>
      <Icon
        as={colorMode === "dark" ? SunIcon : MoonIcon}
        size="xl"
        className="stroke-background-700 fill-background-700"
      />
    </Pressable>
  );
};

export default ToggleMode;