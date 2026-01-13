# Social Casino TMA (Telegram Mini App)

## 🎰 Overview
A social casino application built for Telegram, focusing on virtual currency entertainment. No real money involved.

## 🛠 Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand (Persisted to LocalStorage)
- **Router**: React Router DOM

## 📂 Project Structure
```
src/
├── components/     # Shared UI components (Layout, Cards)
├── pages/          # Game screens (Home, Roulette, KeepieUppie)
├── store/          # Zustand store (userStore.ts - Economy)
├── types/          # TS Interfaces
└── App.tsx         # Routing & Telegram Initialization
```

## 🎮 Games & Economics

### 1. Roulette (Luck)
- **Rules**: Standard European Roulette simplified.
- **Math**:
    - Random number 0-36.
    - Betting: Red/Black (x2), Specific Number (x36), Green (x14/Custom).
    - House Edge: The "0" ensures strict math probability favors house slightly.

### 2. Keepie Uppie (Skill/Crash)
- **Concept**: A "Crash" game disguised as a skill game.
- **Rules**:
    - **Entry Fee**: 50 Coins.
    - **Mechanic**: Loop driven gravity. User taps ball to jump.
    - **Multiplier**: Each tap increases potential win multiplier.
    - **Risk**: Touching the floor loses the wager + accumulated win.
    - **Strategy**: Cash out early for small gains, or risk it for big multipliers.

### 3. Proposed Future Games (Design Only)
- **Mines**: 5x5 Grid. User sets mine count (1-24). Multiplier increases with every safe click.
- **Plinko**: Physics simulation. Ball drops through pegs into bins (0.2x to 1000x).
- **Aviator**: Pure math "Crash". Curve climbs exponentially, can crash at any `Math.random()`.

## 💎 Economy Logic
- **Balance**: Single source of truth in `userStore`.
- **Daily Bonus**: +100 Coins every 1 hour (for testing).
- **Persistence**: `zustand/persist` saves to `localStorage`. In production, this would sync with a Node.js/PostgreSQL backend via API.

## 🚀 How to Run
1. `npm install`
2. `npm run dev`
3. Open in browser (responsive mobile view recommended).

## 🤖 Running the Bot
To launch the Mini App inside Telegram:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - The `.env` file is already created with your token.
   - Update `WEBAPP_URL` in `.env` to your public HTTPS URL (e.g., from ngrok).

3. **Start the Frontend**:
   ```bash
   npm run dev
   ```

4. **Start the Bot in a new terminal**:
   ```bash
   npm run bot
   ```

5. **Expose Localhost (Tunneling)**:
   Since Telegram requires HTTPS, use ngrok or localtunnel:
   ```bash
   ngrok http 5173
   ```
   Copy the https URL (e.g., `https://xxxx.ngrok-free.app`) into your `.env` file as `WEBAPP_URL`. Restart the bot.

6. **Play**: Open your bot in Telegram and type `/start`.
