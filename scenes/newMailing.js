const Scene = require('telegraf/scenes/base')
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {
    async function delay(ms) {
        return new Promise((resolve, reject) => { setTimeout(() => { resolve() }, ms) })
    }

    newMailingSend = async ctx => {
        const mailing = ctx.session.newMailing;
        const target = ctx.session.newMailing.target;
        let listID = []

        if (ctx.session.newMailing.target == 'all') {
            let users = await this.User.find({ role: 'user' });
            let doctors = await this.User.find({ role: 'doctor' });
            listID = users.concat(doctors);
        } else { listID = await this.User.find({ role: target }); }

        listID = listID.reduce((acc, item) => {
            acc.push(item.userID)
            return acc
        }, [])

        const listIDUnic = Array.from(new Set(listID))

        for (const userID of listIDUnic) {
            await delay(10);
            await this.bot.telegram.sendMessage(userID, mailing.content);
        }

        ctx.session = {};
    }

    const newMailing = new Scene('newMailing')

    newMailing.enter(ctx => {
        this.bot.telegram.sendMessage(ctx.message.chat.id, 'Кому предназначена рассылка?', tools.getInlineKeyboard(content.targetMailing))
        ctx.session.newMailing = {
            mailingID: tools.makeID(5),
            content: '',
            target: '',
            done: false
        }
        ctx.session.steps = 0
    })

    newMailing.on('text', async ctx => {
        if (ctx.message.text !== 'Отмена') {
            if (ctx.session.steps == 0) {
                await ctx.reply(ctx.message.text);
                const userID = ctx.message.from.id;
                let target = 'Все пользователи';
                if (ctx.session.newMailing.target == 'user') target = 'Клиенты'
                if (ctx.session.newMailing.target == 'doctor') target = 'Врачи'
                this.bot.telegram.sendMessage(userID, `Рассылка готова!\n\nЦелевая аудитория: ${target}`, tools.getKeyboard([
                    ['Отправить'],
                    ['Отмена']
                ]));

                ctx.session.newMailing.content = ctx.message.text;
                ctx.session.steps = 1;
            }

            if (ctx.session.steps == 1 && ctx.message.text == 'Отправить') {
                ctx.session.newMailing.done = true;
                ctx.scene.leave();
            }

        } else { ctx.scene.leave() }
    })

    newMailing.on('callback_query', async ctx => {
        const _content = ctx.update.callback_query;
        const { message } = _content;
        const userID = message.chat.id;
        const messageID = message.message_id;
        if (config.delMsgFlag) this.deleteMessage(userID, messageID);
        if (ctx.update.callback_query.data !== 'exit') {
            ctx.reply('Введите текст для рассылки', tools.getKeyboard(content.cancelKey))
            ctx.session.newMailing.target = ctx.update.callback_query.data
            ctx.session.steps = 0
        } else {
            ctx.scene.leave();
        }
    })

    newMailing.leave(async(ctx) => {
        if (ctx.session.newMailing.done) {
            const userID = ctx.update.message.chat.id;
            const reply = await ctx.reply('Рассылка отправлена');
            setTimeout(() => this.deleteMessage(userID, reply.message_id), config.timeDelMSG);
            newMailingSend(ctx);
        }
        this.templateMSG(ctx, 'admin');
    })

    return newMailing
};