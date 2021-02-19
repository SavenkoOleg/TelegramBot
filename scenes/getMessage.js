const Scene = require('telegraf/scenes/base');
const Queue = require('bull');
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {

    const checkConsul = new Queue('checkConsul', config.redis);
    const getMessage = new Scene('getMessage');
    let timeOut_1 = null
    let timeOut_2 = null

    finishGetMSG = (ctx) => {
        const clientID = tools.getID(ctx)
        const doctorID = ctx.session.doctorID

        if(timeOut_1) clearTimeout(timeOut_1)
        if(timeOut_2) clearTimeout(timeOut_2)

        timeOut_1 = null
        timeOut_2 = null

        this.bot.telegram.sendMessage(clientID, 'Сообщение отправлено!\n\nСпециалист ответит Вам в течение 24 часов!', tools.getKeyboard(content.userKeyboard))
        this.bot.telegram.sendMessage(doctorID, `Конец сообщения\n\nСообщение от\n${tools.fromUser(ctx)}`, tools.getExtraInline(content.answerDialog(clientID)))
        ctx.scene.leave()
    }

    getMessage.enter( ctx => {
        const consultationID = tools.makeID(5)
        const doctorID = ctx.session.doctorID
        this.Consultation({
            type: 'express',
            consultationID, doctorID,
            clientID: tools.getID(ctx),
            status: 'new', rate: 0,
        }).save()
        this.User.updateOne({userID: tools.getID(ctx)}, {consultationID}).then();
        const text = `Напишите свой вопрос к специалисту\n\nВы можете отправить несколько сообщений, а также фото, видео, аудио и любой другой контент.\n\nПосле, для отправки сообщения врачу нажмите кнопку <b>ОТПРАВИТЬ СООБЩЕНИЕ</b>\n\nЕсли клавиатуры не видно, нажмите кнопку как на прикрепленном рисунке.`
        this.bot.telegram.sendPhoto(tools.getID(ctx), content.ERROR_PHOTO, tools.getExtraKeyboard(content.clientKeyboard, text))
        const messageWithClient = `<b>Экспресс-консультация</b>\n\nВопрос от\n${tools.fromUser(ctx)}\n\nНачало сообщения`
        this.bot.telegram.sendMessage(doctorID, messageWithClient, config.parseMode)
        checkConsul.add({consultationID}, config.delayRedis)
        ctx.session.comment = {}
    })

    getMessage.on('message', ctx => {
        const text = ctx.message.text

        const clientID = tools.getID(ctx)
        const doctorID = ctx.session.doctorID

        if(timeOut_1) clearTimeout(timeOut_1)
        if(timeOut_2) clearTimeout(timeOut_2)

        if (content.SEND_MESSAGE === text) { finishGetMSG(ctx) }
        else {
            this.bot.telegram.sendCopy(doctorID, ctx.message)

            timeOut_1 = setTimeout(async () =>  {
                const reply = await this.bot.telegram.sendMessage(clientID, content.SEND_MESSAGE_TIMEOUT, tools.getInlineKeyboard(content.sendMessageInline(true) ))
                this.User.updateOne({ userID: clientID }, { messageID: reply.message_id }).then()
                clearTimeout(timeOut_1)
                timeOut_1 = null

                timeOut_2 = setTimeout(async () =>  {
                    const user = await this.User.findOne({ userID: clientID })
                    if (user && user.messageID && config.delMsgFlag) { this.deleteMessage(clientID, user.messageID); }
                    finishGetMSG(ctx)
                    clearTimeout(timeOut_2)
                    timeOut_2 = null
                }, config.delaySend_2.delay)

            }, config.delaySend_1.delay)
        }

    })

    getMessage.on('callback_query', ctx => {
        if (ctx.update.callback_query.data === 'sendMessage') { finishGetMSG(ctx) }
        const userID = ctx.update.callback_query.message.chat.id;
        const messageID = ctx.update.callback_query.message.message_id;
        try { if (config.delMsgFlag) this.deleteMessage(userID, messageID); }
        catch (e) {}
    })
    return getMessage
};
