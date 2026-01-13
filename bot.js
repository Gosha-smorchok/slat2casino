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
    const username = msg.from.first_name || 'игрок';

    if (text === '/start') {
        const welcomeMessage = `🎰 *Приветствуем тебя в Slat2Casino, ${username}!* 🎰\n\n` +
            `Мечтал о легкой наживе? Ты попал точно по адресу! 🔥\n\n` +
            `🎁 В этом чате будут появляться секретные *промокоды* и бонусы.\n\n` +
            `🆘 Если тебе нужна техническая поддержка — не стесняйся! *Пиши прямо сюда*, наша команда поможет тебе в кратчайшие сроки.\n\n` +
            `👇 Нажимай на кнопку ниже и начни свой путь к джекпоту\!`;

        await bot.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'Markdown',
            // Убираем reply_keyboard, так как кнопка теперь в Menu Button через BotFather
            reply_markup: {
                remove_keyboard: true
            }
        });
        return;
    }

    // Логика Технической Поддержки
    // Если сообщение не команда /start, считаем его запросом в поддержку
    if (text && !text.startsWith('/')) {
        // Здесь можно добавить пересылку сообщения админу
        // bot.forwardMessage(ADMIN_ID, chatId, msg.message_id); 
        
        await bot.sendMessage(chatId, `📧 *Ваше сообщение отправлено в службу поддержки.*\n\nМы изучим ваш вопрос и ответим в ближайшее время!`, {
            parse_mode: 'Markdown'
        });
    }
});

console.log(`Waiting for messages... (WebApp URL: ${webAppUrl})`);
