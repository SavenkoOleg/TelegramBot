const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaymentSchema = new Schema({
    payID: { type: String },
    userID: { type: Number },
    doctorID: { type: Number  },
    transactionID: { type: Number },
    amount: { type: Number },
    dealID: { type: Number },
    dateCreate: { type: Date,  default: Date.now },
    product: { type: String },
    service: { type: String },
    status: { type: String, default: 'new' },
})

module.exports = PaymentSchema
