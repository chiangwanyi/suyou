const express = require('express')
const userController = require('../controllers/db_user')
const restaurantController = require('../controllers/db_restaurant')

const router = express.Router()

const limit = 6

router.get('/', async (req, res, next) => {
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        req.session.uid = null
    }
    var user = null
    if (req.session.uid != null) {
        user = await userController.findUser({ _id: req.session.uid })
    }
    if (req.query.cache === "false") {
        res.status(200).json({})
        console.log('cache clear')
        return;
    }
    var result = await restaurantController.getAllRestaurants()
    result = JSON.parse(JSON.stringify(result)).sort((a, b) => {
        return Math.round(Math.random()) > 0.5 ? -1 : 1
    })
    for (let i in result) {
        result[i].hot = Math.round(result[i].hot / 100 * 5)
    }
    req.session.home_r_l = result
    // console.log(req.session,req.sessionID)
    console.log(user)
    res.render('home.html', {
        user: user,
        sessionID: req.sessionID,
        list: result.slice(limit * 0, limit * 1)
    })
})

router.post('/', async (req, res) => {
    var list = req.session.home_r_l
    var skip = req.body
    res.status(200).json({
        list: list.slice(limit * Number(skip.step), limit * (Number(skip.step) + 1))
    })
})

router.get('/test', async (req, res) => {
    res.render('test.html')
})

module.exports = router
