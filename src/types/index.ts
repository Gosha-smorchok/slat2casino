export interface UserState {
  balance: number;
  lastDailyBonus: string | null;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  path: string;
  image: string; // Emoji for now
  category: 'luck' | 'skill';
  color: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}
