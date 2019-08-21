const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

mongoose.connect(config.mongodb, { useNewUrlParser: true })

const Schema = mongoose.Schema

var noteSchema = new Schema({
    // 发帖人ID
    uid: { type: mongoose.Types.ObjectId, required: true },
    // 发帖时间
    creation_date: { type: Date, default: Date.now },
    // 发帖文字内容
    text: { type: String, required: true },
    // 发帖图片路径
    image: { type: String, default: null },
    // 评论数
    comment_number: { type: Number, default: 0 },
    // 评论人 ID
    comments_list: { type: Array, default: [] },
    // 点赞数
    like_number: { type: Number, default: 0 },
    // 点赞人 ID
    likes_list: { type: Array, default: [] }
})

module.exports = mongoose.model('Note', noteSchema)
