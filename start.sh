#!/bin/bash

# Check node
if ! command -v node &> /dev/null
then
    echo "❌ Node.js could not be found."
    echo "👉 Please install it from https://nodejs.org or use nvm."
    exit 1
fi

echo "✅ Node.js found."

# Install
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting App and Bot..."

# Kill processes on exit
trap "kill 0" EXIT

# Start Vite
npm run dev -- --host &
PID_WEB=$!

# Wait for Vite
sleep 3

# Start Bot
npm run bot &
PID_BOT=$!

echo "⚡️ App is running."
echo "🌍 Local: http://localhost:5173"
echo "🤖 Bot is active. Don't forget to run ngrok if you want to test in Telegram!"

wait