const express = require('express')
const test = require('../suyor/test')

const router = express.Router()

router.get('/suyor', async (req, res) => {
    res.render('suyor.html')
})

router.post('/suyor', async (req, res) => {
    try {
        var body = req.body
        console.log(body)
        var check = await test.check_setence(body.text)
        console.log(check)
        var reply = null;
        if (check.ppl > 1500) {
            reply = '对不起，我不知道你想说啥子'
        } else {
            reply = '语文及格了'
            var result = await test.split_setence(body.text)
            console.log(result)
        }
        res.status(200).json({
            err_code: 0,
            text: reply
        })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router
