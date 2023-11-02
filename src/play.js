const { llog } = require("./utils");
const OpenAI = require("openai");
const functions_data = require("./functions.json");

require("dotenv").config();

class Play {
  constructor({ client, message }) {
    this.client = client;
    this.message = message;
    this.channel_id = message.channel_id;
    this.prompt = message.text;
    this.conversation_history = [];
    this.characters = [];
    this.character_chosen = "";
    this.talk = true;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
    });
    this.next_line = "";
  }
  async createCharacters() {
    const messages = [{ role: "user", content: prompt }];
    const functions = [functions_data.create_play_characters];
    const response = await this.openai.chat.completions.create({
      model: process.env.GPT_MODEL,
      messages: messages,
      functions: functions,
      function_call: { name: "create_play_characters" }, // auto is default, but we'll be explicit
    });
    const responseMessage = response.choices[0].message;
    // console.log("responseMessage", responseMessage);
    this.characters = JSON.parse(
      responseMessage.function_call.arguments
    ).characters;
    // console.log(characters);
    var output = `A play for the prompt "${prompt}" will be created with the following characters:\n\n`;
    for (const character of this.characters) {
      output += `--- A ${character.role} named ${character.name}, that's ${character.traits}, and looks like ${character.appearance}\n\n`;
    }
    await this.client.chat.postMessage({
      channel: this.channel_id,
      text: output,
    });
  }
  async chooseTurn() {
    const GPT_prompt = `The prompt of the play is "${prompt}", the characters are "${JSON.stringify(
      this.characters
    )}, and the previous messages are "${JSON.stringify(
      this.conversation_history
    )}". The last character that spoke was "${
      this.character_chosen
    }". Make sure to choose a different character to speak.`;
    // llog.red("GPT_prompt", GPT_prompt);
    const messages = [{ role: "user", content: GPT_prompt }];
    const functions = [functions_data.choose_character_turn];
    const response = await this.openai.chat.completions.create({
      model: process.env.GPT_MODEL,
      messages: messages,
      functions: functions,
      function_call: { name: "choose_character_turn" }, // auto is default, but we'll be explicit
    });
    const responseMessage = response.choices[0].message;

    // llog.red("responseMessage", responseMessage);
    this.character_chosen = JSON.parse(
      responseMessage.function_call.arguments
    ).name;
    return character_chosen;
  }
  async createMessageAsCharacter() {
    for (const character of this.characters) {
      if (character.name == this.character_chosen) {
        traits = character.traits;
        appearance = character.appearance;
        role = character.role;
      }
    }
    const role_play = `You are a character in a theatric play. You are creating the next line that you have to say. Your name is "${
      this.character_chosen
    }". You're role is "${role}". You're traits are "${traits}", and you look like "${appearance}". The play is about "${prompt}". The previous messages are "${JSON.stringify(
      this.conversation_history
    )}". The characters in the play are "${JSON.stringify(this.characters)}".`;
    // llog.green("role_play", role_play);
    const gpt_prompt = `Create a line for you, as character "${this.character_chosen}" to say.`;
    // console.log("createMessageAsCharacter", gpt_prompt);
    const response = await this.openai.chat.completions.create({
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
    this.next_line = line;
    return line;
  }
  async director() {
    llog.magenta("Director here, will create characters");
    await createCharacters();
    llog.yellow("The characters created are:", this.characters);
  }
}
module.exports = Play;
