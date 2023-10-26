const { llog } = require("./utils");
const OpenAI = require("openai");

const actor = async ({ message, say, client }) => {
  llog.magenta("got any old message", message);
  llog.yellow("got a dm and going to do AI stuff with it");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a ",
      },
      { role: "user", content: message.text },
    ],
  });

  // say() sends a message to the channel where the event was triggered
  // await say(`the bot is running, <@${message.user}>.`);
};

module.exports = actor;
