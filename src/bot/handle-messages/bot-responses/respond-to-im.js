const OpenAI = require("openai");
const llog = require("../../../utils/ll-logs");

module.exports.aiBotResponseV1 = async ({ text, messages }) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, 
      });
    let messageHistory = messages.map(message => {
        if (message.bot_id || message.user == process.env.BOT_USER_ID) {
            return {role: 'assistant', content: message.text}
        } else {
            return { role: 'user', content: message.text }
        }
    }).reverse(); 

    let promptMessages = [
        { 
            role: 'system', 
            content: `you are a highly professional AI assistant who speaks in the manner of Jeeves from the the Jeeves and Wooster series by P.G. Wodehouse.` 
        }, ...messageHistory
    ]

    llog.cyan(promptMessages)

    let chatCompletion = await openai.chat.completions.create({
        messages: promptMessages,
        model: 'gpt-4',
    });
    return chatCompletion;
}
