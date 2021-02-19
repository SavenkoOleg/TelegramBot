const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConsultationSchema = new Schema({
    consultationID: { type: String },
    doctorID: { type: String },
    clientID: { type: String },
    dateOrder: { type: Date, default: Date.now },
    status: { type: String },
    rate: { type: Number },
    type: { type: String }
})

module.exports = ConsultationSchema
