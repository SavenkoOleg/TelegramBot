const config = require('./config')

const GET_CONSULTATION_KEY = 'Получить консультацию'
const CALLBACK_KEY = 'Регистратура'
const REFERAL_SYSTEM_KEY = 'Система лояльности'
const TARIF_KEY = 'Тарифы и оплата'
const CLIENT_INSTRUCTION = 'Инструкция'

const MODERATION_KEY = 'Модерация'
const CONTROL_CONTENT_KEY = 'Управление контентом'
const STATISTIC_KEY = 'Статистика'
const MAILING_KEY = 'Рассылка'
const UNLIMIT = 'Безлимит'

// редактировать тарифы??
const SPECIALIZATION_KEY = 'Специализации'
const DOCTOR_STATISTIC = 'Моя статистика'
const DOCTOR_INSTRUCTION = 'Инструкция!'
const SPECIALISTS_KEY = 'Специалисты'
const MODERATORS_KEY = 'Модераторы'
const CONSULTATION_SITE_KEY = 'Консультации (сайт)'
const CONSULTATION_BOT_KEY = 'Консультации (бот)'

const SKIP_KEY = 'Пропустить'
const BACK_KEY = 'Назад'
const CANCEL_KEY = 'Отмена'
const SEND_MESSAGE = 'Отправить сообщение'

const FINISH_CONSUL = 'Завершить консультацию'
const FINISH_CONSUL_FULL = 'Консультация назначена'

const RECOMMEND = 'Рекомендовать консультацию'

