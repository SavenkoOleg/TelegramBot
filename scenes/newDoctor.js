const Scene = require('telegraf/scenes/base')
const tools = require('../src/tools')
const config = require('../src/config')
const content = require('../src/content')

module.exports.getScene = function() {
    const newDoctor = new Scene('newDoctor')

    getSpec = async  (userID) => {
        const specialists = content.listSpec;

        let inline = [];
        let key = [];
        let i = 0;
        const count = specialists.length;

        specialists.map((item, index) => {

            if (!(index % 2)) {
                key.push({ text: item.name, callback_data: `specialition:${item.id}` });
                i++;
            }
            if (!!(index % 2)) {
                key.push({ text: item.name, callback_data: `specialition:${item.id}` });
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

        this.bot.telegram.sendMessage(userID, content.GET_SPECIALITION_TEXT, tools.getInlineKeyboard(inline));
    }

    newDoctorSave = async ctx => {
        let session = ctx.session;
        const userID = ctx.update.message.chat.id;
        const doctor = await this.Doctor.findOne({userID: session.newDoctor.userID})
        if (!doctor) {
            new this.Doctor({
                doctorID: tools.makeID(5),
                link_desc: session.newDoctor.link_desc,
                description: session.newDoctor.description,
                photo: session.newDoctor.photo,
                userID: session.newDoctor.userID,
                spec: Number(session.newDoctor.spec),
                profile: session.newDoctor.profile === 'combines' ? [ `childish`, `adult` ] : [ session.newDoctor.profile ],
                username: session.newDoctor.username,
                first_name: session.newDoctor.first_name,
                last_name: session.newDoctor.last_name,
            }).save();

            this.User.updateOne({ userID: session.newDoctor.userID }, {role: 'doctor'}).then();

            this.bot.telegram.sendMessage(session.newDoctor.userID, 'Вас добавили как врача!', tools.getKeyboard(content.doctorKeyboard) )
            setTimeout(() => ctx.session = {}, config.timeDelMSG);

            const reply = await ctx.reply('Врач добавлен!');
            setTimeout(() => this.deleteMessage(userID, reply.message_id), config.timeDelMSG);
        } else {
            const reply = await ctx.reply('Этот врач уже был добавлен ранее!');
            setTimeout(() => this.deleteMessage(userID, reply.message_id), config.timeDelMSG);
        }
    }

    newDoctor.enter((ctx) => {
        ctx.reply('Какого специалиста Вы хотите добавить?', tools.getInlineKeyboard(content.getSpecializationInline(false)))
        ctx.session.newDoctor = {
            link_desc: '',
            description: '',
            photo: '',
            profile: '',
            spec: '',
            username: '',
            first_name: '',
            last_name: '',
            userID: 0
        }
        ctx.session.steps = 0
    })

    newDoctor.on('callback_query', ctx => {
        if (ctx.session.steps === 1) {
            ctx.reply('Введите информация о враче (описание: Имя, специализация и т.д.)\n\nУбедитесь, что врач уже зарегестрирован боте перед добавлением!', tools.getKeyboard(content.cancelKey))
            ctx.session.newDoctor.spec = ctx.update.callback_query.data.split(':')[1];
            ctx.session.steps = 2
        }
        if (ctx.session.steps === 0) {
            getSpec(tools.getID(ctx))
            console.log(ctx.update.callback_query.data)
            ctx.session.newDoctor.profile = ctx.update.callback_query.data
            ctx.session.steps = 1
        }

        const message = ctx.update.callback_query.message;
        const userID = message.chat.id;
        const messageID = message.message_id;
        if (config.delMsgFlag) this.deleteMessage(userID, messageID);
    })

    newDoctor.on('photo', (ctx) => {
        ctx.session.newDoctor.photo = ctx.message.photo[ctx.message.photo.length - 1].file_id
        ctx.session.steps = 5
        ctx.reply(`Перешлите любое сообщение от врача (из личной переписки с врачем в телеграм)`, tools.delKey())
    })

    newDoctor.on('text', async(ctx) => {
        if (ctx.message.text !== 'Отмена') {
            switch (ctx.session.steps) {
                case 2:
                    ctx.reply(`Введите ссылку на сайт с подробным описание`)
                    ctx.session.newDoctor.description = ctx.message.text
                    ctx.session.steps = 3
                    break
                case 3:
                    ctx.reply(`Пришлите фото врача`);
                    ctx.session.newDoctor.link_desc = ctx.message.text
                    ctx.session.steps = 4
                    break
                case 5:
                    if (ctx.message.forward_from) {
                        ctx.session.newDoctor.userID = ctx.message.forward_from.id;
                        ctx.session.newDoctor.username = ctx.message.forward_from.username ? ctx.message.forward_from.username : '';
                        ctx.session.newDoctor.first_name = ctx.message.forward_from.first_name ? ctx.message.forward_from.first_name : '';
                        ctx.session.newDoctor.last_name = ctx.message.forward_from.last_name ? ctx.message.forward_from.last_name : '';
                        ctx.scene.leave();
                    } else {
                        ctx.reply(`Не удается опредилить пользователя!\n\nВоможно, владелец аккаунта ограничил доступность данных (настройки конфидециальности) или это не подходящее сообщение\n\nПроверьте данные и повторите еще раз!`);
                    }

            }

        } else { ctx.scene.leave() }
    })

    newDoctor.leave(async(ctx) => {
        newDoctorSave(ctx);
        this.templateMSG(ctx, 'admin');
    })

    return newDoctor
};
