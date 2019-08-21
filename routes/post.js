const express = require('express')
const fs = require('fs')
const path = require('path')
const sd = require('silly-datetime')
const noteController = require('../controllers/db_note')
const userController = require('../controllers/db_user')
var multiparty = require('connect-multiparty');

const router = express.Router()

router.all(/^\/post.*/, async (req, res, next) => {
    console.log('判断用户权限')
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        console.log('pass')
        req.session.destroy()
        res.redirect('/login')
        return
    }
    console.log('success')
    next()
})

router.get('/post', async (req, res) => {
    res.render('post.html')
})

var multipartMiddleware = multiparty({
    uploadDir: path.join(__dirname, '../temp')
})

router.post('/post', multipartMiddleware, async (req, res) => {
    try {
        console.log(multipartMiddleware)
        var images_name = null
        console.log(req.body, req.files)
        if (JSON.stringify(req.files) !== '{}') {
            images_name = '/public/data/notes/images/' + req.session.uid + sd.format(new Date(), '_YYYYMMDDHHmmss') + path.extname(req.files.image.path)
            console.log(path.join(__dirname, path.join('../', images_name)))
            await fs.rename(req.files.image.path, path.join(__dirname, path.join('../', images_name)), (err) => {
                if (err) {
                    console.log(err)
                }
            })
        }
        var note = {
            uid: req.session.uid,
            creation_date: new Date(),
            text: req.body.text,
            image: images_name
        }
        console.log(note)
        // note.user = JSON.stringify(note.user)
        var result =  await noteController.createNote(note)
        console.log(result)
        result = await userController.addNote(req.session.uid, result._id)
        console.log(result)
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router
