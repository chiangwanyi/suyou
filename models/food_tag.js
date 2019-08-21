const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongodb, { useNewUrlParser: true })
}

const Schema = mongoose.Schema

var foodTagSchema = new Schema({
    name: { type: String, required: true },
    key: {type: Array, default:[]}
})

module.exports = mongoose.model("foodTag", foodTagSchema)
