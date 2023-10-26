const airtableTools = require(`../../ll-modules/ll-airtable-tools`)
const { llog } = require('../../ll-modules/ll-utilities')

async function handleMlaunch (event) {
    llog.cyan(llog.divider, `got a moment emoji; handling it`, llog.divider)
    llog.blue(event)
    // need to track down original item in here too
    let theRecord = {
        OriginalItemSlackTs: event.item.ts  || "",
        MomentEmojiSlackTs: event.event_ts  || "",
        SlackChannelId: event.item.channel || "",
        OriginalItemType: event.item.type  || "",
        OriginalItemUser: event.item_user  || "",
        SlackJSON: JSON.stringify(event, null, 4),
        Status: "Launched"
    }
    let theResult = await airtableTools.addRecord({
        baseId: process.env.AIRTABLE_MOMENTS_BASE,
        table: "Moments",
        record: theRecord
    })
    // now let's start a comment thread
    return theResult
}

async function handleMstop (event) {
    // get original record
    let momentRecord = await airtableTools.findOneByValue({
        baseId: process.env.AIRTABLE_MOMENTS_BASE,
        table: "Moments",
        view: "MAIN",
        field: "OriginalItemSlackTs",
        value: event.item.ts
    })
    let momentUpdate = await airtableTools.updateRecord({
        baseId: process.env.AIRTABLE_MOMENTS_BASE,
        table: "Moments",
        view: "MAIN",
        recordId: momentRecord.id,
        updatedFields: {
            Status: "Over",
            StopTs: event.event_ts
        }
    })
    llog.red(momentUpdate)
    llog.magenta(momentRecord)
}

async function handleMstart (event) {
    // get original record
    let momentRecord = await airtableTools.findOneByValue({
        baseId: process.env.AIRTABLE_MOMENTS_BASE,
        table: "Moments",
        view: "MAIN",
        field: "OriginalItemSlackTs",
        value: event.item.ts
    })
    let momentUpdate = await airtableTools.updateRecord({
        baseId: process.env.AIRTABLE_MOMENTS_BASE,
        table: "Moments",
        view: "MAIN",
        recordId: momentRecord.id,
        updatedFields: {
            Status: "Happening",
            StartTs: event.event_ts
        }
    })
    llog.red(momentUpdate)
    llog.magenta(momentRecord)
}

async function handleMpause (event) {

}

exports.reactionAdded = async ({event}) => {
    llog.yellow(`got a reactionAdded: ${event.type}:`)
    llog.cyan(event)
    if (BOT_CONFIG.channels.includes(event.item.channel)) {
      llog.blue(`handling message because ${event.item.channel} is one of \n${JSON.stringify(BOT_CONFIG.channels, null, 4)}`)
      llog.yellow(event)
      let theRecord = {
            EventType: event.type || "",
            UserId: event.user  || "",
            Reaction: event.reaction  || "",
            OriginalItemTs: event.item.ts  || "",
            SlackChannelId: event.item.channel  || "",
            OriginalItemType: event.item.type  || "",
            OriginalItemUser: event.item_user  || "",
            SlackEventTs: event.event_ts  || "",
            SlackJSON: JSON.stringify(event, null, 4)
        }
        let theResult = await airtableTools.addRecord({
            baseId: process.env.AIRTABLE_MOMENTS_BASE,
            table: "SlackReactions",
            record: theRecord
        })
        llog.blue(theResult)
        if (event.reaction == "mlaunch") {
            llog.magenta(`a moment has been launched`)
            let mlaunch = await handleMlaunch(event)
        } else if (event.reaction == "mstart") {
            llog.green('the moment has begun')
            let mstart = await handleMstart(event)
        } else if (event.reaction == "mstop") {
            llog.red('the moment is over')
            let mstop = await handleMstop(event)
        }
        return(`finished momentMessageToAirtable`)
    } else {
        llog.magenta(`some other event we aren't handling now`)
        llog.blue(`event channel wasn't in array ${JSON.stringify(BOT_CONFIG.channels, null, 4)}`)
        llog.yellow(event)
    }
    
}

  
exports.reactionRemoved = async ({ event }) => {
    llog.yellow(`got a reactionRemoved ${event.type}:`)
    llog.cyan(event)
}


