const Scene = require('telegraf/scenes/base');
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {

    const sendLink = new Scene('sendLink');

    sendLink.enter( async ctx => {
        this.bot.telegram.sendMessage(tools.getID(ctx), `Введите ссылку на zoom или другие контактные данные для связи`)
        ctx.session.comment = {}
    })

    sendLink.on('message', async ctx => {
        const text = ctx.message.text
        const doctorID = ctx.message.chat.id
        const userID = ctx.session.userID
        const user = await this.User.findOne({userID})
        this.bot.telegram.sendMessage(doctorID, `Консультация клиента:\n\nИмя: ${user.first_name ? user.first_name : ''} ${user.last_name ? user.last_name : ''}\nНикнейм: ${user.username ? '@' + user.username : '<i>не указан</i>'}\n\nПосле завершения консультации нажмите кнопку под этим сообщением`,
            tools.getInlineKeyboard(content.finishFullConsul(userID)))
        const message = await this.bot.telegram.sendMessage(userID, `Контактные данные для связи с врачем:\n${text}\n\nВрач Вас ожидает!`)
        this.User.updateOne({ userID }, { messageID: message.message_id }).then()
        ctx.scene.leave()
    })

    return sendLink
};
