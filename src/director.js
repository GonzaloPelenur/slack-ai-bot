const { llog } = require("./utils");
const OpenAI = require("openai");

require("dotenv").config();
var conversation_history = [];
var characters = [];
var prompt = "";
var talk = true;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

const createCharacters = async ({ prompt, client, channel }) => {
  // given the play prompt create an array of characters
  // use function
  //   console.log("createCharacters", prompt);
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
                  description:
                    "The name of the character, has to be unique and different from the role.",
                },
                role: {
                  type: "string",
                  description:
                    "The role of the character, has to be different from the name.",
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
    model: process.env.GPT_MODEL,
    messages: messages,
    functions: functions,
    function_call: { name: "create_play_characters" }, // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;
  // console.log("responseMessage", responseMessage);
  characters = JSON.parse(responseMessage.function_call.arguments).characters;
  // console.log(characters);
  var output = `A play for the prompt "${prompt}" will be created with the following characters:\n\n`;
  for (const character of characters) {
    output += `--- A ${character.role} named ${character.name}, that's ${character.traits}, and looks like ${character.appearance}\n\n`;
  }
  const slackResult = await client.chat.postMessage({
    channel: channel,
    text: output,
  });
};

const createScene = async () => {
  // given the play prompt create a scene
  // use normal gpt
  const gpt_prompt = `Create the starting scene for a play for the prompt "${prompt}" with the following characters "${JSON.stringify(
    characters
  )}"`;
  console.log("createScene", gpt_prompt);
  const response = await openai.chat.completions.create({
    model: process.env.GPT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are theatric play director. You are creating a scene for a play.",
      },
      { role: "user", content: gpt_prompt },
    ],
  });
  console.log("first scene", response.choices[0].message.content);
};

const chooseTurn = async ({ previous_character }) => {
  // given the previous messages and existing characters, choose whose turn it is to talk
  // use function
  const GPT_prompt = `The prompt of the play is "${prompt}", the characters are "${JSON.stringify(
    characters
  )}, and the previous messages are "${JSON.stringify(
    conversation_history
  )}". The last character that spoke was "${previous_character}". Make sure to choose a different character to speak.`;
  // llog.red("GPT_prompt", GPT_prompt);
  const messages = [{ role: "user", content: GPT_prompt }];
  const functions = [
    {
      name: "choose_character_turn",
      description:
        "Given a play prompt, the previous messages, and existing characters, choose whose turn it is to talk.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "the name of the character whose turn it is to talk",
          },
        },
        // required: ["characters"],
      },
    },
  ];
  const response = await openai.chat.completions.create({
    model: process.env.GPT_MODEL,
    messages: messages,
    functions: functions,
    function_call: { name: "choose_character_turn" }, // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;

  // llog.red("responseMessage", responseMessage);
  character_chosen = JSON.parse(responseMessage.function_call.arguments).name;
  return character_chosen;
};

const createMessageAsDirector = async ({ character_chosen }) => {
  // given the play prompt, the previous messages, existing characters, and whose turn it is, create a message
  const gpt_prompt = `Create a line for the character ${character_chosen} to say. For context, the play is about "${prompt}", and has characters "${JSON.stringify(
    characters
  )}", and the previous messages are "${JSON.stringify(conversation_history)}"`;
  console.log("createMessage", gpt_prompt);
  const response = await openai.chat.completions.create({
    model: process.env.GPT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are theatric play director. You are creating the next line that a character has to say.",
      },
      { role: "user", content: gpt_prompt },
    ],
  });
  console.log("line:", response.choices[0].message.content);
};

const createMessageAsCharacter = async ({ character_chosen }) => {
  // given the play prompt, the previous messages, existing characters, and whose turn it is, create a message
  for (const character of characters) {
    if (character.name == character_chosen) {
      traits = character.traits;
      appearance = character.appearance;
      role = character.role;
    }
  }
  const role_play = `You are a character in a theatric play. You are creating the next line that you have to say. Your name is "${character_chosen}". You're role is "${role}". You're traits are "${traits}", and you look like "${appearance}". The play is about "${prompt}". The previous messages are "${JSON.stringify(
    conversation_history
  )}". The characters in the play are "${JSON.stringify(characters)}".`;
  // llog.green("role_play", role_play);
  const gpt_prompt = `Create a line for you, as character "${character_chosen}" to say.`;
  // console.log("createMessageAsCharacter", gpt_prompt);
  const response = await openai.chat.completions.create({
    model: process.env.GPT_MODEL,
    messages: [
      {
        role: "system",
        content: role_play,
      },
      { role: "user", content: gpt_prompt },
    ],
  });
  const line = response.choices[0].message.content;
  return line;
};

const director = async ({ message, say, client }) => {
  prompt = message.text;
  llog.magenta("Director here, will create characters");
  await createCharacters({
    prompt: message.text,
    client: client,
    channel: message.channel_id,
  });
  llog.yellow("The characters created are:", characters);
  // llog.magenta("Director here, will create a scene");
  // await createScene();
  // llog.magenta("Director here, will choose next turn");
  character_chosen = "no one, this is the first line";
  // character_chosen = await chooseTurn({
  //   previous_character: character_chosen,
  // });
  // llog.yellow(`    The character chosen is: ${character_chosen}`);
  // llog.magenta(`Director here, will create a line for ${character_chosen}`);
  // line = await createMessageAsCharacter({
  //   character_chosen: character_chosen,
  // });
  // llog.yellow(`    The line created is: ${line}`);
  // conversation_history.push(line);
  // await client.chat.postMessage({
  //   channel: message.channel_id,
  //   text: line,
  // });

  // llog.magenta("Director here, will choose next turn");
  // character_chosen = await chooseTurn({ previous_character: character_chosen });
  // llog.yellow(`    The character chosen is: ${character_chosen}`);
  // llog.magenta(`Director here, will create a line for ${character_chosen}`);
  // line = await createMessageAsCharacter({
  //   character_chosen: character_chosen,
  // });
  // llog.yellow(`The line created is: ${line}`);
  // conversation_history.push(line);
  // await client.chat.postMessage({
  //   channel: message.channel_id,
  //   text: line,
  // });

  while (talk) {
    llog.magenta("Director here, will choose next turn");
    character_chosen = await chooseTurn({
      previous_character: character_chosen,
    });
    llog.yellow(`    The character chosen is: ${character_chosen}`);
    llog.magenta(`Director here, will create a line for ${character_chosen}`);
    line = await createMessageAsCharacter({
      character_chosen: character_chosen,
    });
    llog.yellow(`    The line created is: ${line}`);
    conversation_history.push(line);
    await client.chat.postMessage({
      channel: message.channel_id,
      text: line,
    });
  }
  // say() sends a message to the channel where the event was triggered
  // await say(`the bot is running, <@${message.user}>.`);
};

module.exports = director;
