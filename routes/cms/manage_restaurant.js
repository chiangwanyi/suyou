const express = require('express')
const path = require('path')
const fs = require('fs')
const restaurantController = require('../../controllers/db_restaurant')
const foodTagController = require('../../controllers/db_food_tag')
const menuController = require('../../controllers/db_menu')
var multiparty = require('connect-multiparty');

const router = express.Router()

var multipartMiddleware = multiparty({
    uploadDir: path.join(__dirname, '../../temp')
})

router.get('/cms/manage/restaurant', async (req, res) => {
    res.render('cms/manage_restaurant.html')
})

router.post('/cms/manage/restaurant/get_data', async (req, res) => {
    var key = req.body.key
    var list = await restaurantController.getAllRestaurants()
    // console.log(list)
    var brief_list = []
    for (var i in list) {
        var tag = await foodTagController.findTag({ _id: list[i].tag })
        var onop = null
        var basic_taste = null
        if (list[i].onop == 0) {
            onop = '单人'
        } else if (list[i].onop == 1) {
            onop = '多人'
        } else {
            onop = '均可'
        }
        if (list[i].basic_taste == 0) {
            basic_taste = '清淡'
        } else if (list[i].basic_taste == 1) {
            basic_taste = '非清淡'
        } else {
            basic_taste = '均有'
        }
        brief_list.push({
            id: list[i]._id,
            name: list[i].name,
            ave_price: list[i].ave_price,
            tag: tag.name,
            basic_taste: basic_taste,
            business_time: "" + list[i].business_time[0] + "-" + list[i].business_time[1],
            onop: onop,
            menu_list_length: list[i].menu_list.length,
            voucher_list_length: list[i].voucher_list.length
        })
    }
    if (key == 'zll&jwy') {
        res.json(brief_list)
    } else {
        res.json([])
    }
})

router.post('/cms/manage/restaurant/addTag', async (req, res) => {
    var data = req.body
    var result = await foodTagController.findTag(data)
    if (result === null) {
        await foodTagController.createTag(data)
        res.status(200).json({
            code: 0,
            msg: 'ok'
        })
    } else {
        res.status(200).json({
            code: -1,
            msg: 'tag is already exist.'
        })
    }
})

router.get('/cms/manage/restaurant/add', async (req, res) => {
    var tag_list = await foodTagController.findAllTag()
    tag_list = JSON.parse(JSON.stringify(tag_list))
    console.log(tag_list)
    res.render('cms/manage_add_restaurant.html', {
        food_tag: tag_list
    })
})

router.post('/cms/manage/restaurant/add', multipartMiddleware, async (req, res) => {
    var info = req.body
    var tag = await foodTagController.findTag({ name: info.tag })
    info.hot = Math.round(Math.random() * 30) + 70
    info.img = ''
    info.ave_price = Number(info.ave_price)
    info.coordinate = [Number(info.coordinate.split(',')[0]), Number(info.coordinate.split(',')[1])]
    info.business_time = [Number(info.business_time.split('-')[0]), Number(info.business_time.split('-')[1])]
    info.service_type = Number(info.service_type)
    info.basic_taste = Number(info.basic_taste)
    info.onop = Number(info.onop)
    info.goods_type = { type: "menu", list: [] }
    info.tag = tag.id

    var id = await restaurantController.createRestaurant(info)
    image_name = '/public/data/restaurant/img/' + id + path.extname(req.files.image.path)
    await fs.rename(req.files.image.path, path.join(__dirname, path.join('../../', image_name)), (err) => {
        if (err) {
            console.log(err)
        }
    })

    await restaurantController.updateRestaurant(id, {
        img: image_name
    })

    res.status(200).json({
        code: 0,
        msg: 'ok'
    })
})

router.get('/cms/manage/restaurant/add_goods', async (req, res) => {
    res.render('cms/manage_restaurant_add_goods.html')
})

router.post('/cms/manage/restaurant/add_goods', multipartMiddleware, async (req, res) => {
    var info = req.body
    console.log(info)
    try {
        if (info.goods_type == '0') {
            var menu = {}
            menu.name = info.name
            menu.img = ''
            menu.price = Number(info.price)
            menu.discount = Number(info.discount) * 0.01
            menu.sales = 0
            menu.profile = info.profile

            menu.available_date = info.available_date.split('-').map(Number)

            menu.food_detail_title = info.food_detail_title.split('#')

            var food_detail_list_content = info.food_detail_list_content.split('\r\n#\r\n')
            for (let i in food_detail_list_content) {
                food_detail_list_content[i] = food_detail_list_content[i].split('\r\n')
            }

            var food_detail_list_number = info.food_detail_list_number.split('#')
            for (let i in food_detail_list_number) {
                food_detail_list_number[i] = food_detail_list_number[i].split('-')
                if (typeof food_detail_list_number[i] == 'string') {
                    food_detail_list_number[i] = Number(food_detail_list_number[i])
                } else {
                    food_detail_list_number[i] = food_detail_list_number[i].map(Number)
                }
            }

            var food_detail_list_price = info.food_detail_list_price.split('#')
            for (let i in food_detail_list_price) {
                food_detail_list_price[i] = food_detail_list_price[i].split('-')
                if (typeof food_detail_list_price[i] == 'string') {
                    food_detail_list_price[i] = Number(food_detail_list_price[i])
                } else {
                    food_detail_list_price[i] = food_detail_list_price[i].map(Number)
                }
            }

            for (let i = 0; i < food_detail_list_content.length; i++) {
                for (let j = 0; j < food_detail_list_content[i].length; j++) {
                    var detail = {
                        content: food_detail_list_content[i][j],
                        number: food_detail_list_number[i][j],
                        price: food_detail_list_price[i][j]
                    }
                    food_detail_list_content[i][j] = detail
                }
            }
            menu.food_detail_list = food_detail_list_content

            menu.hint_title = info.hint_title.split('#')

            var hint_list = info.hint_list.split('\r\n#\r\n')
            for (let i in hint_list) {
                hint_list[i] = hint_list[i].split('\r\n')
            }
            menu.hint_list = hint_list
            console.log(menu)
            var id = await menuController.createMenu(menu)
            await restaurantController.updateRestaurantToMenu(info.id, id)

            image_name = '/public/data/menu/img/' + id + path.extname(req.files.image.path)
            await fs.rename(req.files.image.path, path.join(__dirname, path.join('../../', image_name)), (err) => {
                if (err) {
                    console.log(err)
                }
            })
            await menuController.updateMenu(id, {
                img: image_name
            })

        } else {

        }
        res.status(200).json({
            code: 0,
            msg: 'ok'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            code: -1,
            msg: 'Error'
        })
    }

})

module.exports = router
