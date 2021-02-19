const Scene = require('telegraf/scenes/base');
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {

    const sendMessageFull = new Scene('sendMessageFull');

    sendMessageFull.enter( async ctx => {
        this.bot.telegram.sendMessage(tools.getID(ctx), `Напишите сообщение`, tools.getKeyboard(content.clientKeyboard))
        ctx.session.comment = {}
    })

    sendMessageFull.on('message', async ctx => {
        const text = ctx.message.text
        const clientID = ctx.message.chat.id
        const userID = ctx.session.userID
        let message = {}
        if (content.SEND_MESSAGE === text) {
            const doctor = await this.Doctor.findOne({userID})
            if(doctor) {
                this.bot.telegram.sendMessage(clientID, 'Сообщение отправлено!', tools.getKeyboard(content.userKeyboard))
                message = await this.bot.telegram.sendMessage(userID, `Вы можете задать уточняющий вопрос`, tools.getExtraInline(content.answerDialogFull(clientID)))
            } else {
                this.bot.telegram.sendMessage(clientID, 'Сообщение отправлено!', tools.getKeyboard(content.finishKeyboardFull))
                message = await this.bot.telegram.sendMessage(userID, `Вы можете задать уточняющий вопрос`, tools.getExtraInline(content.answerDialogFull(clientID)))
            }
            this.User.updateOne({userID}, {messageID: message.message_id}).then()
            ctx.scene.leave()
        } else {
            this.bot.telegram.sendCopy(userID, ctx.message)
        }
    })

    return sendMessageFull
};
