const suyor = require('./suyor')

var temp1 = "今天想吃饭"
var temp2 = "今天想在永川吃饭"

// 原句：明天我想和朋友在永川聚餐
// var text = "明天还有想和格式友在永川聚餐"

module.exports = {
    check_setence: async (text) => {
        try {
            return suyor.dnnlmCn(text)
        } catch (err) {
            console.log(err)
        }
    },

    split_setence: async (text) => {
        try {
            return suyor.lexer(text)
        } catch (err) {
            console.log(err)            
        }
    }
}