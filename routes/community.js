const express = require('express')
const noteController = require('../controllers/db_note')
const userController = require('../controllers/db_user')
const urllib = require('url')
const sd = require('silly-datetime')

const router = express.Router()

router.get('/community', async (req, res) => {
    var notes = await noteController.getNotes(0, 5)
    var notes = JSON.parse(JSON.stringify(notes))
    for (var i = 0; i < notes.length; i++) {
        notes[i].user = await userController.findUser({_id: notes[i].uid})
        if (req.session.uid && notes[i].likes_list.indexOf(req.session.uid) != -1) {
            notes[i].like = true
        } else {
            notes[i].like = false
        }
    }
    console.log('推送了' + notes.length + '篇贴子')
    console.log(notes)
    var user = null
    if (req.session.uid) {
        user = await userController.findUser({_id: req.session.uid})
    }
    notes = JSON.parse(JSON.stringify(notes))
    res.render('community.html', {
        user: user,
        notes: notes
    })
})

router.post('/community', async (req, res) => {
    try {
        var body = req.body
        body.user_id = req.session.uid
        var result = await noteController.updateLike(body)
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (err) {
        console.log(err)
    }
})

router.all(/^\/community\/comment.*/, async (req, res, next) => {
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        req.session.destroy()
        res.redirect('/login')
        return
    }
    next()
})

router.get('/community/comment', async (req, res) => {
    try {
        var result = await noteController.getNoteById(urllib.parse(req.url, true).query.note_id)
        if (result == null) {
            res.redirect('/community')
            return
        }
        result = JSON.parse(JSON.stringify(result))
        result.user = await userController.findUser({_id: result.uid})
        for(var i = 0;i < result.comments_list.length;i++) {
            result.comments_list[i].comment_user = await userController.findUser({_id: result.comments_list[i].comment_uid})
            console.log(result.comments_list[i])
        }
        result = JSON.parse(JSON.stringify(result))
        res.render('comment.html', {
            note: result,
        })
    } catch (err) {
        console.log(err)
        res.redirect('/community')
        return
    }
})

router.post('/community/comment', async (req, res) => {
    var body = req.body
    console.log('输入的评论：',body)
    console.log('登录的用户',req.session.uid)
    var comment = {
        text: body.text,
        comment_uid: req.session.uid,
        creation_date: sd.format(new Date(), 'HH:mm:ss  YYYY-MM-DD')
    }
    var result = await noteController.updateComment(body.note_id, comment)
    console.log(result)
    res.status(200).json({
        err_code: 0,
        message: 'OK'
    })

})

module.exports = router
