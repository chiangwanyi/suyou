const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)

if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.mongodb, { useNewUrlParser: true })
}

const Schema = mongoose.Schema

var restaurantSchema = new Schema({
    /**
     * 基本信息
     */
    // 餐厅名称
    name: { type: String, required: true },
    // 餐厅缩略图
    img: { type: String },
    // 餐厅人气指数（随机生成）
    hot: { type: Number },
    // 人均消费
    ave_price: { type: Number, required: true },
    // 餐厅标签
    tag: { type: mongoose.Types.ObjectId, required: true },
    // 餐厅简略位置
    brief_position: { type: String, required: true },
    // 餐厅详细地址
    address: { type: String, required: true },
    // 餐厅所属城市
    city: { type: String, required: true },
    // 餐厅联系电话
    tel: { type: String, required: true },
    // 餐厅地图坐标
    coordinate: { type: Array, required: true, default: [0.0, 0.0] },

    /**
     * 基本筛选信息
     */
    // 餐厅营业时间
    business_time: { type: Array, required: true, default: [9.00, 20.00] },
    // 餐厅用餐时间服务类别
    service_type: { type: Number, required: true, enum: [0, 1], default: 0 },
    // 餐厅食物基本口味
    basic_taste: { type: Number, required: true, enum: [0, 1, 2], default: 0 },
    // 最佳用餐人数（Optimal number of people）
    onop: { type: Number, required: true, enum: [0, 1, 2], default: 0 },

    /**
     * 商品信息
     */
    menu_list: { type: Array, default: [] },
    voucher_list: { type: Array, default: [] },
})

module.exports = mongoose.model("restaurant", restaurantSchema)
