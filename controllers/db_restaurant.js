const Restaurant = require('../models/restaurant')
const FoodTag = require('../models/food_tag')
const mongoose = require('mongoose')

module.exports = {
    createRestaurant: async (info) => {
        var data = new Restaurant(info)
        await data.save()
        return data.get('id')
    },
    updateRestaurant: async (id, info) => {
        await Restaurant.updateOne({ _id: id }, info)
    },
    getRestaurantById: async (id) => {
        var result = await Restaurant.findOne(
            { _id: id }
        )
        return result
    },
    getAllRestaurants: async () => {
        return Restaurant.find().exec()
    },
    getRestaurantsIdByTagKey: async (food) => {
        var result = await FoodTag.find(
            {
                key: { "$in": [food] }
            },
            null,
            {
                sort: { 'hot': -1 }
            }
        )
        return result
    },
    getRestaurantsByTagId: async (id) => {
        var result = await Restaurant.find(
            {
                tag: id
            },
            null,
            {
                sort: { 'hot': -1 }
            }
        )
        return result
    },
    getRestaurantsByFoodInName: async (food) => {
        var result = await Restaurant.find(
            {
                name: { '$regex': food }
            },
            null,
            {
                sort: { 'hot': -1 }
            }
        )
        return result
    },
    getRestaurantsByBasicInfo: async (query) => {
        var result = await Restaurant.find(
            {
                onop: { '$in': [query.onop, 2] },
                basic_taste: { '$in': [query.basic_taste, 2] },
                ave_price: { '$lte': query.ave_price },
            },
            null,
            {
                sort: { 'hot': -1 }
            }
        )
        return result
    },
    updateRestaurantToMenu: async (id, info) => {
        await Restaurant.updateOne(
            { _id: id },
            { $push: { menu_list: mongoose.Types.ObjectId(info) } }
        )
    },
    updateRestaurantToVoucher: async (id, info) => {
        await Restaurant.updateOne(
            { _id: id },
            { $push: { voucher_list: info } }
        )
    }
}
