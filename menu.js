require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const { conversation } = require("./config/questionArray");

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const stringSession = process.env.SESSION_STRING;
const targetGroupId = parseInt(process.env.TARGET_GROUP_ID, 10);

if (isNaN(targetGroupId)) {
    throw new Error("TARGET_GROUP_ID is not a valid number. Check your .env file.");
}

(async () => {
    console.log("Loading Telegram client...");
    const client = new TelegramClient(new StringSession(stringSession), apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.connect();
    console.log("You are now connected!");

    const conversationMap = conversation.reduce((map, entry) => {
        map[entry.question.toLowerCase().trim()] = entry.answer;
        return map;
    }, {});

    client.addEventHandler(
        async (event) => {
            const message = event.message;
            if (!message) return;

            const chatId = message.peerId.channelId;

            if (BigInt(chatId) !== BigInt(targetGroupId)) {
                console.log(`Message received from chat ID ${chatId}, but target group ID is ${targetGroupId}`);
                return;
            }

            let text;
            try {
                text = message.message?.toLowerCase().trim();
            } catch (err) {
                console.error("Error extracting message text:", err);
                return;
            }

            if (!text) return;
            console.log(`Received message in group: ${text}`);

            const response = conversationMap[text];
            if (response) {
                try {
                    await client.sendMessage(targetGroupId, { message: response });
                    console.log(`Replied to '${text}' with '${response}'`);
                } catch (err) {
                    console.error("Error sending reply:", err);
                }
            }
        },
        new NewMessage({ chats: [targetGroupId] })
    );
})();
