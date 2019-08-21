const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

mongoose.connect(config.mongodb, { useNewUrlParser: true })

const Schema = mongoose.Schema

var userSchema = new Schema({

    // 用户手机号
    tel: { type: String, required: true },
    // 用户昵称
    nickname: { type: String, required: true },
    // 用户邮箱
    email: { type: String },
    // 用户密码
    password: { type: String, required: true },
    // 用户等级
    level: { type: Number, default: 1, required: true },
    /** 
     * 用户类型
     *  0：普通用户
     *  1：商家
     *  2：管理员
     */
    auth: { type: Number, enum: [0, 1, 2], default: 0, required: true },
    // 账号创建时间
    creation_date: { type: Date, default: Date.now },
    // 账号最后修改日期
    last_modified_date: { type: Date, default: Date.now },
    // 用户头像
    avatar: { type: String, default: '/public/images/avatar/avatar-default.png' },
    /** 
     * 用户性别
     * 
     * -1：保密
     *  0：男
     *  1：女
     * */
    gender: { type: Number, enum: [-1, 0, 1], default: -1 },
    // 用户生日
    birthday: { type: Date, default: null },
    /**
     * 账号状态
     * 
     * -1：当前账号已注销
     *  0：当前账号正常
     *  1：当前账号...
     *  2：当前账号...
     */
    user_status: { type: Number, enum: [-1, 0, 1, 2], default: 0 },
    // 用户发帖ID
    user_notes: { type: Array, default: [] }
})

module.exports = mongoose.model('User', userSchema)
