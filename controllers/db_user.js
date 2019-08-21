const User = require('../models/user')
const Signature = require('../models/signature')
const config = require('config-lite')(__dirname)
const md5 = require('blueimp-md5')

module.exports = {
    /**
     * 查询用户
     * @param  {Object} condition 查询条件
     */
    findUser: async (condition) => {
        var result = await User.findOne(condition).exec()
        result = JSON.parse(JSON.stringify(result))
        return result
    },

    /**
     * 创建用户
     * @param  {Object} user 用户信息
     */
    createUser: async (user) => {
        // 用户密码加密
        user.password = md5(md5(user.password + config.MD5KEY))
        return await new User(user).save()
    },

    updateUser: async (uid, updateInfo) => {
        return await User.updateOne({ _id: uid }, updateInfo)
    },

    /**
     * 设置用户登录签名
     * @param  {Object} signatureInfo
     */
    setSignature: async (signatureInfo) => {
        console.log(signatureInfo)
        var result = await Signature.findOne({ uid: signatureInfo.uid }).exec()
        if (!result) {
            await Signature(signatureInfo).save()
            return
        }

        result = await Signature.updateOne(
            { uid: signatureInfo.uid },
            { $set: { sessionID: signatureInfo.sessionID } }
        )
    },


    /**
     * 用户登录验证
     * @param  {String} sessionID
     */
    checkUserLoging: async (sessionID) => {
        var status = 0
        var result = await Signature.findOne({ sessionID: sessionID }).exec()
        status = result ? 1 : 0
        return status
    },

    addNote: async (uid, noteId) => {
        var result = await User.updateOne(
            {_id: uid},
            {
                $push: {user_notes: noteId}
            }
        )
        return result
    }

    // getUID: async () => {
    //     var result = await DBconfig.findOneAndUpdate(
    //         { name: 'user_counter' },
    //         { $inc: { last_id: 1, } },
    //         { new: true }
    //     )
    //     return result.last_id
    // }
}
