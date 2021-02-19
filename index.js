const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const Queue = require('bull');
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const config = require('./src/config')
const content = require('./src/content')
const tools = require('./src/tools');

const bot = new Telegraf(config.token)

const checkConsul = new Queue('checkConsul', config.redis)
const checkTarif = new Queue('checkTarif', config.redis)
    // MongoDB connect --------------------------------------------------------
mongoose.connect(config.url_bot, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB connected successfully!'))
    .catch((err) => { console.log(err) })
    // ------------------------------------------------------------------------

async function getRef(userID) {
    const user = await bctx.User.findOne({ userID });
    const text = `Система лояльности!\n\n${user.referals.length ? `У Вас ${user.referals.length} рефералов\n\nБесплатные экспересс-консультации: ${user.express_ref ? user.express_ref : 0}` : 'У Вас пока нет приглашенных'}\n\nВаша ссылка для приглашения: \n${config.linkBot}${user.psevdoID}\n\nПри первой покупке клиента, который пришел по вашей ссылке , вознаграждение - бесплатная экспресс-консультация.`;

    bot.telegram.sendMessage(userID, text);
}
async function addReferal(ctx, psevdoID, referalID) { //psevdoID владелец ссылки
    const user = await bctx.User.findOne({ psevdoID });
    if (user) {
        let referals = user.referals.length > 0 ? user.referals : [];
        const perent = await bctx.User.findOne({ psevdoID });
        saveNewUser(ctx, 'user', perent);
        if (!referals.includes(referalID)) referals.push(referalID);
        await bctx.User.updateOne({ psevdoID }, { referals }).then();
    }
}

async function Statistic(userID, role, mode = false, doctorID = null) {
    let ID = userID
    if(doctorID) ID = doctorID
    const user = await bctx.User.findOne({userID: ID});
    const users = await bctx.User.find();
    const doctors = await bctx.Doctor.find();
    const allPays = await bctx.Payment.find();
    let consul = await bctx.Consultation.find({doctorID: ID})
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const date = new Date(year, month, 1);

    const consulLastMonth = consul.filter( _ => _.dateOrder > date);
    const lastPays = allPays.filter( _ => _.dateCreate > date);

    let expressC = {
        all: 0,
        new: 0,
        fail: 0,
        finish: 0,
        ball: 0,
        ballC: 0
    }
    let expressCLastMonth = {
        all: 0,
        new: 0,
        fail: 0,
        finish: 0,
        ball: 0,
        ballC: 0
    }
    let fullC = {
        all: 0,
        new: 0,
        fail: 0,
        finish: 0,
        ball: 0,
        ballC: 0
    }
    let fullCLastMonth = {
        all: 0,
        new: 0,
        fail: 0,
        finish: 0,
        ball: 0,
        ballC: 0
    }
    let refs = 0
    let unlimit = 0
    consul.forEach(item => {
        if(item.type === 'express') {
            expressC.all++
            expressC.ball += Number(item.rate)
            if(item.status === 'new') expressC.new++
            if(item.status === 'fail') expressC.fail++
            if(item.status === 'finish') expressC.finish++
            if(item.rate > 0) expressC.ballC++
        }
        if(item.type === 'full') {
            fullC.all++
            fullC.ball += Number(item.rate)
            if(item.status === 'new') fullC.new++
            if(item.status === 'fail') fullC.fail++
            if(item.status === 'finish') fullC.finish++
            if(item.rate > 0) fullC.ballC++
        }
    })

    consulLastMonth.forEach(item => {
        if(item.type === 'express') {
            expressCLastMonth.all++
            expressCLastMonth.ball += Number(item.rate)
            if(item.status === 'new') expressCLastMonth.new++
            if(item.status === 'fail') expressCLastMonth.fail++
            if(item.status === 'finish') expressCLastMonth.finish++
            if(item.rate > 0) expressCLastMonth.ballC++
        }
        if(item.type === 'full') {
            fullCLastMonth.all++
            fullCLastMonth.ball += Number(item.rate)
            if(item.status === 'new') fullCLastMonth.new++
            if(item.status === 'fail') fullCLastMonth.fail++
            if(item.status === 'finish') fullCLastMonth.finish++
            if(item.rate > 0) fullCLastMonth.ballC++
        }
    })

    users.forEach(user => {
        if(user.unlimit) unlimit++
        refs = refs + user.referals.length
    })

    let payStat = {
        all: 0,
        canceled: 0,
        paid: 0
    }

    let lastPayStat = {
        all: 0,
        canceled: 0,
        paid: 0
    }

    allPays.forEach(item => {
        if(item.status === 'paid') payStat.paid++
        if(item.status === 'canceled') payStat.canceled++
        payStat.all++
    })


    lastPays.forEach(item => {
        if(item.status === 'paid') lastPayStat.paid++
        if(item.status === 'canceled') lastPayStat.canceled++
        lastPayStat.all++
    })

    let paySum = 0
    let lastPaySum = 0
    allPays.map(item => { if (item.status === 'paid') paySum += item.amount })
    lastPays.map(item => { if (item.status === 'paid') lastPaySum += item.amount })

    let text = '<b>Статистика:</b>\n\n'
    if (user) {
    if (mode) text = text  + `Имя: ${user.first_name ? user.first_name : ''} ${user.last_name ? user.last_name : ''}\nНикнейм: ${user.username ? '@' + user.username : '<i>не указан</i>'}\n\n`
    if (role === 'doctor') text = text + `(за после. мес. / всего)

<b>Всего консультаций</b>: ${consulLastMonth.length} / ${consul.length}

<b>Экспресс-консультации</b>: ${expressCLastMonth.all} / ${expressC.all}
Новые: ${expressCLastMonth.new} / ${expressC.new}
Завершенные: ${expressCLastMonth.finish} / ${expressC.finish}
Просроченные: ${expressCLastMonth.fail} / ${expressC.fail}
Сред. балл: ${tools.rounded(expressCLastMonth.ball/expressCLastMonth.ballC)} / ${tools.rounded(expressC.ball/expressC.ballC)}

<b>Полные консультации</b>: ${fullCLastMonth.all} / ${fullC.all}
Новые: ${fullCLastMonth.new} / ${fullC.new}
Завершенные: ${fullCLastMonth.new} / ${fullC.new}
Просроченные: ${fullCLastMonth.fail} / ${fullC.fail}
Сред. балл: ${tools.rounded(fullCLastMonth.ball/fullCLastMonth.ballC)} / ${tools.rounded(fullC.ball/fullC.ballC)}`
    } else {
        text = 'Упс... по какой-то причине этот пользователь не зарегистрирован в боте! В любом случае, пользователю необхожимо зайти в бот или ввести команду /start еще раз.'
    }
    if (role === 'admin') {
        text = '<b>Статистика:</b>\n(за после. мес. / всего)\n\n'
        text = text + `<b>Всего пользователей:</b> ${users.length}
    <b>Из них приглашенные:</b> ${refs}
    <b>Всего врачей:</b> ${doctors.length}
    <b>Всего заявок:</b> ${lastPayStat.all} / ${payStat.all}
    <b>Оплачено:</b> ${lastPayStat.paid} / ${payStat.paid}
    <b>Отменено:</b> ${lastPayStat.canceled} / ${payStat.canceled}
    \n<b>Безлимитные пакеты:</b> ${unlimit}
    <b>Оплачено на сумму:</b> ${lastPaySum} / ${paySum}р.`;
    }
    bot.telegram.sendMessage(userID, text, tools.getInlineKeyboard(content.generalMenu))
}
async function openDoctors(ctx, userID, spec, step = 'start') {
    try {
        let doctor;
        let index = 0;
        let inline = [];
        let flagLeft = false;
        let flagRight = false;

        const doctors = await bctx.Doctor.find({ spec });

        if (step == 'start') { ctx.session.carousel = { index: 0 }; }
        if (!ctx.session.carousel) { ctx.session.carousel = { index: 0 }; }
        if (step == 'next') {
            if (ctx.session.carousel.index < doctors.length - 1) { index = ctx.session.carousel.index + 1;
            } else {
                index = doctors.length - 1;
                flagRight = true;
            }
        }
        if (step == 'prev') {
            if (ctx.session.carousel.index > 0) { index = ctx.session.carousel.index - 1;
            } else {
                index = 0;
                flagLeft = true;
            }
        }

        ctx.session.carousel.index = index
        doctor = doctors[index];

        if (doctor) {
            let text = doctor.description
            if (doctors.length > 1) { text = 'В этой специализации доступно несколько врачей.\nИспользуйте кнопки "назад" и "вперед" для перелистывания\n\n' + doctor.description }
            if (doctors.length > 1) { inline.push([{ text: 'назад', callback_data: `prev:${spec}`, hide: flagLeft }, { text: 'вперед', callback_data: `next:${spec}`, hide: flagRight }]); };
            inline = content.getDoctorsInline(inline, doctor);
            let extra = tools.getInlineKeyboard(inline, text);
            if (doctor.photo.length) { bot.telegram.sendPhoto(userID, doctor.photo, extra) }
            else { bot.telegram.sendMessage(userID, text, extra) }
        } else {
            let reply = await ctx.reply('В этой категории нет врачей');
            setTimeout(() => {
                bctx.templateMSG(ctx, 'get consultation');
                bctx.deleteMessage(userID, reply.message_id);
            }, config.timeDelMSG);
        }
    } catch (e) { console.log(e) }
}

// CallbackQuery Menu -----------------------------------------------------
async function callbackQueryAdmin(ctx) {
    try {
        const _content = ctx.update.callback_query;
        const { message } = _content;
        const userID = message.chat.id;

        const action = _content.data.split(':')[0];
        const objectID = _content.data.split(':')[1];
        const object2ID = _content.data.split(':')[2];

        switch (action) {
            case 'finish full consul':
                bot.telegram.sendMessage(objectID, 'Консультация завершена!\n\nПожалуйста, оцените качество консультации от 1 до 5', tools.getInlineKeyboard(content.getRateInline))
                break
            case 'send link':
                ctx.session.userID = objectID;
                ctx.scene.enter('sendLink');
                break
            case 'relocationGo':
                relocationGo(ctx, objectID, object2ID)
                break
            case 'relocation':
                let text = ctx.update.callback_query.message.text
                const messageID = ctx.update.callback_query.message.message_id
                const inlineMessageID = ctx.update.callback_query.id

                user = bctx.User.findOne({userID})
                text += '\n\nЗаявку обработал:\n' + tools.fromUser(ctx)

                bot.telegram.editMessageText(config.chatID, messageID, inlineMessageID, text, config.parseMode)
                relocation(ctx, objectID)
                break
            case 'full start dialog':
                ctx.session.userID = objectID
                ctx.scene.enter('sendMessageFull');
                break
            case 'finish full consul':
                user = await bctx.User.findOne({userID: objectID})
                if (user && user.consultationID) { await bctx.Consultation.updateOne({consultationID: user.consultationID}, {status: 'finish'}).then(); }
                writeOffServices(objectID, 'full');
                bot.telegram.sendMessage(objectID, 'Консультация завершена!\n\nПожалуйста, оцените качество консультации от 1 до 5', tools.getInlineKeyboard(content.getRateInline))
                break
            case 'recommend':
                pay.createOrder(objectID, 'full_consultation_pay_limit', userID)
                break
            case 'stop dialog':
                let doctorID = objectID
                if (ctx.session['doctorID']) doctorID = ctx.session.doctorID
                user = await bctx.User.findOne({userID})
                writeOffServices(userID, 'express');
                bctx.Consultation.updateOne({consultationID: user.consultationID}, {status: 'finish'}).then();
                bot.telegram.sendMessage(doctorID, 'Консультация завершена!', tools.getKeyboard(content.adminKeyboard))
                bot.telegram.sendMessage(userID, 'Консультация завершена!\n\nПожалуйста, оцените качество консультации от 1 до 5', tools.getInlineKeyboard(content.getRateInline))
                break
            case 'start dialog':
                ctx.session.userID = objectID
                ctx.scene.enter('sendMessageEx');
                break
            case 'statSpecialist':
                const doctor = await bctx.Doctor.findOne({doctorID: objectID})
                Statistic(userID, 'doctor', true, doctor.userID);
                break
            case 'deleteSpecialist':
                deleteSpecialist(objectID);
                getSpecialist(userID, 'basic' ,true);
                break
            case 'specialist':
                bot.telegram.sendMessage(userID, content.DEL_SPEC, tools.getInlineKeyboard(content.delSpecialistInline(objectID)));
                break
            case 'add_specialist':
                ctx.scene.enter('newDoctor');
                break
            case 'exit':
                bctx.templateMSG(ctx, 'admin');
                break
        }
    } catch (e) { console.log(e) }
}
const _callbackQueryUser = async function callbackQueryUser(ctx) {
    try {
        // bot.telegram.answerCbQuery(content.id, `Продукт добавлен в корзину`);
        const _content = ctx.update.callback_query;
        const { message } = _content;
        const userID = message.chat.id;

        const action = _content.data.split(':')[0];
        const objectID = _content.data.split(':')[1];
        const object2ID = _content.data.split(':')[2];
        let reply = {}
        let user = {}
        let doctor = {}
        let msg = 'user msg';

        switch (action) {
            case 'specialition_user':
                openDoctors(ctx, userID, Number(objectID))
                break
            case 'go_to_consultation':
                bctx.templateMSG(ctx, 'get consultation');
                break
            case 'go tarif':
                getPaymentInfo(userID);
                break
            case 'cancel pay':
                doctor = await bctx.Doctor.findOne({userID})
                const _pay = await bctx.Payment.findOne({payID: objectID})
                if (doctor) msg = 'doctor'
                bctx.templateMSG(ctx, msg);
                bctx.Payment.updateOne({payID: objectID}, {status: 'canceled'}).then();
                pay.updateStatusDeal(_pay.dealID, "LOSE");
                break
            case 'agreement':
                bctx.templateMSG(ctx, 'start user msg');
                break
            case 'finish full consul':
                user = await bctx.User.findOne({userID: objectID})
                try { if (config.delMsgFlag) bctx.deleteMessage(objectID, user.messageID);}
                catch (e) {}
                if (user && user.consultationID) { await bctx.Consultation.updateOne({consultationID: user.consultationID}, {status: 'finish'}).then(); }
                bctx.writeOffServices(objectID, 'full');
                bot.telegram.sendMessage(objectID, 'Консультация завершена!\n\nПожалуйста, оцените качество консультации от 1 до 5', tools.getInlineKeyboard(content.getRateInline))
                break
            case 'send link':
                ctx.session.userID = objectID;
                ctx.scene.enter('sendLink');
                break
            case 'relocationGo':
                relocationGo(ctx, objectID, object2ID)
                break
            case 'relocation':
                let text = ctx.update.callback_query.message.text
                const messageID = ctx.update.callback_query.message.message_id
                const inlineMessageID = ctx.update.callback_query.id

                user = bctx.User.findOne({userID})
                text += '\n\nЗаявку обработал:\n' + tools.fromUser(ctx)

                bot.telegram.editMessageText(config.chatID, messageID, inlineMessageID, text, config.parseMode)
                relocation(ctx, objectID)
                break
            case 'rate':
                user = await bctx.User.findOne({userID})
                if (user && user.consultationID) {
                    await bctx.Consultation.updateOne({consultationID: user.consultationID}, {rate: objectID}).then();
                    await bctx.User.updateOne({userID}, {consultationID: ''}).then();
                }
                reply = await ctx.reply('Благодарим за ответ!');
                setTimeout(() => bctx.deleteMessage(userID, reply.message_id), config.timeDelMSG);
                break
            case 'full_consultation_pay':
                pay.createOrder(userID, action)
                break
            case 'one_consultation_pay':
                pay.createOrder(userID, action)
                break
            case 'full start dialog':
                doctor = await bctx.Doctor.findOne({ userID: tools.getID(ctx) })
                bctx.User.updateOne({ userID: tools.getID(ctx) }, { sceneFlag: !doctor }).then()
                ctx.session.userID = objectID
                ctx.scene.enter('sendMessageFull');
                break
            case 'recommend':
                pay.createOrder(objectID, 'full_consultation_pay_limit', userID)
                break
            case 'stop dialog':
                let doctorID = objectID
                if (ctx.session['doctorID']) doctorID = ctx.session.doctorID
                user = await bctx.User.findOne({userID})
                writeOffServices(userID, 'express');
                bctx.Consultation.updateOne({consultationID: user.consultationID}, {status: 'finish'}).then();
                let key = content.doctorKeyboard
                if (config.adminIDs.includes(Number(doctorID))) key = content.adminKeyboard
                bot.telegram.sendMessage(doctorID, 'Консультация завершена!', tools.getKeyboard(key))
                bot.telegram.sendMessage(userID, 'Консультация завершена!\n\nПожалуйста, оцените качество консультации от 1 до 5', tools.getInlineKeyboard(content.getRateInline))
                break
            case 'start dialog':
                ctx.session.userID = objectID
                ctx.scene.enter('sendMessageEx');
                break
            case 'unknown':
                user = await bctx.User.findOne({userID});

                if (user && user.unlimit) {
                    ctx.scene.enter('getMessageModer');
                } else if (user && (!!user.express_one || !!user.express_ref || !!user.express_tarif)) {
                    ctx.scene.enter('getMessageModer');
                } else {
                    bot.telegram.sendMessage(userID, content.NOT_EXPRESS_CONSUL, tools.getInlineKeyboard(content.getGoTarifInline))
                }
                break
            case 'tarif_1':
                pay.createOrder(userID, action)
                break
            case 'tarif_3':
                pay.createOrder(userID, action)
                break
            case `one consultation`:
                bot.telegram.sendMessage(userID, content.TYPE_CONSUL, tools.getInlineKeyboard( content.typeConsultation ));
                break
            case 'back-consul':
                bctx.templateMSG(ctx, 'get consultation');
                break
            case 'full-consul':
                user = await bctx.User.findOne({userID});
                if (user && user.full) {
                    const consultationID = tools.makeID(5);
                    bctx.Consultation({
                        type: 'full',
                        consultationID,
                        doctorID: objectID,
                        clientID: tools.getID(ctx),
                        status: 'new',
                        rate: 0,
                    }).save()
                    checkConsul.add({consultationID}, config.delayRedis)
                    bctx.User.updateOne({userID: tools.getID(ctx)}, {consultationID}).then();
                    bot.telegram.sendMessage(objectID,
                        content.REQUEST_FULL_CONSUL_1 + tools.fromUser(ctx) + content.REQUEST_FULL_CONSUL_2,
                        tools.getInlineKeyboard(content.answerDialogFull(tools.getID(ctx))));

                    ctx.reply(content.FULL_CONSUL_TEXT);
                } else {
                    bot.telegram.sendMessage(userID, content.NOT_FULL_CONSUL, tools.getInlineKeyboard(content.getGoTarifInline))
                }
                break
            case 'express-consul':
                user = await bctx.User.findOne({userID});
                if (user && user.unlimit) {
                    ctx.session.doctorID = objectID
                    ctx.scene.enter('getMessage');
                } else if (user && (!!user.express_one || !!user.express_ref || !!user.express_tarif)) {
                    ctx.session.doctorID = objectID
                    ctx.scene.enter('getMessage');
                } else {
                    bot.telegram.sendMessage(userID, content.NOT_EXPRESS_CONSUL, tools.getInlineKeyboard(content.getGoTarifInline))
                }
                break
            case 'prev':
                openDoctors(ctx, userID, objectID, action)
                break
            case 'next':
                openDoctors(ctx, userID, objectID, action)
                break
            case `adult`:
                getSpec(userID, action)
                // openDoctors(ctx, userID, action)
                break
            case `childish`:
                getSpec(userID, action)
                // openDoctors(ctx, userID, action)
                break
            case `unlimited tariffs`:
                getTariffs(userID)
                break
            case `consultation`:
                getSpecialist(userID, 'unknown')
                break
            case `express-consultation`:
                getSpecialist(userID, 'basic')
                break
            case 'exit':
                doctor = await bctx.Doctor.findOne({userID})
                if (doctor) msg = 'doctor'
                bctx.templateMSG(ctx, msg);
                break
            case 'cancel':
                bctx.templateMSG(ctx, 'user msg');
                break
        }
    } catch (e) { console.log(e) }
}

// Text Menu --------------------------------------------------------------
const _userMenu =  async function userMenu(ctx) {
    try {
        const userID = ctx.message.chat.id;
        switch (ctx.message.text) {
            case content.CLIENT_INSTRUCTION:
                bot.telegram.sendVideo(userID, content.CLIENT_INSTRUCTION_VIDEO, tools.getInlineKeyboard(content.generalMenu))
                break
            case content.DOCTOR_INSTRUCTION:
                bot.telegram.sendVideo(userID, content.DOCTOR_INSTRUCTION_VIDEO, tools.getInlineKeyboard(content.generalMenu))
                break
            case content.FINISH_CONSUL_FULL:
                finishConsulFull(ctx, userID)
                break
            case content.SEND_MESSAGE:
                let doctor = await bctx.Doctor.findOne({userID})
                let msg = 'user msg';
                if (doctor) msg = 'doctor'
                bctx.templateMSG(ctx, msg);
                break
            case content.DOCTOR_STATISTIC:
                Statistic(userID, 'doctor')
                break
            case content.TARIF_KEY:
                getPaymentInfo(userID);
                break
            case content.GET_CONSULTATION_KEY:
                bctx.templateMSG(ctx, 'get consultation');
                break
            case content.REFERAL_SYSTEM_KEY:
                getRef(userID);
                break
            case content.CALLBACK_KEY:
                bctx.templateMSG(ctx, 'callback');
                break
            case content.SKIP_KEY:
                bctx.templateMSG(ctx, 'user msg');
                break
            default:
                bctx.templateMSG(ctx, 'error');
        }
    } catch (e) { console.log(e) }
}
async function adminMenu(ctx) {
    try {
        const userID = ctx.message.chat.id;
        switch (ctx.message.text) {
            case content.UNLIMIT:
                ctx.scene.enter('newUnlimit');
                break
            case content.FINISH_CONSUL_FULL:
                finishConsulFull(ctx, userID)
                break
            case content.SPECIALISTS_KEY:
                getSpecialist(userID, 'basic' ,true)
                break
            case content.SPECIALIZATION_KEY:
                getSpecialist(userID, 'basic', true)
                break
            case content.CONTROL_CONTENT_KEY:
                bctx.templateMSG(ctx, 'control content');
                break
            case content.SKIP_KEY:
                bctx.templateMSG(ctx, 'admin');
                break
            case content.CANCEL_KEY:
                bctx.templateMSG(ctx, 'admin');
                break
            case content.STATISTIC_KEY:
                Statistic(userID, 'admin')
                break
            case content.MAILING_KEY:
                ctx.scene.enter('newMailing');
                break
            case content.BACK_KEY:
                bctx.templateMSG(ctx, 'admin');
                break
            default:
                bctx.templateMSG(ctx, 'error');
        }
    } catch (e) { console.log(e) }
}
// ------------------------------------------------------------------------

const bctx = require('./modules/Context')(bot, checkConsul, checkTarif, _userMenu, _callbackQueryUser)
const pay = require('./modules/Payments')(bctx)

app = express()
app.use(require('morgan')('dev')) //журнал запросов
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/payment', function (req, res) {
    pay.successOrder(Number(req.query.MNT_TRANSACTION_ID))
    res.send('success')
})
app.listen(80)

