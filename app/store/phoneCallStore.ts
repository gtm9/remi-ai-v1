import { create } from 'zustand';

interface PhoneCallState {
  phoneNumber: string | null;
  setPhoneNumber: (phoneNumber: string) => void;
  clearPhoneNumber: () => void;
}

export const usePhoneCallStore = create<PhoneCallState>((set) => ({
  phoneNumber: null,
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  clearPhoneNumber: () => set({ phoneNumber: null }),
}));
