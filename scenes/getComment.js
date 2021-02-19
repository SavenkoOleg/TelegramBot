const Scene = require('telegraf/scenes/base');
const tools = require('../tools/tools')
const config = require('../src/config')

module.exports.getScene = function() {

    funComment = ctx => {
        const userID = ctx.update.message.from.id;
        const comment = ctx.session.comment;

        this.createOrder(userID, comment);
        ctx.session = {};
    }

    const getComment = new Scene('getComment');

    getComment.enter((ctx) => {
        ctx.reply('Оцените качество консультации от 1 до 5')
        ctx.session.comment = {
            rate: 0,
            comment: '',
            done: false
        }
    })

    getComment.on('callback_query', (ctx) => {
        ctx.reply('Вы можете ввести комментарий к заказу!', tools.getKeyboard(content.skipKey))
        ctx.session.comment.rate = 0
    })

    getComment.on('text', (ctx) => {
        if (ctx.message.text !== 'Пропустить') {
            ctx.session.comment.comment = ctx.message.text;
        }
        ctx.reply('Блогодарим за отзыв!')
        funComment(ctx);
        ctx.scene.leave();
    })

    return getComment
};
