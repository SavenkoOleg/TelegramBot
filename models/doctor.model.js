const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DoctorSchema = new Schema({
    username: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    doctorID: { type: String },
    spec: { type: Number },
    profile: [{ type: String }],
    userID: { type: Number, required: true },
    description: { type: String },
    photo: { type: String },
    link_desc: { type: String },
})

module.exports = DoctorSchema
