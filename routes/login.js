const express = require('express')
const config = require('config-lite')(__dirname)
const userController = require('../controllers/db_user')
const md5 = require('blueimp-md5')

const router = express.Router()

// 渲染 login.html 页面
router.get('/login', (req, res) => {
    res.render('login.html')
})

// 处理 登录 请求
router.post('/login', async (req, res) => {
    var body = req.body
    console.log(body)
    try {
        // 查找用户
        var result = await userController.findUser({
            tel: body.tel,
            password: md5(md5(body.password + config.MD5KEY))
        })
        if (result) {
            console.log('User login success')
            console.log(req.session,req.sessionID)
            req.session.uid = result._id
            console.log(result)
            await userController.setSignature({ uid: result._id, sessionID: req.sessionID })
            return res.status(200).json({
                err_code: 0,
                message: 'OK'
            })
        } else {
            console.log('Tel or password is invalid.')
            res.status(200).json({
                err_code: 1,
                message: 'Tel or password is invalid.'
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            err_code: 500,
            message: 'ERROR'
        })
    }
})

module.exports = router