const newUnlimit = require('./scenes/newUnlimit').getScene.call(pay)
const newDoctor = require('./scenes/newDoctor').getScene.call(bctx)
const getMessageModer = require('./scenes/getMessageModer').getScene.call(bctx)
const newMailing = require('./scenes/newMailing').getScene.call(bctx)
const getMessage = require('./scenes/getMessage').getScene.call(bctx)
const sendMessageEx = require('./scenes/sendMessage').getScene.call(pay)
const sendLink = require('./scenes/sendLink').getScene.call(bctx)
const sendMessageFull = require('./scenes/sendMessageFull').getScene.call(pay)

async function saveNewUser(ctx, role, perent = null) {
    const user = ctx.message.chat;
    let usr = await bctx.User.findOne({ userID: user.id });
    if (!usr) {
        // if (role = 'user') bctx.templateMSG(ctx, 'new user');
        await new bctx.User({
            psevdoID: tools.makeID(8),
            role,
            first_name: user.first_name ? user.first_name : '',
            last_name: user.last_name ? user.last_name : '',
            userID: user.id,
            referals: [],
            perentID: perent ? perent.userID : null,
            username: user.username ? user.username : '',
            language_code: user.language_code ? user.language_code : ''
        }).save()
    }
}
async function getSpecialist(userID, mode = 'basic' ,admin = false) {
    let spec = await bctx.Doctor.find()
    let specialists = [];
    if (spec) {
        spec.forEach(item => {
            specialists.push({ specialistID: item.doctorID, name: item.first_name ? item.first_name : '' + ' ' + item.last_name ? item.last_name : '' })
        })
    }

    let inline = [];
    let key = [];
    let i = 0;
    const count = specialists.length;

    specialists.map((item, index) => {

        if (!(index % 2)) {
            key.push({ text: item.name, callback_data: `specialist:${item.specialistID}` });
            i++;
        }
        if (!!(index % 2)) {
            key.push({ text: item.name, callback_data: `specialist:${item.specialistID}` });
            i++;
        }

        if (i == 2 && index < count - 1) {
            inline.push(key);
            i = 0;
            key = [];
        }
        if (i == 1 && index == count - 1) {
            inline.push(key);
            i = 0;
            key = [];
        }

    });

    if(key.length != 0) inline.push(key);

    if (mode === 'unknown') { inline.push([{ text: 'Не знаю кто нужен', callback_data: `specialist_unknown` }]) };
    if (admin) { inline.push([{ text: 'Добавить', callback_data: `add_specialist` }]) };
    inline.push([{ text: 'Основное меню', callback_data: `exit` }]);
    let text = content.LIST_SPECIALIZATION_USER;
    if (admin) { text = content.LIST_SPECIALIZATION_ADMIN };
    await bot.telegram.sendMessage(userID, text, tools.getInlineKeyboard(inline));
}
async function getPaymentInfo(userID) {
    const user = await bctx.User.findOne({userID});

    if (user){
        let textData = '\nУ Вас нет оплаченного абонемента'
        if(user && user.datePay && user.months) {
            const differenceDate = Date.now() - user.datePay;
            const days = Math.round(differenceDate / 1000 / 60 / 60 / 24)
            const months = Math.round(days / 30)
            let m = 0;
            let d = 0;
            if (user.months > 1) {
                m = user.months - 1 - months
                d = 30 - (days - months * 30)
            } else { d = 30 - (days - months * 30) }
            textData = '\nОплаченный Вами абонемент действует еще: '
            textData += m ? `${m} месяц(ев), ` : ''
            textData += d ? `${d} день(дней)` : ''
        }

        let text = ``
        if  (!user.unlimit) {
            text += textData;
            if (!user.express_one && !user.express_ref && !user.express_tarif && !user.full) { text += 'Оплаченных услуг нет' }
            else { text += `\nВсего экспресс-консультаций: <b>${user.express_one + user.express_ref + user.express_tarif}</b>\n` }
            if (user.express_one) { text += `\nОплаченные экспресс-консультации: <b>${user.express_one}</b>\n<i>(единоразовая оплата)</i>\n` }
            if (user.express_ref) { text += `\nБесплатные экспресс-консультации: <b>${user.express_ref}</b>\n<i>(по системе лояльности)</i>\n` }
            if (user.express_tarif) { text += `\nОплаченные экспресс-консультации: <b>${user.express_tarif}</b>\n<i>(по абонементу)</i>\n` }
        } else {
            text += 'Вы оплатили безлимитный пакет консультаций\n'
        }

        if (user.full) { text += `\nОплаченные персональные консультации: <b>${user.full}</b>\n<i>(единоразовая оплата)</i>\n` }

        text += '\n\nЧтобы оплатить необходимые услуги, воспользуйтесь кнопками ниже'
        bot.telegram.sendMessage(userID, text, tools.getInlineKeyboard(content.paymentConsultation(user.months || user.unlimit)));
    }

}
async function getTariffs(userID) {
    bot.telegram.sendMessage(userID, content.TARIFFS, tools.getInlineKeyboard( content.tariffConsultation ));
}
async function deleteSpecialist(doctorID) {
    await bctx.Doctor.find({doctorID}).remove()
}
async function checkLink(ID) {
    const checkUser = await bctx.User.findOne({psevdoID: ID})
    const checkPayment = await bctx.Payment.findOne({payID: ID})
    return !!checkUser || !!checkPayment
}
async function relocationGo(ctx, doctorID, clientID) {
    const client = await bctx.User.findOne({userID: clientID});
    const doctor = await bctx.Doctor.findOne({doctorID});
    if (client && doctor) {
        bctx.Consultation.updateOne({ consultationID: client.consultationID }, {doctorID: doctor.userID}).then();
        const messages = client['messages'];
        if (messages) {
            const messageWithClient = `<b>Экспресс-консультация</b>\n\nВопрос от\n${tools.fromUser(ctx)}\n\nНачало сообщения`
            bot.telegram.sendMessage(doctor.userID, messageWithClient, config.parseMode)

            for (const msg of messages) {
                await tools.delay(1000);
                await bot.telegram.sendCopy(doctor.userID, msg)
            }

            bot.telegram.sendMessage(doctor.userID, `Конец сообщения\n\nСообщение от\nИмя: ${client.first_name ? client.first_name : ''} ${client.last_name ? client.last_name : ''}\nНикнейм: ${client.username ? '@' + client.username : '<i>не указан</i>'}`, tools.getExtraInline(content.answerDialog(clientID)))
        }
    }
}
async function relocation(ctx, userID) {
    let spec = await bctx.Doctor.find();
    let specialists = [];
    if (spec) {
        spec.forEach(item => {
            specialists.push({ specialistID: item.doctorID, name: item.first_name ? item.first_name : '' + ' ' + item.last_name ? item.last_name : '' })
        })
    }

    let inline = [];
    let key = [];
    let i = 0;
    const count = specialists.length;

    specialists.map((item, index) => {

        if (!(index % 2)) {
            key.push({ text: item.name, callback_data: `relocationGo:${item.specialistID}:${userID}` });
            i++;
        }
        if (!!(index % 2)) {
            key.push({ text: item.name, callback_data: `relocationGo:${item.specialistID}:${userID}` });
            i++;
        }

        if (i == 2 && index < count - 1) {
            inline.push(key);
            i = 0;
            key = [];
        }
        if (i == 1 && index == count - 1) {
            inline.push(key);
            i = 0;
            key = [];
        }

    });

    if(key.length != 0) inline.push(key);
    const user = await bctx.User.findOne({userID});
    let text = `Сообщение от\n\nИмя: ${user.first_name ? user.first_name : ''} ${user.last_name ? user.last_name : ''}\nНикнейм: ${user.username ? '@' + user.username : '<i>не указан</i>'}\n\nКому переадресовать?`;
    await bot.telegram.sendMessage(tools.getID(ctx), text, tools.getInlineKeyboard(inline));
}
async function getSpec(userID, profile) {
    const doctors = await bctx.Doctor.find({profile: profile});
    let spec = []
    doctors.forEach(item => spec.push(item.spec))
    let specUnic = Array.from(new Set(spec))

    let specialists = [];

    specUnic.forEach(spec => {
        content.listSpec.forEach(item => {
            if(item.id === Number(spec)) specialists.push(item)
        })
    })

    let inline = [];
    let key = [];
    let i = 0;
    const count = specialists.length;

    specialists.map((item, index) => {

        if (!(index % 2)) {
            key.push({ text: item.name, callback_data: `specialition_user:${item.id}` });
            i++;
        }
        if (!!(index % 2)) {
            key.push({ text: item.name, callback_data: `specialition_user:${item.id}` });
            i++;
        }

        if (i == 2 && index < count - 1) {
            inline.push(key);
            i = 0;
            key = [];
        }
        if (i == 1 && index == count - 1) {
            inline.push(key);
            i = 0;
            key = [];
        }

    });

    if(key.length != 0) inline.push(key);
    inline.push([{ text: 'Не знаю кто нужен!', url: config.linkChat }])
    inline.push([{ text: 'Основное меню', callback_data: `exit` }]);
    bot.telegram.sendMessage(userID, content.GET_SPECIALITION_TEXT_USER, tools.getInlineKeyboard(inline));
}

