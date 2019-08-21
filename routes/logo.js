const express = require('express')

const router = express.Router()

router.get('/logo', async (req, res) => {
    res.render('logo.html')
})

module.exports = router
