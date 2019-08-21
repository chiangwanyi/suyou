const express = require('express')
const userController = require('../controllers/db_user')

const router = express.Router()

router.all(/^\/logout.*/, async (req, res, next) => {
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        req.session.destroy()
        res.redirect('/login')
        return
    }
    next()
})

router.get('/logout', async (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

module.exports = router
