const express = require('express')
const userController = require('../controllers/db_user')
const noteController = require('../controllers/db_note')
const payController = require('../controllers/db_pay')
const restaurantController = require('../controllers/db_restaurant')
const menuController = require('../controllers/db_menu')
const tools = require('../controllers/tools')

const router = express.Router()

router.all(/^\/me.*/, async (req, res, next) => {
    console.log('判断用户权限')
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        console.log('to login')
        req.session.destroy()
        res.redirect('/login')
        return
    }
    console.log('success')
    next()
})

router.get('/me', async (req, res) => {
    var user = await userController.findUser({ _id: req.session.uid })
    res.render('me.html', {
        user: user
    })
})

router.get('/me/messages', async (req, res) => {
    var user = await userController.findUser({ _id: req.session.uid })
    var notes = []
    console.log(user.user_notes)
    for (var i in user.user_notes) {
        var result = await noteController.getNoteById(user.user_notes[i])
        console.log(result)
        var note = {
            comment_number: result.comment_number,
            like_number: result.like_number,
            note_id: result.id,
            creation_date: result.creation_date,
            image: result.image,
            text: result.text,
        }
        notes.unshift(note)
    }
    res.render('messages.html', {
        notes: notes
    })
})

router.get('/me/addshop', async (req, res) => {
    res.render('addshop.html')
})

router.post('/me/addshop', async (req, res) => {
    try {
        var body = req.body
        console.log(body)
        var result = await shopController.addShop(body)
        console.log(result)
        res.redirect('/me/addshop')
    } catch (err) {
        console.log(err)
    }
})

router.get('/me/map', async (req, res) => {
    res.render('map.html')
})

router.get('/me/store', async (req, res) => {
    res.render('store.html')
})

router.get('/me/order', async (req, res) => {
    var pay_list = JSON.parse(JSON.stringify(await payController.findAllPay(req.session.uid)))
    var sale_num = 0
    var nosale_num = 0
    console.log(pay_list)
    pay_list.forEach(el => {
        if (el.state == 1) {
            sale_num++
        } else {
            nosale_num++
        }
    });
    for (let i in pay_list) {
        pay_list[i].restaurant = JSON.parse(JSON.stringify(await restaurantController.getRestaurantById(pay_list[i].rid)))
        var date = new Date(pay_list[i].date)
        pay_list[i].date = date.getFullYear() +
            "-" + (Number(date.getMonth()) + 1) +
            "-" + date.getDate() +
            " " + tools.formatLessThan10(date.getHours()) +
            ":" + tools.formatLessThan10(date.getMinutes()) +
            ":" + tools.formatLessThan10(date.getSeconds())
        if (pay_list[i].type == 0) {
            pay_list[i].menu = JSON.parse(JSON.stringify(await menuController.getMenuById(pay_list[i].gid)))
        }
    }
    console.log("==========")
    console.log(sale_num)
    console.log(nosale_num)
    res.render('order.html', {
        list: pay_list,
        total_num: sale_num + nosale_num,
        sale_num: sale_num,
        nosale_num: nosale_num
    })
})

module.exports = router
