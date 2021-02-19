const mongoose = require('mongoose')
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')
// Schemes ----------------------------------------------------------------
const UserSchema = require('../models/user.model')
const PaymentSchema = require('../models/payment.model')
const DoctorSchema = require('../models/doctor.model')
const ConsultationSchema = require('../models/consultation.model')

class BotContext {

    constructor(bot, queue_1, queue_2, userMenu, callbackQueryUser) {
        this.bot = bot
        this.checkConsul = queue_1
        this.checkTarif = queue_2
        this.userMenu = userMenu
        this.callbackQueryUser = callbackQueryUser
    }

    User = mongoose.model(`users`, UserSchema);
    Payment = mongoose.model(`payments`, PaymentSchema);
    Doctor = mongoose.model(`doctors`, DoctorSchema);
    Consultation = mongoose.model(`consultations`, ConsultationSchema);

    async finishConsul(ctx, userID) {
        try {
            if (userID) {
                let key = content.doctorKeyboard
                if (config.adminIDs.includes(Number(userID))) key = content.adminKeyboard

                await this.bot.telegram.sendMessage(tools.getID(ctx), 'Консультация завершена!', tools.getKeyboard(key))
                this.bot.telegram.sendMessage(userID, 'Консультация завершена!\n\nПожалуйста, оцените качество консультации от 1 до 5', tools.getInlineKeyboard(content.getRateInline))

                this.writeOffServices(userID, 'express');

                const user = await this.User.findOne({ userID })
                this.Consultation.updateOne({consultationID: user.consultationID}, {status: 'finish'}).then();

                this.User.updateOne({ userID }, { sceneFlag: false, sceneFinishFlag: true }).then()
                this.User.updateOne({ userID: tools.getID(ctx) }, { sceneFlag: false }).then()

                if (user && user.messageID && !user.recommend) {
                    ctx.session.recommendID = null
                    this.deleteMessage(userID, user.messageID)
                }
            } else {
                let doctor = await this.Doctor.findOne({userID})
                let msg = 'user msg';
                if (doctor) msg = 'doctor'
                this.templateMSG(ctx, msg);
            }
        } catch (e) {}
    }

    async finishConsulFull(ctx, userID) {
        let key = content.doctorKeyboard
        if (config.adminIDs.includes(Number(tools.getID(ctx)))) key = content.adminKeyboard
        this.bot.telegram.sendMessage(tools.getID(ctx), 'Консультация назначена!', tools.getKeyboard(key))
        const user = await this.User.findOne({userID})
        this.bot.telegram.sendMessage(tools.getID(ctx),
            `Консультация клиента:\n\nИмя: ${user.first_name ? user.first_name : ''} ${user.last_name ? user.last_name : ''}\nНикнейм: ${user.username ? '@' + user.username : '<i>не указан</i>'}`,
            tools.getInlineKeyboard(content.sendLinkToFull(userID)))
        this.bot.telegram.sendMessage(userID, 'Консультация назначена!')

        this.User.updateOne({ userID }, { sceneFlag: false, sceneFinishFlag: true }).then()
        this.User.updateOne({ userID: tools.getID(ctx) }, { sceneFlag: false }).then()

        if (user && user.messageID) { this.deleteMessage(userID, user.messageID) }
    }

    async writeOffServices(userID, service) {
        const user = await this.User.findOne({userID});
        let edit = {}
        if (user && !user.unlimit) {
            if (service === 'full' && !!user && !!user.full) { edit = {full: user.full - 1} }

            if (service === 'express' && !!user && !user.unlimit) {
                if (!!user.express_tarif) { edit = { express_tarif: user.express_tarif - 1 } }
                else if (!!user.express_ref) { edit = { express_ref: user.express_ref - 1 } }
                else if (!!user.express_one) { edit = { express_one: user.express_one - 1 } }
            }

            if(Object.keys(edit).length) { this.User.updateOne({userID}, edit).then() }
        }
    }

    deleteMessage(userID, messageID) {
        if (userID && messageID) {
            try {
                this.bot.telegram.deleteMessage(userID, messageID)
            } catch (e) {
                console.log('Error: Delete message')
            }
        }
    }

    async templateMSG(ctx, code) {
        const help = `\n\nОбратитесь за помощью к @${config.adminNick}`
        let userID = 0
        let keyboard = []
        if (ctx.message) userID = ctx.message.from.id
        if (ctx.update.callback_query) userID = ctx.update.callback_query.message.chat.id

        switch (code) {
            case 'doctor':
                this.bot.telegram.sendMessage(userID, content.REPLY, tools.getKeyboard(content.doctorKeyboard));
                break
            case 'get consultation':
                this.bot.telegram.sendMessage(userID, content.SPECIALIZATION, tools.getInlineKeyboard(content.getSpecializationInline(true)) );
                break
            case 'new user':
                ctx.reply(content.NEW_USER)
                break
            case 'message add error':
                ctx.reply(content.ADD_ERROR)
                break
            case 'callback':
                this.bot.telegram.sendMessage(userID, content.CALLBACK_TEXT, tools.getInlineKeyboard(content.FeedBack));
                break
            case 'error':
                if (config.adminIDs.includes(userID)) { keyboard = content.userKeyboard } else { keyboard = content.adminKeyboard }
                const extra = { reply_markup: { keyboard, resize_keyboard: true }, caption: content.ERROR, parse_mode: 'HTML' };
                // this.bot.telegram.sendPhoto(userID, content.ERROR_PHOTO, extra);
                break
            case 'link error':
                ctx.reply(content.ERROR_LINK);
                break
            case 'user msg':
                this.bot.telegram.sendMessage(userID, content.REPLY, tools.getKeyboard(content.userKeyboard));
                break
            case 'start user msg':
                this.bot.telegram.sendMessage(userID, content.WELCOME, tools.getKeyboard(content.userKeyboard));
                break
            case 'control content':
                this.bot.telegram.sendMessage(userID, content.CONTROL_CONTENT_TEXT, tools.getKeyboard( content.controlContent ));
                break
            case 'admin':
                this.bot.telegram.sendMessage(userID, content.REPLY, tools.getKeyboard(content.adminKeyboard));
                break
            case 'admin start':
                this.bot.telegram.sendMessage(userID, content.WELCOME, tools.getKeyboard(content.adminKeyboard));
                break
            default:
                if (config.adminIDs.includes(userID)) { keyboard = content.userKeyboard } else { keyboard = content.adminKeyboard }
                this.bot.telegram.sendMessage(userID, content.ERROR_OTHER, tools.getKeyboard(keyboard));
        }
    }

}

module.exports = (bot, queue_1, queue_2, userMenu, callbackQueryUser) => new BotContext(bot, queue_1, queue_2, userMenu, callbackQueryUser);
