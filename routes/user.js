const express = require('express')
const fs = require('fs')
const path = require('path')
const sd = require('silly-datetime')
const userController = require('../controllers/db_user')
var multiparty = require('connect-multiparty');

const router = express.Router()

router.all(/^\/user.*/, async (req, res, next) => {
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        req.session.destroy()
        res.redirect('/login')
        return
    }
    next()
})

router.get('/user', async (req, res) => {
    var user = await userController.findUser({ _id: req.session.uid })
    res.render('user.html', {
        user: user
    })
})

router.get('/user/info', async (req, res) => {
    var user = await userController.findUser({ _id: req.session.uid })
    console.log(user)
    res.render('info.html', {
        user: user
    })
})

var multipartMiddleware = multiparty({
    uploadDir: path.join(__dirname, '../temp')
})

router.post('/user/info', multipartMiddleware, async (req, res) => {
    try {
        var body = req.body
        var user = await userController.findUser({ _id: req.session.uid })
        var avatar = null
        console.log(req.files)
        if (JSON.stringify(req.files) !== '{}') {
            avatar = '/public/images/avatar/' + user._id + sd.format(new Date(), '_YYYYMMDDHHmmss') + path.extname(req.files.avatar.path)
            console.log(avatar)
            console.log(req.files.avatar.path, path.join(path.join(__dirname, '../', avatar)))
            await fs.rename(req.files.avatar.path, path.join(path.join(__dirname, '../', avatar)), (err) => {
                console.log('错误：' + err)
            })
        }
        updateList = {}
        if (body.nickname != 'false') {
            updateList.nickname = body.nickname
        }
        if (body.gender != 'false') {
            updateList.gender = body.gender
        }
        if (avatar != null) {
            updateList.avatar = avatar
        }
        console.log(updateList)
        var result = await userController.updateUser(user._id, updateList)
        console.log(result)
        // var now = await userController.findUser({_id: req.session.user._id})
        // console.log(now)
        // req.session.user = now
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (err) {
        console.log(err)
    }
})

router.get('/user/address', async (req, res) => {
    res.render('address.html')
})

router.get('/user/secure', async (req, res) => {
    res.send('OK')
})

module.exports = router
