const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongodb, { useNewUrlParser: true })
}

const Schema = mongoose.Schema

var voucherSchema = new Schema({
    price: {type: Number, required: true},
    discount: { type: Number, required: true, default: 1.0 },
    sales: { type: Number, required: true, default: 0 },
    available_date: { type: Array, required: true, default: [1 - 7] },
})

module.exports = mongoose.model("voucher", voucherSchema)
