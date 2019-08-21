const express = require('express')

const router = express.Router()

router.get('/cms/login', async (req, res) => {
    res.render('cms/login.html')
})

router.post('/cms/login', async (req, res) => {
    var body = req.body
    console.log(body)
    if (body.username == 'admin' && body.password == '123456') {
        res.status(200).json({
            code: 0,
            msg: 'OK'
        })
    } else {
        res.status(200).json({
            code: -1,
            msg: 'Login info is invalid.'
        })
    }
})

module.exports = router
