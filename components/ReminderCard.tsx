import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon"; // Import Icon
import { Pressable } from "@/components/ui/pressable"; // Import Pressable
import { Text } from "@/components/ui/text";
import { PhoneCall, X } from "lucide-react-native"; // Import the X icon
import { View } from "react-native";

// Update the Reminder interface to include an id
export interface Reminder {
  id: string;
  task: string; // Not directly used in props, but good for structure
  completed: boolean; // Not directly used in props, but good for structure
  
}

interface ReminderCardProps {
  id: string; // Define id type
  title: string;
  description: string;
  audioFileName?: string | null;
  remindWithCall: boolean;
  onDelete: (id: string) => void; // Define onDelete as a function that takes an id
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  id, // Add id to props
  title,
  description,
  audioFileName,
  remindWithCall,
  onDelete, // Add onDelete to props
}) => {
  return (
      <Card size="md" variant="elevated" className="m-3 relative">
        <View className="flex-row items-center mb-1">
          <Heading size="md">
            {title}
          </Heading>
          {remindWithCall && ( // Conditionally render the icon if provided
            <Icon
              as={PhoneCall}
              size='sm'
              className={`ml-2`} // Icon is now last, so margin-left works
            />
          )}
        </View>
        <Text size="sm">{description}</Text>
        {audioFileName && <Text size="sm">{audioFileName}</Text>}

        {/* Delete Button */}
        <Pressable
          onPress={() => onDelete(id)} // Call onDelete with the card's id
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-200" // Tailwind classes for positioning and styling
        >
          <Icon as={X} size="sm" className="text-gray-600" />
        </Pressable>
      </Card>
    );
}

