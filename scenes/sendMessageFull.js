const Scene = require('telegraf/scenes/base');
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {

    const sendMessageFull = new Scene('sendMessageFull');

    let timeOut_1 = null
    let timeOut_2 = null


    finishSendMSGFull = async ctx  => {
        const clientID = tools.getID(ctx)
        const userID = ctx.session.userID
        const doctor = await this.bctx.Doctor.findOne({userID})
        let message = {}

        if(timeOut_1) clearTimeout(timeOut_1)
        if(timeOut_2) clearTimeout(timeOut_2)

        if(doctor) {
            this.bctx.bot.telegram.sendMessage(clientID, 'Сообщение отправлено!', tools.getKeyboard(content.userKeyboard))
            // message = await this.bctx.bot.telegram.sendMessage(userID, `Вы можете задать уточняющий вопрос`, tools.getExtraInline(content.answerDialog2(clientID)))
        }
        else {
            ctx.session.recommendID = clientID
            this.bctx.bot.telegram.sendMessage(clientID, 'Сообщение отправлено!', tools.getKeyboard(content.finishKeyboardFull))
            message = await this.bctx.bot.telegram.sendMessage(userID, `Вы можете задать уточняющий вопрос`, tools.getExtraInline(content.answerDialogFull(clientID)))
        }

        this.bctx.User.updateOne({ userID: tools.getID(ctx) }, { messageID: message.message_id, sceneFlag: true }).then()
    }

    sendMessageFull.enter( async ctx => {
        let extra = {}
        ctx.session.comment = {}
        const doctor = await this.bctx.Doctor.findOne({userID: tools.getID(ctx)})
        if(doctor) extra = tools.getKeyboard(content.clientKeyboard)
        this.bctx.bot.telegram.sendMessage(tools.getID(ctx), `Напишите ответ`, extra)
    })
    sendMessageFull.on('message', async ctx => {
        const text = ctx.message.text
        const userID = ctx.session.userID
        const clientID = tools.getID(ctx)

        const doctor = await this.bctx.Doctor.findOne({userID: clientID})
        const user = await this.bctx.User.findOne({userID: clientID})

        if(timeOut_1) clearTimeout(timeOut_1)
        if(timeOut_2) clearTimeout(timeOut_2)

        if (content.SEND_MESSAGE === text) { finishSendMSGFull(ctx) }
        else if (content.FINISH_CONSUL_FULL === text) {
            this.bctx.finishConsulFull(ctx, userID)
            ctx.scene.leave();
        }
        else {
            if(user && user.sceneFinishFlag) {
                this.bctx.userMenu(ctx)
                this.bctx.User.updateOne({ userID: tools.getID(ctx) }, { sceneFinishFlag: false }).then()
                ctx.scene.leave();
            } else {

                this.bctx.bot.telegram.sendCopy(userID, ctx.message)
                if(user && !user.sceneFlag) {
                    timeOut_1 = setTimeout(async () =>  {
                        const reply = await this.bctx.bot.telegram.sendMessage(clientID, content.SEND_MESSAGE_TIMEOUT, tools.getInlineKeyboard(content.sendMessageFullInline(!doctor) ))
                        this.bctx.User.updateOne({ userID: clientID }, { messageID: reply.message_id }).then()
                        clearTimeout(timeOut_1)
                        timeOut_1 = null

                        timeOut_2 = setTimeout(async () =>  {
                            try {
                                const user = await this.bctx.User.findOne({ userID: clientID })
                                finishSendMSGFull(ctx)
                                clearTimeout(timeOut_2)
                                timeOut_2 = null
                                if (user && user.messageID && config.delMsgFlag) { this.bctx.deleteMessage(clientID, user.messageID); }
                            } catch (e) {}

                        }, config.delaySend_2.delay)
                    }, config.delaySend_1.delay)
                }
            }
        }
    })
    sendMessageFull.on('callback_query', async ctx => {

        const _content = ctx.update.callback_query
        const action = _content.data.split(':')[0];
        const objectID = _content.data.split(':')[1];

        if(timeOut_1) clearTimeout(timeOut_1)
        if(timeOut_2) clearTimeout(timeOut_2)

        if( _content.data === 'sendMessage' ) { finishSendMSG(ctx) }
        if ( _content.data === 'finish full' ) {
            this.bctx.finishConsulFull(ctx, ctx.session.userID)
            ctx.scene.leave();
        }
        if ( action === 'full-consul' ) { this.callbackQueryUser(ctx) }
        if ( action === 'rate' ) {
            const user = await this.bctx.User.findOne({userID: tools.getID(ctx)})
            if (user && user.consultationID) {
                await this.bctx.Consultation.updateOne({consultationID: user.consultationID}, {rate: Number(objectID) }).then();
                await this.bctx.User.updateOne({userID: tools.getID(ctx)}, {consultationID: '', sceneFinishFlag: false}).then();
            }
            const reply = await ctx.reply('Благодарим за ответ!');
            setTimeout(() => this.bctx.deleteMessage(tools.getID(ctx), reply.message_id), config.timeDelMSG);
            ctx.scene.leave();
        }
        if ( _content.data === 'cancel pay' ) {
            const doctor = await this.bctx.Doctor.findOne({ userID: tools.getID(ctx) })
            const _pay = await this.bctx.Payment.findOne({payID: objectID})
            if (doctor) msg = 'doctor'
            this.bctx.templateMSG(ctx, msg);
            this.bctx.Payment.updateOne({payID: objectID}, {status: 'canceled'}).then();
            this.updateStatusDeal(_pay.dealID, "LOSE");
        }

        const userID = ctx.update.callback_query.message.chat.id;
        const messageID = ctx.update.callback_query.message.message_id;
        try { if (config.delMsgFlag) this.bctx.deleteMessage(userID, messageID);}
        catch (e) {}

    })

    return sendMessageFull
};
