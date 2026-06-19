import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CURRENCIES, STORE_KEYS } from "@/constants";

interface SettingsState {
  currencyCode: string;
  setCurrency: (code: string) => void;
  getCurrencyInfo: () => (typeof CURRENCIES)[number];
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currencyCode: "INR",
      setCurrency: (code) => set({ currencyCode: code }),
      getCurrencyInfo: () => {
        const code = get().currencyCode;
        return CURRENCIES.find((c) => c.code === code) || CURRENCIES[3];
      },
    }),
    {
      name: STORE_KEYS.SETTINGS,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
