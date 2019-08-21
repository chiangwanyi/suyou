const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

mongoose.connect(config.mongodb, { useNewUrlParser: true })

const Schema = mongoose.Schema

var signatureSchema = new Schema({
    uid: {type: mongoose.Types.ObjectId, required: true},
    // uid: { type: Number, required: true },
    sessionID: { type: String, default: null },
})

module.exports = mongoose.model('Signature', signatureSchema)
