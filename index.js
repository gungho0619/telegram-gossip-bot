require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const { textController, generateDynamicMessage } = require("./controller/textController");
const { conversation } = require("./config/questionArray");


const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const botUsername = process.env.BOT_USERNAME;
const targetChatId = process.env.TARGET_CHAT_ID;


function isBotMentioned(msg) {
    if (!msg.entities || !msg.text) return false;

    return msg.entities.some(
        (entity) =>
            entity.type === "mention" &&
            msg.text.substring(entity.offset, entity.offset + entity.length) === `@${botUsername}`
    );
}

function sanitizeMarkdown(text) {
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

async function postPeriodicMessages() {
    try {
        const dynamicMessage = await generateDynamicMessage();
        if (dynamicMessage) {
            await bot.sendMessage(targetChatId, dynamicMessage);
        }
    } catch (error) {
        console.error("Error sending periodic message:", error);
    }
}

setInterval(postPeriodicMessages, 10 * 60 * 1000);



bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    console.log(`Chat ID: ${chatId}`);
    const username = msg.from.username || msg.from.first_name || "User";


    if (!msg.text) {
        bot.sendMessage(chatId, `Hi @${sanitizeMarkdown(username)}, I can only process text messages.`, {
            reply_to_message_id: msg.message_id,
        });
        return;
    }

    const inputText = msg.text.replace(`@${botUsername}`, "").trim();


    try {
        if (isBotMentioned(msg)) {
            const generatedText = await textController(inputText);
            const responseText = `${generatedText || "Sorry, I couldn't generate a response."
                }`;
            const messageOptions = {
                parse_mode: "Markdown",
            };
            await bot.sendMessage(chatId, responseText, messageOptions);
        }
        else {
            const match = conversation.find((item) => item.question === inputText);
            if (match) {
                // Send the corresponding answer
                bot.sendMessage(chatId, match.answer);
            }
        }

    } catch (error) {
        // Handle errors gracefully with sanitized username
        bot.sendMessage(
            chatId,
            `Sorry @${sanitizeMarkdown(username)}, there was an error generating the response. Please try again later.`,
            {
                reply_to_message_id: msg.message_id,
            }
        );
        console.error("Error while processing message:", error);
    }
});
