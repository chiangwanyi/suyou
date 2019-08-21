const Pay = require('../models/pay')
const mongoose = require('mongoose')

module.exports = {
    createPay: async (data) => {
        return await new Pay(data).save()
    },
    findPayById: async (id) => {
        return await Pay.findOne({ _id: id })
    },
    findPayByKey: async (id) => {
        return await Pay.findOne({ key: id })
    },
    findAllPay: async (uid) => {
        return await Pay.find({ uid: uid }).exec()
    },
    findPayByState: async (state) => {
        return await Pay.find(
            { state: state }
        )
    },
    updatePayStateById: async (id) => {
        var result = await Pay.findOneAndUpdate(
            {
                _id: id,
                state: 0
            },
            { $set: { state: 1, date: new Date() } },
            { new: true }
        )
        return result
    }
}
