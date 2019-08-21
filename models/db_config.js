const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

mongoose.connect(config.mongodb, { useNewUrlParser: true })

const Schema = mongoose.Schema

var dbConfigSchema = new Schema({
    last_id: { type: Number, required: true },
    // users_of_created: { type: Number, required: true },
    // users_of_existence: { type: Number, required: true }
})

module.exports = mongoose.model('DBconfig', dbConfigSchema)
