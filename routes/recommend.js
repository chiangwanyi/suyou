const express = require('express')
const restaurantController = require('../controllers/db_restaurant')
const menuController = require('../controllers/db_menu')

const router = express.Router()

const limit = 5

router.get('/recommend', async (req, res) => {
    try {
        var key = req.query.key
        if (key == req.session.recommend_list.key) {
            var recommend_list = req.session.recommend_list
            console.log(req.session.require_list)
            if (req.session.require_list.scope != 0) {
                console.log('pass')
                recommend_list.first_list.sort((a, b) => {
                    return a.distance - b.distance
                })
                recommend_list.second_list.sort((a, b) => {
                    return a.distance - b.distance
                })
            }
            console.log(recommend_list.first_list.length, recommend_list.second_list.length)
            res.render('recommend.html', {
                restaurants: recommend_list.first_list.slice(limit * 0, limit * 1),
                key: key
            })
        } else {
            res.redirect('/')
        }
    } catch (err) {
        console.log(err)
    }
})

router.post('/recommend/get', async (req, res) => {
    try {
        var recommend_list = req.session.recommend_list
        var skip = req.body
        console.log(skip)
        if (skip.index == '1') {
            res.status(200).json({
                list: recommend_list.first_list.slice(limit * Number(skip.step), limit * (Number(skip.step) + 1)),
                key: req.session.recommend_list.key
            })
        } else if (skip.index == '2') {
            res.status(200).json({
                list: recommend_list.second_list.slice(limit * Number(skip.step), limit * (Number(skip.step) + 1)),
                key: req.session.recommend_list.key
            })
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/recommend/detail', async (req, res) => {
    var id = req.query.id
    var result = await restaurantController.getRestaurantById(id)
    result = JSON.parse(JSON.stringify(result))
    console.log(result)
    for (let i in result.business_time) {
        let time = String(result.business_time[i]).split('.')
        if (time.length == 1) {
            result.business_time[i] = time[0] + ":00"
        } else {
            let m = time[1]
            if (Number(m) < 6) {
                m = ":" + m + "0"
            }
            result.business_time[i] = time[0] + m
        }
    }
    for (let i in result.menu_list) {
        var data = await menuController.getMenuById(result.menu_list[i])
        result.menu_list[i] = JSON.parse(JSON.stringify(data))
    }
    // console.log(result)
    res.render('detail.html', {
        data: result,
        key: req.session.recommend_list == null ? 1 : req.session.recommend_list.key
    })
})

router.get('/recommend/detail/navigate', async (req, res) => {
    var id = req.query.id
    var result = await restaurantController.getRestaurantById(id)
    result = JSON.parse(JSON.stringify(result))
    console.log(result)
    res.render('navigate.html', {
        loc: result.coordinate
    })
})

module.exports = router