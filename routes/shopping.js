const express = require('express')
const mongoose = require('mongoose')
const userController = require('../controllers/db_user')
const restaurantController = require('../controllers/db_restaurant')
const payController = require('../controllers/db_pay')
const menuController = require('../controllers/db_menu')

const router = express.Router()

router.all(/^\/shopping.*/, async (req, res, next) => {
    console.log('判断用户权限')
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        console.log('pass')
        req.session.destroy()
        res.redirect('/login')
        return
    }
    console.log('success')
    next()
})

router.get('/shopping/menu', async (req, res) => {
    var rid = req.query.rid
    var result = await restaurantController.getRestaurantById(rid)
    var menu_list = JSON.parse(JSON.stringify(result.menu_list))
    for (let i in menu_list) {
        var data = await menuController.getMenuById(menu_list[i])
        menu_list[i] = JSON.parse(JSON.stringify(data))
    }
    console.log(menu_list)
    res.render('shopping.html', {
        list: menu_list
    })
})

router.get('/shopping/voucher', async (req, res) => {
    var rid = req.query.rid
    var result = await restaurantController.getRestaurantById(rid)
    var voucher_list = JSON.parse(JSON.stringify(result.voucher_list))
    console.log(rid)
    for (let i in voucher_list) {
        voucher_list[i].total = Number(parseFloat(voucher_list[i].price * voucher_list[i].discount * 0.1).toFixed(1))
    }
    console.log(voucher_list)
    res.render('voucher.html', {
        list: voucher_list
    })
})

router.get('/shopping/orderPay', async (req, res) => {
    console.log(req.query)
    var gid = req.query.gid
    var vid = req.query.vid
    var rid = req.query.rid
    // console.log(gid == null)
    // console.log(vid)
    // console.log(rid)
    var goods = null
    try {
        if (gid != null && gid.length != 0) {
            goods = await menuController.getMenuById(gid)
            if (goods != null) {
                console.log(goods)
                var data = {
                    price: parseFloat(goods.price * goods.discount).toFixed(1),
                    name: goods.name
                }
                res.render('orderPay.html', data)
                return
            }
        } else if (vid != null && vid.length != 0) {
            vid = Number(vid)
            var restaurant = await restaurantController.getRestaurantById(rid)
            console.log(restaurant)
            if (restaurant != null) {
                var data = {
                    price: parseFloat(restaurant.voucher_list[vid].price * restaurant.voucher_list[vid].discount * 0.1).toFixed(1),
                }
                data.name = "" + data.price + "元代" + restaurant.voucher_list[vid].price + "元券"
                res.render('orderPay.html', data)
                return
            }
        }
        res.redirect('/')
    } catch (error) {
        res.redirect('/')
    }
})

router.post('/shopping/orderPay', async (req, res) => {
    var body = req.body
    var gid = body.gid
    var vid = body.vid
    var rid = body.rid
    var goods = null
    // console.log(body)
    try {
        if (gid != null && gid.length != 0) {
            goods = await menuController.getMenuById(gid)
            if (goods != null) {
                var pay = {
                    type: 0,
                    uid: req.session.uid,
                    rid: rid,
                    gid: gid,
                    total: body.total,
                    num: body.num,
                    name: goods.name,
                    state: 0,
                    key: mongoose.Types.ObjectId()
                }
                req.session.now_pay = pay
                res.status(200).json(pay)
                return
            }
        } else if (vid != null && vid.length != 0) {
            vid = Number(vid)
            var restaurant = await restaurantController.getRestaurantById(rid)
            if (restaurant != null) {
                var price = parseFloat(restaurant.voucher_list[vid].price * restaurant.voucher_list[vid].discount * 0.1).toFixed(1)
                var pay = {
                    type: 1,
                    uid: req.session.uid,
                    rid: rid,
                    vid: vid,
                    total: body.total,
                    num: body.num,
                    name: "" + price + "元代" + restaurant.voucher_list[vid].price + "元券",
                    state: 0,
                    key: mongoose.Types.ObjectId()
                }
                req.session.now_pay = pay
                res.status(200).json(pay)
                return
            }
        }
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.get('/shopping/confirmPay', async (req, res) => {
    var now_pay = req.session.now_pay
    console.log(now_pay)
    var pay_list = await payController.findPayByKey(now_pay.key)
    if (pay_list == null) {
        now_pay.date = new Date()
        now_pay.total = Number(now_pay.total)
        now_pay.num = Number(now_pay.num)
        var now_pay_id = null
        if (now_pay.type == 0) {
            var result = await payController.createPay({
                type: now_pay.type,
                uid: now_pay.uid,
                rid: now_pay.rid,
                gid: now_pay.gid,
                total: now_pay.total,
                num: now_pay.num,
                date: now_pay.date,
                state: 0,
                key: now_pay.key
            })
            console.log(result)
            now_pay_id = JSON.parse(JSON.stringify(result._id))
        } else {
            var result = await payController.createPay({
                type: now_pay.type,
                uid: now_pay.uid,
                rid: now_pay.rid,
                vid: now_pay.vid,
                v_name: now_pay.name,
                total: now_pay.total,
                num: now_pay.num,
                date: now_pay.date,
                state: 0,
                key: now_pay.key
            })
            now_pay_id = JSON.parse(JSON.stringify(result._id))
        }
        req.session.now_pay_id = now_pay_id
        console.log(now_pay_id)
    }
    res.render("confirmPay.html", now_pay)
})

router.get('/shopping/continuePay', async (req, res) => {
    var id = req.query.id
    try {
        var result = JSON.parse(JSON.stringify(await payController.findPayById(id)))
        if (result != null) {
            req.session.now_pay = result
            req.session.now_pay_id = id
            res.redirect('/shopping/confirmPay')
        }
    } catch (err) {
        console.log(err)
        res.redirect('/me/order')
    }
})

router.get('/shopping/paySuccess', async (req, res) => {
    var now_pay = req.session.now_pay
    var now_pay_id = req.session.now_pay_id
    console.log(now_pay)
    console.log(now_pay_id)
    var result = await payController.updatePayStateById(now_pay_id)
    console.log(result)
    if (result == null) {
        res.redirect('/me/order')
    } else {
        res.render("paySuccess.html", now_pay)
    }
})

module.exports = router
