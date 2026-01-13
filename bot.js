import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

if (!token) {
    console.error('🔴 Error: BOT_TOKEN is missing in .env file');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🟢 Bot server is running...');

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        const fullUrl = webAppUrl; // You can append query params (e.g. ?userId=${chatId})

        // Standard keyboard with a "Play" button
        /* 
        // Note: For inline buttons under messages:
        await bot.sendMessage(chatId, 'Welcome to KAZIK! 🎰\nClick below to start playing.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Play Now 🎲", web_app: { url: fullUrl } }]
                ]
            }
        });
        */

        // Menu Button (Keyboard below input) is often preferred for Main Menu
        await bot.sendMessage(chatId, '👋 Welcome to the Social Casino Demo!\n\nPress the button below to start the app.', {
            reply_markup: {
                keyboard: [
                    [{ text: "🎰 Play KAZIK", web_app: { url: fullUrl } }]
                ],
                resize_keyboard: true
            }
        });
    }
});

console.log(`Waiting for messages... (WebApp URL: ${webAppUrl})`);
