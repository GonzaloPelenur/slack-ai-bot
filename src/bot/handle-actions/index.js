const airtableTools = require(`../../ll-modules/ll-airtable-tools`)
const { llog } = require('../../ll-modules/ll-utilities')
const Airtable = require('airtable')


module.exports.log = async ({ payload, body, context, ack }) => {
    await ack()
    llog.blue("payload:", payload)
    llog.gray("body", body)
    try {
        let result = await airtableTools.addRecord({
            baseId: process.env.AIRTABLE_MOMENTS_BASE,
            table: "SlackActions",
            record: {
                SlackTs: payload.action_ts,
                SlackJSON: JSON.stringify(payload, null, 4)
            }
        })
    } catch (error) {
        llog.red(error)
    }
}


// module.exports.liveLogger = async ({ payload, body, say, context, ack }) => {
//     await ack()
//     gray(payload)
//     gray(body)
//     // await say(`got a button press. \n\nblock_id = \`${payload.block_id}\`. action_id = \`${payload.action_id}\`. value = \`${payload.value}\`. action_ts = \`${payload.action_ts}\`.`);
//     // send to Airtable
//     var base = new Airtable({apiKey: process.env.AIRTABLE_STUDIOBOT_API_KEY}).base(process.env.AIRTABLE_STUDIOBOT_BASE_ID);
//     var airtableResult = await base("LiveLogs").create({
//         SlackTS: payload.action_ts,
//         SlackJSON: JSON.stringify(payload),
//         LLTimecode: llTimeTools.llTimecodeFromSlackTS(payload.action_ts),
//         Tag: payload.text.text
//     }).then(result => {
//         console.log("saved to airtable");
//         return result;
//     })
//     .catch(err => {
//         console.log("\nthere was an error with the AT push\n");
//         console.error(err);
//         return;
//     });
// }



// module.exports.atemButtons = async ({ payload, body, context, ack }) => {
//     await ack()
//     blue(payload)
//     // yellow(body)
//     await atemTools.macro(
//         {
//             atemIp: process.env.A8K_IP,
//             macro: payload.value
//         }
//     )
// }