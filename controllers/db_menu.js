const Menu = require('../models/menu')

module.exports = {
    createMenu: async (info) => {
        var data = new Menu(info)
        await data.save()
        return data.get('id')
    },
    getMenuById: async (id) => {
        var result = await Menu.findOne({
            _id: id
        })
        return result
    },
    updateMenu: async (id, info) => {
        await Menu.updateOne({ _id: id }, info)
    },
}