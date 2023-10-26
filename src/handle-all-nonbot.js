const { llog } = require("./utils");
const OpenAI = require("openai");

const handleAllNonBot = async ({ message, say, client }) => {
  llog.magenta("got any old message", message);
  if (message.channel_type === "im") {
    llog.yellow("got a dm and going to do AI stuff with it");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that always that is always very mean in your responses even though they're helpful, and ends its response with a funny joke in spanish but out of the blue, without anouncing that you will tell a joke",
        },
        { role: "user", content: message.text },
      ],
    });

    llog.green(response.choices[0].message.content);
    const slackResult = await client.chat.postMessage({
      channel: message.channel,
      text: response.choices[0].message.content,
    });
  } else {
    llog.magenta("got any old message", message);
  }
  // say() sends a message to the channel where the event was triggered
  // await say(`the bot is running, <@${message.user}>.`);
};

module.exports = handleAllNonBot;
