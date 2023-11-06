const { llog } = require("./utils");
const OpenAI = require("openai");
const functions_data = require("./functions.json");

require("dotenv").config();

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let Play = class {
  constructor(message, client) {
    this.client = client;
    this.message = message;
    this.channel_id = message.channel_id;
    this.prompt = message.text;
    this.conversation_history = [];
    this.characters = [];
    this.character_chosen = "Narrator";
    this.talk = true;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
    });
    this.next_line = "";
  }

  async createCharacters() {
    const messages = [{ role: "user", content: this.prompt }];
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
    var output = ``;
    for (const character of this.characters) {
      output += `--- A ${character.role} named ${character.name}, that's ${character.traits}, and looks like ${character.appearance}\n\n`;
    }
    await this._postMessage(
      `Great! Thanks for waiting. The characters created are: \n${output}`
    );
  }
  async chooseTurn() {
    const GPT_prompt = `The prompt of the play is "${
      this.prompt
    }", the characters are "${JSON.stringify(
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
  }
  async createMessageAsCharacter() {
    let character_info = null;
    for (const character of this.characters) {
      if (character.name == this.character_chosen) {
        character_info = character;
        // llog.red(character);
        // traits = character.traits;
        // appearance = character.appearance;
        // role = character.role;
      }
    }
    if (character_info == null) {
      await this._postMessage(
        "Ups, something went wrong when choosing the character. Please try again."
      );
    }
    const role_play = `You are a character in a theatric play. You are creating the next line that you have to say. Your name is "${
      this.character_chosen
    }". You're role is "${character_info.role}". You're traits are "${
      character_info.traits
    }", and you look like "${character_info.appearance}". The play is about "${
      this.prompt
    }". The previous messages are "${JSON.stringify(
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
    this.conversation_history.push(line);
    return line;
  }
  async _postMessage(text) {
    await this.client.chat.postMessage({
      channel: this.channel_id,
      text: text,
    });
  }
  async director() {}
  async start() {
    llog.magenta("Start play");
    await this._postMessage(
      "Starting play. To end the play, type `/end-play` - Enojy!"
    );
    while (this.talk) {
      llog.magenta(
        `Director here, will create a line for ${this.character_chosen}`
      );
      await this.createMessageAsCharacter();
      llog.yellow(`    The line created is: ${this.next_line}`);
      await this._postMessage(`[${this.character_chosen}] - ${this.next_line}`);
      llog.magenta("Director here, will choose next turn");
      let rnd = random(1, 3);
      if (rnd == 1 && this.character_chosen != "Narrator") {
        // 1/3 chance to choose narrator
        this.character_chosen = "Narrator";
      } else {
        await this.chooseTurn();
      }

      llog.yellow(`    The character chosen is: ${this.character_chosen}`);
    }
  }
  async stop() {
    llog.magenta("Stop play");
    this.talk = false;
  }
  async initialize() {
    await this._postMessage(
      `Hello! This is the Director speaking. I will be creating a play for the prompt: ${this.prompt} \nFirst, I will start by creating the characters. Please give me a few seconds while I do that :)`
    );
    llog.magenta("Director here, will create characters");
    await this.createCharacters();
    llog.yellow("The characters created are:", this.characters);
    this.characters.push(functions_data.narrator);
    await this._postMessage(
      "Whenever you're ready start the play by typing the command `/start-play`"
    );
  }
};
module.exports = Play;
