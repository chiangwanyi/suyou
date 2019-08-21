const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongodb, { useNewUrlParser: true })
}

const Schema = mongoose.Schema

var menuSchema = new Schema({
    name: { type: String, required: true },
    img: { type: String},
    price: { type: Number, required: true },
    discount: { type: Number, required: true, default: 1.0 },
    sales: { type: Number, required: true, default: 0 },
    profile: { type: String, required: true },
    available_date: { type: Array, required: true, default: [1,7] },
    food_detail_title: { type: Array, default: [] },
    food_detail_list: { type: Array, default: [] },
    hint_title: { type: Array, default: [] },
    hint_list: { type: Array, default: [] }
})

module.exports = mongoose.model("menu", menuSchema)
