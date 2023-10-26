const OpenAI = require("openai");
const llog = require("../../../utils/ll-logs");

module.exports.aiDialogueResponseV1 = async ({ client, message, say }) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    llog.cyan(llog.divider, `SLACK_AI_CONVERSATION_CHANNEL message`, message)
    let theMessages = await client.conversations.history({channel: message.channel, limit: 20})
    llog.magenta(theMessages)
    let messageHistory = theMessages.map(message => {
        if (message.user == process.env.SLACK_BOT_USER_ID) {
            return {role: 'assistant', content: message.text}
        } else {
            return { role: 'user', content: `${message.user} said ${message.text}` }
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
        model: 'gpt-3.5-turbo-16k',
        max_tokens: 100
    });
    return chatCompletion;
    // let slackResult = await say(openAiResult.choices[0].message.content);
}
