import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  balance: number;
  lastDailyBonus: number | null; // Timestamp
  
  initUser: () => void;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => boolean;
  claimDailyBonus: () => { success: boolean, message: string };
  resetBalance: () => void; // For testing/rescue
}

const INITIAL_BALANCE = 1000;
const DAILY_BONUS_AMOUNT = 100;
const DAILY_COOLDOWN = 60 * 60 * 1000; // 1 hour for testing, typically 24h

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      balance: INITIAL_BALANCE,
      lastDailyBonus: null,

      initUser: () => {
        // Here we could sync with backend if UserID changes
        if (get().balance === undefined) {
             set({ balance: INITIAL_BALANCE });
        }
      },

      addCoins: (amount) => set((state) => ({ balance: state.balance + amount })),

      removeCoins: (amount) => {
        const currentBalance = get().balance;
        if (currentBalance >= amount) {
          set({ balance: currentBalance - amount });
          return true;
        }
        return false;
      },

      claimDailyBonus: () => {
        const now = Date.now();
        const last = get().lastDailyBonus;

        if (!last || now - last > DAILY_COOLDOWN) {
          set((state) => ({ 
            balance: state.balance + DAILY_BONUS_AMOUNT,
            lastDailyBonus: now
          }));
          return { success: true, message: `claimed ${DAILY_BONUS_AMOUNT} coins` };
        }
        
        const remaining = Math.ceil((DAILY_COOLDOWN - (now - (last || 0))) / 1000 / 60);
        return { success: false, message: `Wait ${remaining} mins` };
      },

      resetBalance: () => set({ balance: 100 }), // Rescue button logic essentially
    }),
    {
      name: 'kazik-storage',
    }
  )
);
