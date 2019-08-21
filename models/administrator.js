const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongodb, { useNewUrlParser: true })
}

const Schema = mongoose.Schema

var administrator = new Schema({
    username: {type: String, required: true},
    nickname: {type: String, required: true},
    password: {type: String, required: true},
})

module.exports = mongoose.model('Administrator', administrator)
