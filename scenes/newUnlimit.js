const Scene = require('telegraf/scenes/base')
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {

    const newUnlimit = new Scene('newUnlimit')

    newUnlimit.enter((ctx) => {
        ctx.reply(content.UNLIMIT_PRICE , tools.getInlineKeyboard(content.getUnlimitInline))
        ctx.session.unlimit = { tarif: '' }
    })

    newUnlimit.on('text', async(ctx) => {
        if (ctx.message.text !== 'Отмена') {
            if (ctx.message.forward_from) {
                const userID = ctx.message.forward_from.id;
                this.createOrder(userID, ctx.session.unlimit.tarif)
                const reply = await ctx.reply('Ссылка на оплату отправлена!');
                setTimeout(() => this.bctx.deleteMessage(ctx.message.chat.id, reply.message_id), config.timeDelMSG);
                ctx.scene.leave();
            } else {
                ctx.reply(`Не удается опредилить пользователя!\n\nВоможно, владелец аккаунта ограничил доступность данных (настройки конфидециальности) или это не подходящее сообщение\n\nПроверьте данные и повторите еще раз!`);
            }
        } else { ctx.scene.leave() }
    })

    newUnlimit.on('callback_query', ctx => {
        const data = ctx.update.callback_query.data
        const userID = ctx.update.callback_query.message.chat.id;
        const messageID = ctx.update.callback_query.message.message_id

        if (config.delMsgFlag) this.bctx.deleteMessage(userID, messageID);
        console.log(data)
        if (data !== 'exit') {
            ctx.reply(content.NEW_UNLIMIT_TEXT , tools.getKeyboard(content.cancelKey))
            ctx.session.unlimit.tarif = data
        } else { ctx.scene.leave() }
    })

    newUnlimit.leave( ctx => {
        ctx.reply(content.REPLY, tools.getKeyboard(content.adminKeyboard));
    })

    return newUnlimit
};

