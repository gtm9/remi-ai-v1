
// Simple custom event emitter for React Native (as 'events' might require polyfills)
class CustomEventEmitter {
  private listeners: { [eventName: string]: Function[] } = {};

  on(eventName: string, listener: Function) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  off(eventName: string, listener: Function) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);
  }

  emit(eventName: string, ...args: any[]) {
    if (!this.listeners[eventName]) return;
    // Create a copy to prevent issues if listeners modify the array during iteration
    [...this.listeners[eventName]].forEach(listener => listener(...args));
  }
}

export const reminderEventEmitter = new CustomEventEmitter(); // Our central event emitter

export interface ReminderItem {
  id: string;
  title: string;
  description: string;
}

// Our private reminders array
let reminders: ReminderItem[] = [
  { id: '1', title: 'Buy groceries', description: 'Milk, Eggs, Bread, Cheese' },
  { id: '2', title: 'Call mom', description: 'Wish her a happy birthday' },
  { id: '3', title: 'Finish project report', description: 'Due end of week, need to review sections 1-3 and write conclusion for section 4. Also, check data analysis graphs.' },
];

// --- Public functions to interact with the store ---

export const getReminders = (): ReminderItem[] => {
  return [...reminders]; // Return a copy to prevent direct modification
};

export const getReminderById = (id: string): ReminderItem | undefined => {
  return reminders.find(r => r.id === id);
};

export const addReminder = (newReminder: Omit<ReminderItem, 'id'>): ReminderItem => {
  const reminderToAdd: ReminderItem = {
    id: Date.now().toString(), // Simple unique ID
    ...newReminder,
  };
  reminders.push(reminderToAdd);
  reminderEventEmitter.emit('remindersChanged'); // Notify listeners
  return reminderToAdd;
};

export const updateReminder = (id: string, updatedFields: Partial<ReminderItem>): void => {
  reminders = reminders.map(r =>
    r.id === id ? { ...r, ...updatedFields } : r
  );
  reminderEventEmitter.emit('remindersChanged'); // Notify listeners
};

export const deleteReminder = (id: string): void => {
  reminders = reminders.filter(r => r.id !== id);
  reminderEventEmitter.emit('remindersChanged'); // Notify listeners
};
