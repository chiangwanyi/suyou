const express = require('express')

const router = express.Router()

router.get('/find', async (req, res) => {
    res.render('find.html')
})

router.get('/find/passage', async (req, res) => {
    res.render('passage.html')
})

router.post('/find/passage', async (req, res) => {
    res.status(200).json({
        time: ['上午', '中午', '下午', '夜晚'],
        type: ['单人', '多人'],
        message: 'OK'
    })
})

module.exports = router
