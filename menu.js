require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

// Bot tokens for two bots (from .env file or directly)
const BOT1_TOKEN = process.env.BOT1_TOKEN; // Token for Bot 1
const BOT2_TOKEN = process.env.BOT2_TOKEN; // Token for Bot 2

// Initialize both bots
const bot1 = new TelegramBot(BOT1_TOKEN, { polling: true });
const bot2 = new TelegramBot(BOT2_TOKEN, { polling: true });

// List of intervals in milliseconds
const INTERVALS = {
    "5_minutes": 1 * 30 * 1000,
    "10_minutes": 2 * 30 * 1000,
    "1_hour": 60 * 60 * 1000,
    "3_hours": 3 * 60 * 60 * 1000,
};

// Object to store scheduled tasks for both bots
const scheduledTasks = {
    bot1: null,
    bot2: null,
};

// Function to schedule messages for a bot
function scheduleMessage(bot, chatId, intervalKey) {
    const interval = INTERVALS[intervalKey];
    if (!interval) return;

    // Clear any existing schedule for this bot
    if (scheduledTasks[bot]) {
        clearInterval(scheduledTasks[bot]);
    }

    // Schedule the new task
    scheduledTasks[bot] = setInterval(() => {
        bot.sendMessage(chatId, "Hi!");
    }, interval);
}

// Command to start scheduling for Bot 1
bot1.onText(/\/start_schedule/, (msg) => {
    const chatId = msg.chat.id;
    bot1.sendMessage(chatId, "Bot 1: Choose an interval for messages:", {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Every 5 Minutes", callback_data: "bot1_5_minutes" },
                    { text: "Every 10 Minutes", callback_data: "bot1_10_minutes" },
                ],
                [
                    { text: "Every 1 Hour", callback_data: "bot1_1_hour" },
                    { text: "Every 3 Hours", callback_data: "bot1_3_hours" },
                ],
            ],
        },
    });
});

// Command to start scheduling for Bot 2
bot2.onText(/\/start_schedule/, (msg) => {
    const chatId = msg.chat.id;
    bot2.sendMessage(chatId, "Bot 2: Choose an interval for messages:", {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Every 5 Minutes", callback_data: "bot2_5_minutes" },
                    { text: "Every 10 Minutes", callback_data: "bot2_10_minutes" },
                ],
                [
                    { text: "Every 1 Hour", callback_data: "bot2_1_hour" },
                    { text: "Every 3 Hours", callback_data: "bot2_3_hours" },
                ],
            ],
        },
    });
});

// Handle interval selection for both bots
function handleCallbackQuery(bot, query, botKey) {
    const chatId = query.message.chat.id;
    const intervalKey = query.data.replace(`${botKey}_`, "");
    scheduleMessage(bot, chatId, intervalKey);

    bot.sendMessage(chatId, `Messages scheduled every ${intervalKey.replace("_", " ")}.`);
}

// Callback handling for Bot 1
bot1.on("callback_query", (query) => {
    handleCallbackQuery(bot1, query, "bot1");
});

// Callback handling for Bot 2
bot2.on("callback_query", (query) => {
    handleCallbackQuery(bot2, query, "bot2");
});

// Command to stop scheduling for Bot 1
bot1.onText(/\/stop_schedule/, (msg) => {
    const chatId = msg.chat.id;
    if (scheduledTasks.bot1) {
        clearInterval(scheduledTasks.bot1);
        scheduledTasks.bot1 = null;
        bot1.sendMessage(chatId, "Bot 1: Scheduled messages have been stopped.");
    } else {
        bot1.sendMessage(chatId, "Bot 1: No scheduled messages to stop.");
    }
});

// Command to stop scheduling for Bot 2
bot2.onText(/\/stop_schedule/, (msg) => {
    const chatId = msg.chat.id;
    if (scheduledTasks.bot2) {
        clearInterval(scheduledTasks.bot2);
        scheduledTasks.bot2 = null;
        bot2.sendMessage(chatId, "Bot 2: Scheduled messages have been stopped.");
    } else {
        bot2.sendMessage(chatId, "Bot 2: No scheduled messages to stop.");
    }
});

// Log startup
console.log("Both bots are running...");
