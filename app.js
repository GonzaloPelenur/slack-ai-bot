const { App, subtype } = require("@slack/bolt");
const path = require("path");
const { llog } = require("./src/utils");
const { noBot } = require("./src/utils/ll-slack-utils/middleware");
const handleAllNonBot = require("./src/handle-all-nonbot");
// const { handleTesting, handleAllNonBot, handleBot } = require('./src/bot/handle-messages');
// const slashHandler = require('./src/bot/handle-slashes');
// const eventHandler = require('./src/bot/handle-events')
// const { everything } = require('./src/utils/ll-regexes')

require("dotenv").config();
global.ROOT_DIR = path.resolve(__dirname);

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
  console.log("⚡️ Bolt app is running!");
})();
