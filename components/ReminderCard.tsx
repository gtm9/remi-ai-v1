import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon"; // Import Icon
import { Pressable } from "@/components/ui/pressable"; // Import Pressable
import { Text } from "@/components/ui/text";
import { X } from "lucide-react-native"; // Import the X icon

// Update the Reminder interface to include an id
export interface Reminder {
  id: string;
  task: string; // Not directly used in props, but good for structure
  completed: boolean; // Not directly used in props, but good for structure
}
  
export default function ReminderCard({
  id, // Add id to props
  title,
  description,
  onDelete, // Add onDelete to props
}:{
  id: string; // Define id type
  title: string;
  description: string;
  onDelete: (id: string) => void; // Define onDelete as a function that takes an id
}) {
  return (
    <Card size="md" variant="elevated" className="m-3 relative">
      <Heading size="md" className="mb-1">
        {title}
      </Heading>
      <Text size="sm">{description}</Text>

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