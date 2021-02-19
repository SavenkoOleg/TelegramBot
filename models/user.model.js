const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    express_one: { type: Number, default: 0 },
    express_tarif: { type: Number, default: 0 },
    express_ref: { type: Number, default: 0 },
    full: { type: Number, default: 0 },
    months: { type: Number, default: 0 },
    datePay: { type: Date },
    userID: { type: Number },
    messageID: { type: Number },
    perentID: { type: Number },
    psevdoID: { type: String },
    consultationID: { type: String },
    phone_number: { type: String },
    role: { type: String },
    referals: { type: Schema.Types.Array },
    refFlag: { type: Boolean, default: false },
    recommend: { type: Boolean, default: false },
    sceneFlag: { type: Boolean, default: false },
    sceneFinishFlag: { type: Boolean, default: false },
    unlimit: { type: Boolean, default: false },
    unlimitMonth: { type: Number, default: 0 },
    username: { type: String },
    language_code: { type: String },
    messages: {type: Schema.Types.Mixed}
})

module.exports = UserSchema
