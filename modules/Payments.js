"use strict";
exports.__esModule = true;
const Bitrix = require("@2bad/bitrix");

const mongoose = require('mongoose')

const config = require('../src/config')
const tools = require('../src/tools')
const content = require('../src/content')

class Payments {

    constructor(bctx) {
        this.bctx = bctx
        this.bitrix = Bitrix["default"](config.restURI);

        this.bctx.checkTarif.add({userID: 1053017974, tarif: 7, last: true}, config.delayRedisRT_1)
    }
    createCompany() {
        const name = "Telegram bot"
        this.bitrix.companies.create({"TITLE": name})
            .then(({ result }) => console.log('New Company: ' + name + ', ID: ' + result) )
            .catch(console.error)
    }

    createNewDeal(title, price, payID) {
        const deal = {
            "TITLE": title,
            "STAGE_ID": "NEW",
            "COMPANY_ID": 1,
            "CURRENCY_ID": "RUB",
            "OPPORTUNITY": price
        }

        this.bitrix.deals.create(deal)
            .then(({ result }) => { this.bctx.Payment.updateOne({payID}, {dealID: result}).then() })
            .catch(console.error)
    }
    updateStatusDeal(ID, stage) {
        this.bitrix.deals.update(ID, {"STAGE_ID": stage})
            .then(({ result }) => {})
            .catch(console.error)
    }

    async addOrder(user, pay, userID, payID) {
        this.updateStatusDeal(pay.dealID, "WON")
        const datePay = Date.now();
        const servicePay = content.SERVICES.find(item => item.service === pay.service)
        if (!user.refFlag && user.perentID) {
            this.bctx.User.updateOne({userID}, {refFlag: true}).then();
            const perent = await this.bctx.User.findOne({userID: user.perentID})
            this.bctx.User.updateOne({userID: user.perentID}, {express_ref: perent.express_ref + 1}).then();
            this.bctx.bot.telegram.sendMessage(user.perentID, content.BONUS_SYSTEM)
        }
        this.bctx.deleteMessage(userID, user.messageID)
        this.bctx.Payment.updateOne({ payID }, { status: 'paid' }).then();
        this.bctx.User.updateOne({ userID }, {
                unlimit: (servicePay.service === 'unlimit_1' || servicePay.service === 'unlimit_2') ? true : user.unlimit,
                unlimitMonth: (servicePay.service === 'unlimit_1' || servicePay.service === 'unlimit_2') ? user.unlimitMonth + 1 : user.unlimitMonth,
                express_one: (servicePay.service === 'one_consultation_pay' || servicePay.service === 'full_consultation_pay_limit') ? user.express_one + servicePay.express : user.express_one,
                express_tarif: servicePay.service === 'tarif_1' || servicePay.service === 'tarif_3' ? user.express_tarif + servicePay.express : user.express_tarif,
                full: user.full + servicePay.full,
                months: user.months + servicePay.months,
                datePay: servicePay.service === 'tarif_1' || servicePay.service === 'tarif_3' ? datePay : user.datePay
            }).then();
        if (servicePay.service === 'tarif_1') {
            this.bctx.checkTarif.add({userID, tarif: 1, last: true}, config.delayRedisRT_1)
        }
        if (servicePay.service === 'tarif_3') {
            this.bctx.checkTarif.add({userID, tarif: 3, last: false}, config.delayRedisRT_1)
            this.bctx.checkTarif.add({userID, tarif: 3, last: false}, config.delayRedisRT_2)
            this.bctx.checkTarif.add({userID, tarif: 3, last: true}, config.delayRedisRT_3)
        }
        if (servicePay.service === 'unlimit_1' || servicePay.service === 'unlimit_2') {
            this.bctx.checkTarif.add({userID, tarif: 8, last: false}, config.delayRedisRT_1)
        }


        const text = `Услуга: <b>${servicePay.name}</b> оплачена!\n\nЧтобы перейти к консультации нажмите кнопку ниже`
        let key = tools.getInlineKeyboard(content.goToConsultation)
        if (servicePay.service === 'full_consultation_pay_limit') { key = tools.getInlineKeyboard(content.goToFullConsul(pay.doctorID)) }
        this.bctx.bot.telegram.sendMessage(userID, text, key)
    }
    async createOrder(userID, service, doctorID = null) {
        // this.createCompany()
        const servicePay = content.SERVICES.find(item => item.service === service)
        const payID = tools.makeID(10);
        const transactionID = tools.makeIntID(20);

        new this.bctx.Payment({
            payID, userID, doctorID,
            transactionID,
            amount: servicePay.amount,
            product: servicePay.name,
            service: servicePay.service
        }).save()

        this.createNewDeal(servicePay.title, servicePay.amount, payID)

        let linkPay = `https://www.payanyway.ru/assistant.htm?MNT_ID=${config.numberAccount}&MNT_AMOUNT=${servicePay.amount}&MNT_TRANSACTION_ID=${transactionID}`
        if (config.payTestMode) { linkPay = linkPay + '&MNT_TEST_MODE=1' }
// console.log(linkPay)
        const text = `Оплатите выбранную услугу:\n\n${servicePay.name}\n\n Стоимость: ${servicePay.amount}р.\n\nДля оплаты выставленного счета перейдите по ссылке ниже.\n\nОплатить можно с любой банковской карты VISA, MasterCard или МИР.`;
        const inline = [ [{ text: 'Перейти к оплате', url: linkPay }], [{ text: 'Отменить', callback_data: `cancel pay:${payID}` }]];

        const reply = await this.bctx.bot.telegram.sendMessage(userID, text, tools.getInlineKeyboard(inline))
        this.bctx.User.updateOne({userID}, { messageID: reply.message_id, recommend: true }).then();
    }
    async successOrder(transactionID) {
        const pay = await this.bctx.Payment.findOne({ transactionID })
        if (pay) {
            const userID = pay.userID
            const payID = pay.payID
            const user = await this.bctx.User.findOne({ userID })

            if (userID == pay.userID) { this.addOrder(user, pay, userID, payID);
            } else {
                this.bctx.bot.telegram.sendMessage(userID, `Упс... кажется что-то пошло не так... \n\nОбратитесь за помощью к @${config.adminNick}`)
            }
        }
    }
}

module.exports = bctx => new Payments(bctx)
