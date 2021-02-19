const Extra = require('telegraf/extra')

module.exports.makeID = n => {
    var ID = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < n; i++) ID += possible.charAt(Math.floor(Math.random() * possible.length));
    return ID;
}

module.exports.makeIntID = n => {
    var ID = "";
    var possible = "0123456789";
    for (var i = 0; i < n; i++) ID += possible.charAt(Math.floor(Math.random() * possible.length));
    return Number(ID);
}


module.exports.getKeyboard = keyboard => {
    return { reply_markup: { keyboard: keyboard ? keyboard : [], resize_keyboard: true, one_time_keyboard: true }, parse_mode: 'HTML' }
}

module.exports.getInlineKeyboard = (inline, text = null) => {
    let _inline = []
    if(inline.length) {
        inline.forEach(item => {
            if(Array.isArray(item) && item.length) {
                let _mass = []
                item.forEach(_item => { if(!_item.hide) _mass.push(_item); })
                _inline.push(_mass)
            } else {
                if(!item.hide) _inline.push(item);
            }
        })
    }
    return { reply_markup: { inline_keyboard: _inline ? _inline : [], resize_keyboard: true, one_time_keyboard: true }, caption: text, parse_mode: 'HTML' }
}

module.exports.getExtraInline = (inline, text) => {
    return { reply_markup: { inline_keyboard: inline ? inline : [] }, caption: text, parse_mode: 'HTML' }
};

module.exports.getExtraInlineNotCaption = (inline) => {
    console.log(inline)
    return { reply_markup: { inline_keyboard: inline ? inline : [] }, parse_mode: 'HTML' }
};


module.exports.getExtraKeyboard = (keyboard, text) => {
    return { reply_markup: { keyboard: keyboard ? keyboard : [], resize_keyboard: true, one_time_keyboard: true }, caption: text, parse_mode: 'HTML' }
};

module.exports.getID = (ctx) => {
    let ID = 0
    if (ctx.update.callback_query) ID = ctx.update.callback_query.from.id
    if (ctx.update.message) ID = ctx.update.message.from.id
    return ID
}

module.exports.fromUser = (ctx) => {
    let user = ''
    if (ctx.update['callback_query']) user = ctx.update.callback_query.from
    if (ctx.update['message']) user = ctx.update.message.from
    let text = `Имя: ${user.first_name ? user.first_name : ''} ${user.last_name ? user.last_name : ''}\nНикнейм: ${user.username ? '@'+user.username  : '<i>не указан</i>'}`
    return text
}


module.exports.delay = async (ms) => new Promise((resolve, reject) => { setTimeout(() => { resolve() }, ms) })

module.exports.rounded = number => {
    res = Math.round(parseFloat(number) * 100) / 100
    return res ? res : 0;
}

module.exports.delKey = () => Extra.markup(m => m.removeKeyboard())
