const Shop = require('../models/shop')
const config = require('config-lite')(__dirname)

module.exports = {
    addShop: async (info) => {
        return await new Shop(info).save()
    },

    getShops: async (query) => {
        var result = null
        if (query.type === "都行") {
            result = await Shop.find(
                {},
                null,
                {
                    skip: query.skip,
                    limit: query.limit,
                    sort: {'hot': -1}
                }
            ).exec()
        } else {
            result = await Shop.find(
                {type: query.type},
                null,
                {
                    skip: query.skip,
                    limit: query.limit,
                    sort: {'hot': -1}
                }
            ).exec()
        }

        return result
    }
}