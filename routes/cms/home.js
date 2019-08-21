const express = require('express')

const router = express.Router()

router.get('/cms', async (req, res) => {
    res.render('cms/home.html')
})

module.exports = router
