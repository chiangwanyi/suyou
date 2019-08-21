const FoodTag = require('../models/food_tag')

module.exports = {
    createTag: async (data) => {
        new FoodTag(data).save()
    },
    findTag: async (data) => {
        return await FoodTag.findOne(data).exec()
    },
    findAllTag: async () => {
        return await FoodTag.find().exec()
    }
}