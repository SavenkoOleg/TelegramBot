const Scene = require('telegraf/scenes/base');
const Queue = require('bull');
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {

    const checkConsul = new Queue('checkConsul', config.redis);
    const getMessageModer = new Scene('getMessageModer');

    let messages = []
    getMessageModer.enter( ctx => {
        const consultationID = tools.makeID(5);
        const doctorID = config.chatID;
        this.Consultation({
            type: 'express',
            consultationID, doctorID,
            clientID: tools.getID(ctx),
            status: 'new', rate: 0,
        }).save()
        this.User.updateOne({userID: tools.getID(ctx)}, {consultationID}).then();
        const text = `Напишите свой вопрос к специалисту\n\nВы можете отправить несколько сообщений, а также фото, видео, аудио и любой другой контент.\n\nПосле, для отправки сообщения врачу нажмите кнопку <b>Оправить сообщение</b>\n\nЕсли клавиатуры не видно, нажмите кнопку как на прикрепленном рисунке.`
        this.bot.telegram.sendPhoto(tools.getID(ctx), content.ERROR_PHOTO, tools.getExtraKeyboard(content.clientKeyboard, text))
        const messageWithClient = `<b>Экспресс-консультация</b>\n\nВопрос от\n${tools.fromUser(ctx)}\n\nНачало сообщения`
        this.bot.telegram.sendMessage(doctorID, messageWithClient, config.parseMode)
        checkConsul.add({consultationID}, config.delayRedis)
        ctx.session.comment = {}
    })

    getMessageModer.on('message', (ctx) => {
        const text = ctx.message.text
        const clientID = ctx.message.chat.id
        const doctorID = config.chatID;
        if (content.SEND_MESSAGE === text) {
            this.User.updateOne({userID: clientID}, {messages}).then();
            this.bot.telegram.sendMessage(clientID, 'Сообщение отправлено!\n\nСпециалист ответит Вам в течение 24 часов!', tools.getKeyboard(content.userKeyboard))
            this.bot.telegram.sendMessage(doctorID, `Конец сообщения\n\nСообщение от\n${tools.fromUser(ctx)}`, tools.getExtraInline(content.answerDialogModer(clientID)))
            ctx.scene.leave()
        } else {
            messages.push(ctx.message);
            this.bot.telegram.sendCopy(doctorID, ctx.message)
        }
    })

    return getMessageModer
};
