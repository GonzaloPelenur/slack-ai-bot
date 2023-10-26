const { llog } = require("../../utils");
const { aiBotResponseV1 } = require("./bot-responses/respond-to-im");
const { aiDialogueResponseV1 } = require("./bot-responses/engage-in-dialogue");

module.exports.handleAllNonBot = async ({ client, message, say }) => {
    llog.gray("handleAll messages", llog.divider)
    if (BOT_CONFIG.channels.includes(message.channel)) {
        llog.blue(`handling message because ${message.channel} is one of \n${JSON.stringify(BOT_CONFIG.channels, null, 4)}`)
        llog.yellow(message)
    } else if ( message.channel_type == "im" ) {
        llog.magenta(`handling message because ${message.channel} is a DM`)
        llog.yellow(message)
        let result = await client.conversations.history({channel: message.channel, limit: 10})
        llog.magenta(result)
        let openAiResult = await aiBotResponseV1({ text: message.text, messages: result.messages });
        llog.magenta(openAiResult)
        let slackResult = await say(openAiResult.choices[0].message.content);
    } else if (message.channel==process.env.SLACK_AI_CONVERSATION_CHANNEL) {
        let result = await aiDialogueResponseV1({ client, message, say })
    } else {
        llog.magenta(`some other message we aren't handling now--uncomment message-handler line 27 to get the json`)
        llog.blue(`message wasn't in array ${JSON.stringify(BOT_CONFIG.channels, null, 4)}`)
        llog.yellow(message)
    }
}

module.exports.handleTesting = async ({ message, say }) => {
    llog.cyan("got testing testing", message)
    // say() sends a message to the channel where the event was triggered
    await say(`the bot is running, <@${message.user}>.`);
}

module.exports.handleBot = async ({ event, message, context }) => {
    llog.cyan("got a bot message", message)
    llog.white("and here's the event", event)
}