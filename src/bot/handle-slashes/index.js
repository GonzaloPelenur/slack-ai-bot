// const { llog } = require('../../utils')

// module.exports.aiBotExample = async ({ command, ack, client }) => {
//     await ack();
//     llog.cyan(llog.divider, `a slash command has been fired`, command, llog.divider)
//     let terms = command.text.split(" ");
//     let uniqueTerms = [...new Set(terms)];
//     var elements = []
//     for (let index = 0; index < uniqueTerms.length; index++) {
//         elements.push({
//             "type": "button",
// 					"text": {
// 						"type": "plain_text",
// 						"text": uniqueTerms[index],
// 						"emoji": true
// 					},
// 					"value": `test_${uniqueTerms[index]}`,
// 					"action_id": `test_action_${uniqueTerms[index]}`
//         })   
//     }
//     const blocks = [
//         {
//             "type": "image",
//             "image_url": "https://media.giphy.com/media/gw3IWyGkC0rsazTi/giphy.gif",
//             "alt_text": "testing testing"
//         },
//         {
//             "type": "header",
//             "text": {
//                 "type": "plain_text",
//                 "text": `testing testing`,
//                 "emoji": true
//             }
//         },
//         {
//             "type": "section",
//             "text": {
//                 "type": "mrkdwn",
//                 "text": `testing buttons`
//             }
//         },
//         {
// 			"type": "actions",
// 			"elements": elements
// 		}
//     ]
    
//     try {
//         const result = await client.chat.postMessage({
//             channel: command.channel_id,
//             text: "if you see this, the machine can't work in this context",
//             blocks: blocks
//         })
//         llog.magenta(result)
//         // let theRecord = {
//         //     SlackTs: result.ts,
//         //     UserId: command.user_id || "NA",
//         //     SlackChannelId: command.channel_id || "NA" ,
//         //     SlackCommandJSON: JSON.stringify(command, null, 4),
//         //     SlackMessageJSON: JSON.stringify(result, null, 4)
//         // }
//         // let theResult = await airtableTools.addRecord({
//         //     baseId: process.env.AIRTABLE_MOMENTS_BASE,
//         //     table: "SlackMomentSlashSessions",
//         //     record: theRecord
//         // })
//         // return(theResult)
//     } catch (error) {
//         llog.red(`couldn't post message in response to moment slash`, error )
//     }
// }
