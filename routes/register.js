const express = require('express')
const userController = require('../controllers/db_user')

const router = express.Router()

// 渲染 register.html 页面
router.get('/register', (req, res) => {
    res.render('register.html')
})

// 处理 注册 请求
router.post('/register', async (req, res) => {
    var body = req.body
    try {
        // 查找是否已存在账号
        var result = await userController.findUser({ tel: body.tel })
        console.log('是否存在账号：'+result)

        if (result) {
            console.log('Email already exists.')

            return res.status(200).json({
                err_code: 1,
                message: 'Email already exists.'
            })
        } else {
            console.log('Email is ok.')

            // 创建账号
            // body.uid = await userController.getUID()
            var result =  await userController.createUser(body)
            console.log('创建的账号：'+result)
            await userController.setSignature({ uid: result.id })
            res.status(200).json({
                err_code: 0,
                message: 'OK'
            })
        }
    } catch (err) {
        console.log('错误：'+err)
        res.status(500).json({
            err_code: 500,
            message: 'ERROR'
        })
    }
})

module.exports = router
