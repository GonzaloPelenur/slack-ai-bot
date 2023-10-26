const { llog } = require('../../utils')

exports.reactionAdded = async ({ event, client }) => {
    llog.yellow(llog.divider, `got a reactionAdded`)
    if (event.reaction == "rocket") {
      llog.magenta(`got a rocket reaction`)
      llog.gray(event)
      // handle custom logic for rocket emoji
      let result = await client.chat.postMessage({
        channel: event.item.channel,
        text: `let's start chatting in this thread about why you added that :rocket: reaction  <@${event.user}>`,
        thread_ts: event.item.ts
      })
    } else {
      llog.magenta(`some other reaction we aren't handling now`)
      llog.gray(event)
    }
}

exports.log = async ({ event, client }) => {
    llog.gray(`got an event: ${event.type}:`, event)
}

exports.reactionRemoved = async ({ event, client }) => {
    llog.gray(`got an event: ${event.type}:`, event)
}

exports.fileShared = async ({ event, client }) => {
    llog.gray(`got an event: ${event.type}:`, event)
}

exports.appHomeOpened = async ({ event, client }) => {
    llog.gray(`got an App Home Opened event: ${event.type}:`, event)
    try {
        // Call views.publish with the built-in client
        const result = await client.views.publish({
          // Use the user ID associated with the event
          user_id: event.user,
          view: {
            // Home tabs must be enabled in your app configuration page under "App Home"
            "type": "home",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Welcome home, <@" + event.user + "> *"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "Let's work at finding some things I can do for you today."
                }
              }
            ]
          }
        });
        magenta(result)
      }
      catch (error) {
        logger.error(error);
      }
}
