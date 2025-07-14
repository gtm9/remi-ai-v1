import { AudioFileItem } from '@/types/audio';
import { create } from 'zustand';

export interface ReminderItem {
  id: string;
  title: string;
  description: string;
  date: string;
  remindWithCall: boolean;
  selectedAudioFileId: string | null;
  generatedAudio?: AudioFileItem
  phoneNumber?: string
}
interface ReminderState {
  reminders: ReminderItem[];
  getReminders: () => ReminderItem[];
  getReminderById: (id: string) => ReminderItem | undefined;
  addReminder: (newReminder: Omit<ReminderItem, 'id'>) => ReminderItem;
  updateReminder: (id: string, updatedFields: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [
    { id: '1', 
      title: 'Buy groceries', 
      description: 'Milk, Eggs, Bread, Cheese', 
      date: 'December 17, 1995 03:24:00', 
      remindWithCall: false, 
      selectedAudioFileId: '' 
    },
    { id: '2', 
      title: 'Call mom', 
      description: 'Wish her a happy birthday', 
      date: 'December 17, 1995 03:24:00', 
      remindWithCall: false, 
      selectedAudioFileId: '' 
    },
    {
      id: '3',
      title: 'Finish project report',
      description: 'Due end of week, need to review sections 1-3 and write conclusion for section 4. Also, check data analysis graphs.',
      date: 'December 17, 1995 03:24:00',
      remindWithCall: false,
      selectedAudioFileId: ''
    },
  ],
  getReminders: () => {
    return [...get().reminders]; // Return a copy to prevent direct modification
  },
  getReminderById: (id: string) => {
    return get().reminders.find((r) => r.id === id);
  },
  addReminder: (newReminder: Omit<ReminderItem, 'id'>) => {
    console.log('addReminder', newReminder);
    const reminderToAdd: ReminderItem = {
      id: Date.now().toString(), // Simple unique ID
      ...newReminder,
    };
    set((state) => ({
      reminders: [...state.reminders, reminderToAdd],
    }));
    return reminderToAdd;
  },
  updateReminder: (id: string, updatedFields: Partial<ReminderItem>) => {
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...updatedFields } : r
      ),
    }));
  },
  deleteReminder: (id: string) => {
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    }));
  },
}));