bot.use(session());
const stage = new Stage([newDoctor, getMessage, newMailing, getMessageModer, sendMessageEx, sendMessageFull, sendLink, newUnlimit], { ttl: 1000 * 60 * 60 * 5 });
bot.use(stage.middleware());


bot.start(async ctx => {
    ctx.session = {};
    const { message, from: { id: userID } } = ctx;
    const doctor = await bctx.Doctor.findOne({userID})
    if (config.adminIDs.includes(userID)) {
        if (config.deployMode) { saveNewUser(ctx, 'root') };
        bctx.templateMSG(ctx, 'admin start');
    } else if (doctor) {
        saveNewUser(ctx, 'user');
        bctx.templateMSG(ctx, 'doctor');
    } else { //User
            const text = message.text;
            if (text.length > 6) { //Вход по ссылке
                const refLink = text.slice(7, text.length).split('_');
                const psevdoID = refLink[0];
                // Проверка ссылки!!!
                if( await checkLink(psevdoID)) {
                    // Подтверждение оплаты
                    // if (psevdoID.length == 10) { pay.successOrder(userID, psevdoID) }

                    // Рефералка
                    if (psevdoID.length == 8) {
                        addReferal(ctx, psevdoID, userID);
                        bot.telegram.sendMessage(userID, content.AGREEMENT, tools.getInlineKeyboard(content.getAgreementInline))
                    }
                } else {
                    bctx.templateMSG(ctx, 'link error');
                }

            } else {
                const user = await bctx.User.findOne({userID})
                if (!user) {
                    saveNewUser(ctx, 'user');
                    bot.telegram.sendMessage(userID, content.AGREEMENT, tools.getInlineKeyboard(content.getAgreementInline))
                } else { bctx.templateMSG(ctx, 'user msg'); }

            }
    }
});
bot.on('callback_query', ctx => {
    const content = ctx.update.callback_query;

    const { message } = content;
    const action = content.data.split(':')[0];
    const userID = message.chat.id;
    const messageID = message.message_id;

    let flag = true

    if (config.adminIDs.includes(content.from.id)) { callbackQueryAdmin(ctx) }
    else { _callbackQueryUser(ctx) }
    if (action === 'relocation' || action === 'recommend') flag = false
    if (config.delMsgFlag && flag) bctx.deleteMessage(userID, messageID);
});
bot.on('text', async ctx => {
    const { message } = ctx;
    // const users = await User.find()
    // users.forEach(item => console.log(item))
    // console.log(message)
    // if (message.text == '/test') { ctx.scene.enter('getMessage'); }
    if (message.chat.id == message.from.id) {
        if (config.adminIDs.includes(message.from.id)) { adminMenu(ctx) } 
        else { _userMenu(ctx) }
    }
});

bot.startPolling();

checkConsul.process(async function(job, done) {
    try {
        const consultationID = job.data.consultationID;
        const consul = await bctx.Consultation.findOne({consultationID})
        if(consul && consul.status === 'new') {
            bctx.Consultation.updateOne({consultationID}, {status: 'fail'}).then();
        }
        done();
    } catch (e) { console.log(e) }
});
checkTarif.process(async function(job, done) {
    try {
        const data = job.data
        if (data.tarif !== 8) {
            let edit = { express_tarif: 4 }
            if (data.last) { edit = { express_tarif: 0, months: 0 } }
            bctx.User.updateOne({userID: data.userID}, edit).then()
        } else {
            const user = await bctx.User.findOne({userID: data.userID})
            if (user && user.unlimitMonth) {
                bctx.User.updateOne({userID: data.userID}, { unlimitMonth: user.unlimitMonth - 1 }).then()
                if (user.unlimitMonth - 1) { bctx.checkTarif.add({userID: data.userID, tarif: 8, last: false}, config.delayRedisRT_1) }
                else { bctx.User.updateOne({userID: data.userID}, { unlimit: false }).then() }
            }
        }

        done();
    } catch (e) { console.log(e) }
});