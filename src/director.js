const { llog } = require("./utils");
const OpenAI = require("openai");

const createCharacters = async ({ prompt, client, channel }) => {
  // given the play prompt create an array of characters
  // use function
  //   console.log("createCharacters", prompt);
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
  });
  const messages = [{ role: "user", content: prompt }];
  const functions = [
    {
      name: "create_play_characters",
      description:
        "Use a prompt to create characters with names, roles, and descrptions that include their personality traits and physical appearance.",
      parameters: {
        type: "object",
        properties: {
          characters: {
            type: "array",
            description:
              "An array of a character object that contains character names, roles, traits, and physical appearance.",
            items: {
              type: "object",
              description:
                "name: The name of the character. role: The role of the character. traits: The personality traits of the character. appearance: The physical appearance of the character.",
              properties: {
                name: {
                  type: "string",
                  description: "The name of the character.",
                },
                role: {
                  type: "string",
                  description: "The role of the character.",
                },
                traits: {
                  type: "string",
                  description: "The personality traits of the character.",
                },
                appearance: {
                  type: "string",
                  description: "The physical appearance of the character.",
                },
              },
            },
          },
        },
        // required: ["characters"],
      },
    },
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: messages,
    functions: functions,
    function_call: { name: "create_play_characters" }, // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;
  console.log("responseMessage", responseMessage);
  const characters = JSON.parse(responseMessage.function_call.arguments);
  console.log(characters);
  var output = `A play for the prompt "${prompt}" will be created with the following characters:\n\n`;
  for (const character of characters.characters) {
    output += `--- A ${character.role} named ${character.name}, that's ${character.traits}, and looks like ${character.appearance}\n\n`;
  }
  const slackResult = await client.chat.postMessage({
    channel: channel,
    text: output,
  });
};

const createScene = () => {
  // given the play prompt create a scene
  // use normal gpt
};

const chooseTurn = () => {
  // given the previous messages and existing characters, choose whose turn it is to talk
  // use function
};

const createMessage = () => {
  // given the play prompt, the previous messages, existing characters, and whose turn it is, create a message
};

const director = async ({ message, say, client }) => {
  characters = createCharacters({
    prompt: message.text,
    client: client,
    channel: message.channel_id,
  });

  // say() sends a message to the channel where the event was triggered
  // await say(`the bot is running, <@${message.user}>.`);
};

module.exports = director;
