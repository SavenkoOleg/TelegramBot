const config = {
    'url': 'localhost',
    'port': '27017',
    'name_bot': 'medicine',
    'log': true
}

const redis = { defaultJobOptions: { removeOnComplete: true, removeOnFail: false } }

// Deploy -----------------------------------------------
const deployMode = false;
// ------------------------------------------------------
const delayRC = { ms: 1000, s: 60, m: 60, h: 24 }
const delayRedis = { delay: delayRC.ms * delayRC.s * delayRC.m * delayRC.h }

const delayRedisRT_1 = { delay: delayRC.ms * delayRC.s * delayRC.m * delayRC.h * 30 }
const delayRedisRT_2 = { delay: delayRC.ms * delayRC.s * delayRC.m * delayRC.h * 60 }
const delayRedisRT_3 = { delay: delayRC.ms * delayRC.s * delayRC.m * delayRC.h * 90 }
const delayRedisRT_4 = { delay: delayRC.ms * delayRC.s * delayRC.m * delayRC.h * 2 }

const delaySend_1 = { delay: delayRC.ms * delayRC.s * 2 }
const delaySend_2 = { delay: delayRC.ms * delayRC.s * 2 }

const delMsgFlag = true;

const url_bot = `mongodb://${config.url}:${config.port}/${config.name_bot}`
const parseMode = { parse_mode: 'HTML' }
const adminNick = 'Dr_nikiforova';
// pctestrobot   DomaDocBot
const botName = 'DomaDocBot';
let linkBot = `t.me/${botName}?start=`;
let linkChat = `https://t.me/joinchat/FeKj6BuUsUoU30SKd0qrzA`;
const timeDelMSG = 4000

// ---- PayAnyWay ----------------
const numberAccount = 15298324
const payTestMode = true;
// -------------------------------

// const chatID = -1001300106674;
// const token = '1366244853:AAFCjB7mSQoD0H4Src11VsZtoDIJ_JwmWNE'
// const restURI = 'https://b24-298fwv.bitrix24.ru/rest/1/yf59dcp13otv2z4t/'
const adminIDs = [275141032, 367174632, 579202555]; //275141032, 367174632


// --------- test -----------------------------------------
const chatID = -477872112;
const token = '965408303:AAHqZhyWiRGSolMRaZc6FzRoyBSQ7upAQ_I'
const restURI = 'https://b24-9gvnqi.bitrix24.ru/rest/1/17408aiexfkb9jgd/'
    // --------- test -----------------------------------------

module.exports.delMsgFlag = delMsgFlag
module.exports.deployMode = deployMode
module.exports.url_bot = url_bot
module.exports.config = config
module.exports.timeDelMSG = timeDelMSG
module.exports.adminIDs = adminIDs
module.exports.token = token
module.exports.linkBot = linkBot
module.exports.linkChat = linkChat
module.exports.adminNick = adminNick
module.exports.parseMode = parseMode
module.exports.payTestMode = payTestMode
module.exports.chatID = chatID
module.exports.numberAccount = numberAccount


module.exports.restURI = restURI
module.exports.redis = redis
module.exports.delayRedis = delayRedis

module.exports.delayRedisRT_1 = delayRedisRT_1
module.exports.delayRedisRT_2 = delayRedisRT_2
module.exports.delayRedisRT_3 = delayRedisRT_3
module.exports.delayRedisRT_4 = delayRedisRT_4

module.exports.delaySend_1 = delaySend_1
module.exports.delaySend_2 = delaySend_2