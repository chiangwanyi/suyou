const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongodb, { useNewUrlParser: true })
}

const Schema = mongoose.Schema

var paySchema = new Schema({
    type: { type: Number, enum: [0, 1] },
    uid: { type: mongoose.Types.ObjectId, required: true },
    rid: { type: mongoose.Types.ObjectId, required: true },
    gid: { type: mongoose.Types.ObjectId },
    vid: { type: Number },
    v_name: { type: String },
    total: { type: Number },
    num: { type: Number },
    date: { type: Date },
    state: { type: Number, enum: [0, 1] },
    key: {type: mongoose.Types.ObjectId, required: true}
})

module.exports = mongoose.model("pay", paySchema)
