import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export interface Reminder {
  id: string;
  task: string;
  completed: boolean;
}
	
export default function ReminderCard({
  title,
  description}:{
  title:string;
  description:string;}) {
  return (
    <Card size="md" variant="elevated"  className="m-3">
      <Heading size="md" className="mb-1">
        {title}
      </Heading>
      <Text size="sm">{description}</Text>
    </Card>
  );
}