const content = {
    AGREEMENT: 'С вами работают педиатры, терапевты и узкие специалисты всех направлений.\n' +
        'В формате онлайн вы можете:\n' +
        '-узнать к какому специалисту обратиться и как срочно это нужно сделать\n' +
        '-получить информацию о первой помощи, если невозможно посетить врача \n' +
        '-подготовиться к очной консультации, чтобы она прошла максимально эффективно\n' +
        '-расшифровать результаты анализов и диагнозы, обсудить прогнозы лечения\n' +
        '-получить второе независимое мнение о рекомендованном ранее лечении\n' +
        '-разобрать домашнюю аптечку, косметику и гигиенические средства\n' +
        '-составить индивидуальный план посещения врачей и вакцинации\n' +
        '\n' +
        'Обращаем внимание, что консультации носят информационный характер, врачи клуба «Доверительная медицина» не ставят диагнозы и не делают лекарственные назначения.\n\n' +
        '⚠️ Перед использованием бота просим\nвнимательно ознакомиться с информацией',
    GET_CONSULTATION: 'Выберите интересующую Вас услугу',
    NEW_USER: 'Рады приветствовать Вас!',
    ADD_ERROR: 'Ошибка добавления',
    CALLBACK_TEXT: `Если у Вас возникли вопросы вы можете написать в Регистратуру`,
    ERROR: `Если кнопок не видно, нажмите на иконку в правом нижнем углу, как показано на картинке`,
    // ERROR_PHOTO: 'AgACAgIAAxkBAAIv31_TNlMRFI7LqHMs4mqaqYRmWKELAAJZsDEbpQGZSuIIJ8L6cVIYR-lRmC4AAwEAAwIAA3gAAxAxBAABHgQ', // test
    ERROR_PHOTO: 'AgACAgIAAxkBAAIDc1_ZqS7mER1ODqZ54XJs229Fu8E8AAJ3rzEbS6jRSvyEqgABlbEJdRJyZpouAAMBAAMCAAN4AAN7RgIAAR4E',

    // CLIENT_INSTRUCTION_VIDEO: 'BAACAgIAAxkBAAJPuF_0FZ6a5xc-M4afNZlNltcnG9bxAAKFCgACM4WhS6zorDQbmmpHHgQ', // test
    CLIENT_INSTRUCTION_VIDEO: 'BAACAgIAAxkBAAILqF_0F6KIJCPC8ipE7YIs_p513fbQAAJzBwACZk6gSxVLBX8QLn1QHgQ',
    // DOCTOR_INSTRUCTION_VIDEO: 'BAACAgIAAxkBAAJPuV_0FjjFRwHLbXb02dIMbL52F2V6AAKHCgACM4WhS--MBy4htjvkHgQ', // test
    DOCTOR_INSTRUCTION_VIDEO: 'BAACAgIAAxkBAAILqV_0GESGy_jcoaR_e-hvecfQqinzAAJ0BwACZk6gS2K3brVgW50QHgQ',

    ERROR_LINK: `Упс... ссылка, по которой Вы вошли недействительна!\n\nОбратитесь за помощью к @${config.adminNick}`,
    ERROR_OTHER: `Упс... кажется что-то пошло не так... \n\nОбратитесь за помощью к @${config.adminNick}`,
    WELCOME: 'Добро пожаловать! \n\nВоспользуйтесь меню ниже',
    CONTROL_CONTENT_TEXT: `Управление контентом`,
    LIST_SPECIALIZATION_USER: `Список специалистов`,
    LIST_SPECIALIZATION_ADMIN: `Список специалистов`,
    SPECIALIZATION: `Какой специалист Вас интересует?`,
    REPLY: 'Основное меню',
    DEL_SPEC: 'Управление',
    TARIFFS: 'Тарифы',
    UNLIMIT_PRICE: 'Укажите цену безлимитного тарифа на 1 месяц',
    TYPE_CONSUL: 'Какую консультацию Вы хотите оплатить?',
    FULL_CONSUL_TEXT: 'Ваш запрос направлен врачу!\n\nВрач ответит, чтобы назначить время и способ, связи в ближайщее время',
    REQUEST_FULL_CONSUL_1: 'Поступил запрос на персональную косультацию от\n\n',
    REQUEST_FULL_CONSUL_2: '\n\nНажмите кнопку "Ответить", чтобы договориться о созвоне.',
    BONUS_SYSTEM: `Друг, которого Вы пригласили к нам сделал первую покупку у нас!\n\nВ качестве благодарности мы дарим Вам бесплатную экспресс-консултацию! 🎁`,
    NOT_FULL_CONSUL: 'У вас нет оплаченных персональных консультаций, перейдите в раздел тарифов, чтобы оплатить',
    NOT_EXPRESS_CONSUL: 'У вас нет оплаченных экспресс-консультаций, перейдите в раздел тарифов, чтобы оплатить',
    NEW_UNLIMIT_TEXT: 'Для того, чтобы отправить счет на оплату безлимитного пакета консультаций убедитесь в том, что интересующий Вас человек зарегистрирован в боте, а затем перешлите сюда любое его сообщение\n\nПосле этого указанному клиенту будет выставлен персональный счет. Другие пользователи бота не будут иметь доступа к данному пакету.',
    GET_SPECIALITION_TEXT: 'Укажите специализацию врача',
    GET_SPECIALITION_TEXT_USER: 'Выберите специализацию врача',
    SEND_MESSAGE_TIMEOUT: 'Если Вы уже написали сообщение, нажмите кнопку отправить',
    FEEDBACK_TEXT: `Консультация завершена!\n\nПожалуйста, оцените качество консультации от 1 до 5\n\nПо всем вопросам пишите в чат ${config.linkChat}`,

    GET_CONSULTATION_KEY,
    CALLBACK_KEY,
    REFERAL_SYSTEM_KEY,
    TARIF_KEY,
    CLIENT_INSTRUCTION,

    MODERATION_KEY,
    CONTROL_CONTENT_KEY,
    STATISTIC_KEY,
    DOCTOR_INSTRUCTION,
    MAILING_KEY,

    SPECIALISTS_KEY,
    UNLIMIT,
    MODERATORS_KEY,
    CONSULTATION_SITE_KEY,
    CONSULTATION_BOT_KEY,
    SPECIALIZATION_KEY,

    CANCEL_KEY,
    SKIP_KEY,
    BACK_KEY,

    skipKey: [
        [SKIP_KEY]
    ],
    backKey: [
        [BACK_KEY]
    ],
    cancelKey: [
        [CANCEL_KEY]
    ],

    FINISH_CONSUL,
    FINISH_CONSUL_FULL,
    DOCTOR_STATISTIC,
    SEND_MESSAGE,
    RECOMMEND,

    userKeyboard: [
        [GET_CONSULTATION_KEY],
        [TARIF_KEY, CLIENT_INSTRUCTION],
        [CALLBACK_KEY, REFERAL_SYSTEM_KEY]
    ],

    adminKeyboard: [
        [SPECIALISTS_KEY],
        [MAILING_KEY, STATISTIC_KEY],
        [UNLIMIT]
    ],

    controlContent: [
        [SPECIALISTS_KEY, MODERATORS_KEY],
        [BACK_KEY]
    ],

    finishKeyboard: [
        [FINISH_CONSUL],
        [RECOMMEND]
    ],
    finishKeyboardFull: [
        [FINISH_CONSUL_FULL]
    ],

    doctorKeyboard: [
        [DOCTOR_STATISTIC],
        [DOCTOR_INSTRUCTION]
    ],
    clientKeyboard: [
        [SEND_MESSAGE]
    ],

    getConsultationInline: [
        [{ text: 'Экспресс-консультация', callback_data: `express-consultation` }],
        [{ text: 'Консультация', callback_data: `consultation` }]
    ],

    getGoTarifInline: [
        [{ text: 'Перейти к тарифам', callback_data: `go tarif` }]
    ],

    sendMessageInline: flag => [
        [{ text: 'Отправить', callback_data: `sendMessage` },
            { text: 'Написать еще', callback_data: `sending` }
        ],
        [{ text: 'Завершить консультацию', callback_data: `finish express`, hide: flag }],
        [{ text: 'Рекомендовать консультацию', callback_data: `recommend full`, hide: flag }]
    ],

    sendMessageFullInline: flag => [
        [{ text: 'Отправить', callback_data: `sendMessage` },
            { text: 'Написать еще', callback_data: `sending` }
        ],
        [{ text: 'Консультация назначена', callback_data: `finish full`, hide: flag }]
    ],

    getUnlimitInline: [
        [{ text: '1000 р.', callback_data: `unlimit_1` }],
        [{ text: '1400 р.', callback_data: `unlimit_2` }],
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    getSpecializationInline: (flag) => [
        [{ text: 'Детский', callback_data: `childish` }],
        [{ text: 'Взрослый', callback_data: `adult` }],
        [{ text: 'Совмещает', callback_data: `combines`, hide: flag }],
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    paymentConsultation: (flag) => [
        [{ text: 'Разовая консультация', callback_data: `one consultation` }],
        // [{ text: 'Абонемент', callback_data: `unlimited tariffs`, hide: flag }],
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    getAgreementInline: [
        [{ text: 'Я ознакомился(ась)', callback_data: `agreement` }]
    ],

    startDialog: (ID) => [
        [{ text: 'Начать диалог', callback_data: `start dialog:${ID}` }]
    ],

    answerDialog2: (ID) => [
        [{ text: 'Ответить', callback_data: `start dialog:${ID}` }],
        // [{ text: 'Рекомендовать консультацию', callback_data: `recommend:${ID}` }],
        // [{ text: 'Завершить консультацию', callback_data: `stop dialog:${ID}` }]
    ],

    answerDialog2Full: (ID) => [
        [{ text: 'Ответить', callback_data: `start dialog full:${ID}` }],
        [{ text: 'Завершить консультацию', callback_data: `stop dialog full:${ID}` }]
    ],

    answerDialogFull: (ID) => [
        [{ text: 'Ответить', callback_data: `full start dialog:${ID}` }]
    ],

    sendLinkToFull: (ID) => [
        [{ text: 'Отправить ссылку', callback_data: `send link:${ID}` }]
    ],

    finishFullConsul: (ID) => [
        [{ text: 'Консультация проведена', callback_data: `finish full consul:${ID}` }]
    ],

    answerDialog: (ID) => [
        [{ text: 'Ответить', callback_data: `start dialog:${ID}` }]
    ],

    answerDialogModer: (ID) => [
        [{ text: 'Переадресовать', callback_data: `relocation:${ID}` }]
    ],

    tariffConsultation: [
        [{ text: '1 мес.: 1400р. (4 шт/мес.)', callback_data: `tarif_1` }],
        [{ text: '3 мес.: 3900р. (4 шт/мес.)', callback_data: `tarif_3` }],
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    getRateInline: [
        [
            { text: '1', callback_data: `rate:1` },
            { text: '2', callback_data: `rate:2` },
            { text: '3', callback_data: `rate:3` },
            { text: '4', callback_data: `rate:4` },
            { text: '5', callback_data: `rate:5` }
        ],
    ],

    goToConsultation: [
        [{ text: 'Перейти к консультации', callback_data: `go_to_consultation` }],
    ],

    typeConsultation: [
        [{ text: 'Экспресс-консультация', callback_data: `one_consultation_pay` }],
        [{ text: 'Полная консультация', callback_data: `full_consultation_pay` }],
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    targetMailing: [
        [{ text: 'Клиентам', callback_data: `user` }],
        [{ text: 'Врачам', callback_data: `doctor` }],
        [{ text: 'Всем', callback_data: `all` }],
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    generalMenu: [
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    FeedBack: [
        [{ text: 'Регистратура', url: config.linkChat }],
        [{ text: 'Основное меню', callback_data: `exit` }]
    ],

    goToFullConsul: (ID) => [
        [{ text: 'Начать консультацию', callback_data: `full-consul:${ID}` }]
    ],

    delSpecialistInline: (ID) => [
        [{ text: 'Статистика', callback_data: `statSpecialist:${ID}` }],
        [{ text: 'Удалить', callback_data: `deleteSpecialist:${ID}` }],
        [{ text: 'Основное меню', callback_data: `exit` }],
    ],

    getDoctorsInline: (inline, doctor) => {
        inline.push([{ text: 'Подробнее', url: doctor.link_desc }])
        inline.push([{ text: 'Экспресс-консультация', callback_data: `express-consul:${doctor.userID}` }])
        inline.push([{ text: 'Полная консультация', callback_data: `full-consul:${doctor.userID}` }])
            // inline.push([{ text: 'Не знаю кто нужен!', callback_data: `unknown` }])
        inline.push([{ text: 'Назад', callback_data: `back-consul` }])
        return inline
    },

    SERVICES: [
        { service: 'one_consultation_pay', full: 0, express: 1, months: 0, amount: 500, name: 'Экспресс-консультация (до 10 минут, 1 подробный ответ на 1 вопрос)', title: 'Экспресс-консультация' },
        { service: 'full_consultation_pay', full: 1, express: 0, months: 0, amount: 2000, name: 'Персональная индивидуальная консультация (до 40 минут в удобном формате)', title: 'Персональная индивидуальная консультация' },
        { service: 'full_consultation_pay_limit', full: 1, express: 0, months: 0, amount: 1500, name: 'Персональная индивидуальная консультация (до 40 минут в удобном формате). По рекомендации врача.', title: 'Персональная индивидуальная консультация. По рекомендации врача.' },
        { service: 'tarif_1', amount: 1400, full: 0, express: 4, months: 1, name: 'Экспресс-консультация (до 10 минут, 1 подробный ответ на 1 вопрос)\nАбонемент на 4 консультации в течение 1 месяца', title: 'Экспресс-консультация (Абонемент 1 мес.)' },
        { service: 'tarif_3', amount: 3900, full: 0, express: 4, months: 3, name: 'Экспресс-консультация (до 10 минут, 1 подробный ответ на 1 вопрос)\nАбонемент на 4 консультации в месяц, на 3 месяца', title: 'Экспресс-консультация (Абонемент 3 мес.)' },
        { service: 'unlimit_1', amount: 1000, full: 0, express: 0, months: 0, name: 'Пакет безлимитных консультаций на 1 месяц', title: 'Пакет безлимитных консультаций на 1 месяц' },
        { service: 'unlimit_2', amount: 1400, full: 0, express: 0, months: 0, name: 'Пакет безлимитных консультаций на 1 месяц', title: 'Пакет безлимитных консультаций на 1 месяц' }
    ],

    listSpec: [
        { name: 'Хирург-гинеколог', id: 0 },
        { name: 'Дерматовенеролог', id: 1 },
        { name: 'Эндокринолог, диетолог', id: 2 },
        { name: 'Офтальмолог', id: 3 },
        { name: 'Каридолог, аритмолог', id: 4 },
        { name: 'Детский невролог', id: 5 },
        { name: 'Невролог', id: 6 },
        { name: 'Семейный врач', id: 7 },
        { name: 'Педиатр', id: 8 },
        { name: 'Терапевт', id: 9 },
        { name: 'Общий хирург', id: 10 },
        { name: 'Травматолог-ортопед', id: 11 },
        { name: 'Уролог', id: 12 },
        { name: 'ЛОР-врач', id: 13 },
        { name: 'Стоматолог', id: 14 },
        { name: 'Аллерголог-иммунолог', id: 15 },
        { name: 'Гастроэнтеролог, гепатолог', id: 16 },
        { name: 'Врач-генетик', id: 17 },
        { name: 'Онколог, пластический хирург', id: 18 },
        { name: 'Ревматолог', id: 19 },
        { name: 'Гинеколог-эндокринолог', id: 20 },
        { name: 'Провизор', id: 21 },
        { name: 'Косметолог', id: 22 },
        { name: 'Психотерапевт', id: 23 },
        { name: 'Врач-патолог', id: 24 }
    ]

}

module.exports = content