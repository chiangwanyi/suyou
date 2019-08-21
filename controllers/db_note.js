const User = require('../models/user')
const Note = require('../models/note')
const DBconfig = require('../models/db_config')
const config = require('config-lite')(__dirname)
const md5 = require('blueimp-md5')
const mongoose = require('mongoose')

module.exports = {
    createNote: async (note) => {
        return await new Note(note).save()
    },

    getNotes: async (skip, limit) => {
        var result = await Note.find(
            {},
            null,
            {
                skip: skip,
                limit: limit,
                sort: { '_id': -1 }
            },
        ).exec()
        return result
    },

    getNoteById: async (note_id) => {
        var result = await Note.findById(note_id).exec()
        // console.log(result)
        return result
    },

    updateLike: async (info) => {
        if (info.type == 1) {
            var result = await Note.updateOne(
                { _id: info.note_id },
                {
                    $inc: { like_number: 1 },
                    $push: { likes_list: mongoose.Types.ObjectId(info.user_id) }
                }
            )
        } else {
            var result = await Note.updateOne(
                { _id: info.note_id },
                {
                    $inc: { like_number: -1 },
                    $pull: { likes_list: mongoose.Types.ObjectId(info.user_id) }
                }
            )
        }
        return result
    },

    updateComment: async (note_id, comment) => {
        var result = await Note.updateOne(
            { _id: note_id },
            {
                $inc: { comment_number: 1 },
                $push: { comments_list: comment }
            }
        )
        return result
    }
}
