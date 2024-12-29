require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const categories = {
    news: [
        "Let me know news about technical industry",
        "Let me know news about Sports industry",
        "Let me know news about political industry",
        "Let me know news about e-commerce industry",
        "Let me know news about medical industry",
        "Let me know news about accident",
        "Let me know news about new programming languages",
        "Let me know trends of Blockchain Technology",
        "Let me know history about ancient countries",
        "Let me know some knowledge for kids",
        "Let me know ideas for animals",
        "Let me know some news about famous people"
    ],
};

function getRandomMessage() {
    const categoriesArray = Object.keys(categories);
    const randomCategory = categoriesArray[Math.floor(Math.random() * categoriesArray.length)];
    const messages = categories[randomCategory];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    console.log(`randomMessage is `, randomMessage)
    return randomMessage;
}

async function textController(userMessage) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system", content: `You are a helpful assistant.
                    ` },
                { role: "user", content: `${userMessage}` },
            ],
            model: "gpt-4o",
        });
        const completionMessage = completion.choices[0].message.content;

        const result = completionMessage.replace(/\*\*(.*?)\*\*/g, "*$1*");
        return result;
    } catch (error) {
        console.error("Error generating text:", error);
    }
}

async function generateDynamicMessage() {
    const randomMessage = getRandomMessage();
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful assistant. Write your answer in Chinese Generate a short message about news, technology, education, events, or history, between 50~100 characters. ${randomMessage}`,
                },
            ],
            model: "gpt-4o",
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating dynamic message:", error);
    }
}


module.exports = { textController, generateDynamicMessage };
