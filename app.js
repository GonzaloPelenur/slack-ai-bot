const { App, subtype } = require("@slack/bolt");
const path = require("path");
const { llog } = require("./src/utils");
const { noBot } = require("./src/utils/ll-slack-utils/middleware");
const handleAllNonBot = require("./src/handle-all-nonbot");
const { director, startPlay, stopPlay } = require("./src/director");
const { Play } = require("./src/play");

// const { handleTesting, handleAllNonBot, handleBot } = require('./src/bot/handle-messages');
// const slashHandler = require('./src/bot/handle-slashes');
// const eventHandler = require('./src/bot/handle-events')
// const { everything } = require('./src/utils/ll-regexes')

require("dotenv").config();
global.ROOT_DIR = path.resolve(__dirname);
var continue_play = false;
var play_channel = "";
const handleTesting = async ({ message, say }) => {
  llog.cyan("got testing testing", message);
  // say() sends a message to the channel where the event was triggered
  await say(`the bot is running, <@${message.user}>.`);
};

const handleHello = async ({ message, say }) => {
  llog.cyan("got a hello message", message);
  // say() sends a message to the channel where the event was triggered
  await say(`hello yourself, <@${message.user}>.`);
};

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
});

app.message(/testing testing/i, handleTesting);
app.message(/hello/, handleHello);
app.message(/.*/, noBot, handleAllNonBot);
app.command("/playprompt", async ({ command, ack, say }) => {
  // llog.yellow("got a slash command", command);
  await ack({ text: "Will start a play for: " + command.text });
  director({ message: command, say: say, client: app.client });
  // const play = new Play({ message: command, client: app.client });
  // await play.director();
});

app.command("/start-play", async ({ command, ack, say }) => {
  // llog.yellow("got a slash command", command);
  play_channel = command.channel_id;
  await ack({ text: "Will start the play" });
  continue_play = true;
  var counter = 0;
  startPlay({ message: command, say: say, client: app.client });
  // while (continue_play) {
  //   counter++;
  //   await app.client.chat.postMessage({
  //     channel: play_channel,
  //     text: "test " + counter.toString(),
  //   });
  // }
});

app.command("/end-play", async ({ command, ack, say }) => {
  // llog.yellow("got a slash command", command);
  await ack({ text: "Will end the play" });
  continue_play = false;
  stopPlay();
});

// app.message(subtype('bot_message'), handleBot );

// app.command('/your-command', slashHandler.yourCommandHandler);

// app.event("reaction_added", eventHandler.reactionAdded);
// app.event("reaction_removed", eventHandler.reactionRemoved);
// app.event(/.*/, eventHandler.log);

// app.action(everything, actionHandler.log);

// app.view(/some_submission/, handleViewSubmission);

// app.shortcut(/.*/, shortcutHandler.log);

(async () => {
  // Start your app
  global.BOT_CONFIG = { channels: [process.env.SLACK_TESTS_CHANNEL] };
  await app.start();
  // await socketModeClient.start();
  console.log("⚡️ Bolt app is running!");
})();
