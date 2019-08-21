const express = require('express')
const nodejieba = require('nodejieba')
const userController = require('../controllers/db_user')
const restaurantController = require('../controllers/db_restaurant')
const mongoose = require('mongoose')
const suyor = require("../suyor/suyor")
const tools = require('../controllers/tools')

const router = express.Router()

nodejieba.load({
    userDict: './dict/user.utf8',
})

router.all(/^\/ai.*/, async (req, res, next) => {
    console.log('判断用户权限')
    var status = await userController.checkUserLoging(req.sessionID)
    if (!status) {
        console.log('to login')
        req.session.destroy()
        res.redirect('/login')
        return
    }
    console.log('success')
    next()
})

router.get('/ai', async (req, res) => {
    var user = await userController.findUser({ _id: req.session.uid })
    res.render('ai.html', {
        user: user
    })
})

router.post('/ai', async (req, res) => {
    var body = req.body
    console.log(body)

    if (body.step == 0) {
        res.status(200).json({
            step: 0,
            questions: ["你好我是智能机器人'小酥'", "我能为你推荐你想要的", "请输入您的需求"],
            pass: true,
            answers: {
                type: 'input',
                content: "输入您的需求，然后点击'确定'",
                reply: ['确定']
            }
        })
    } else if (body.step == 1) {
        if (body.reply.trim().length == 0) {
            return res.status(200).json({
                step: 0,
                questions: ["请不要输入空的需求哦", "小酥不知道您在想什么"],
                pass: false,
                answers: {
                    type: 'input',
                    content: "输入您的需求，然后点击'确定'",
                    reply: ['确定']
                }
            })
        }

        var result = nodejieba.tag(body.reply)

        console.log(result)
        var dnnPass = false
        if ((result[0].tag == 'food') || (result.length == 2 && result[0].tag == 'want' && result[1].tag == 'food')) {
            dnnPass = true
        }

        if (!dnnPass) {
            var result = await suyor.dnnlmCn(body.reply)
            console.log(result)
            if (result.ppl >= 200) {
                return res.status(200).json({
                    step: 0,
                    questions: ["不好意思呢，我不明白您的意思", "请再整理一下您的需求后再告诉我哦"],
                    pass: false,
                    answers: {
                        type: 'input',
                        content: "输入您的需求，然后点击'确定'",
                        reply: ['确定']
                    }
                })
            }
        }

        var main_info = {
            date: [],
            time: [],
            dinner: [],
            main_per: [],
            per: [],
            ns: [],
            scope: [],
            food: [],
            taste: [],
        }

        nodejieba.tag(body.reply).forEach(el => {
            const tag_list = ['date', 'time', 'dinner', 'main_per', 'per', 'ns', 'scope', 'food', 'taste']
            var index = tag_list.indexOf(el.tag)
            if (index != -1) {
                main_info[tag_list[index]].push(el.word)
            }
        })

        console.log(main_info)

        // 需求模型
        var require_list = {
            nop: null,          // 用餐人数：单人 0 | 多人 1
            date: [],           // 用餐日期：今天 0 | 明天 1 | 后天 2
            reserve: false,     // 是否预订
            time: null,         // 用餐时段：上午 0 | 中午 1 | 下午 2
            loc: [],            // 用餐地址
            scope: 0,           // 是否按照半径选择餐厅：0 表示不按照半径进行搜索 -1 表示不在所在地
            basic_taste: null,  // 用餐食物基本口味：清淡 0 | 非清淡 1  | 均可 2
            ave_price: -1,      // 人均消费：-1 表示不考虑
            food: null,         // 具体食物：为空表示不按照具体食物搜索餐厅
        }

        // 提问列表
        var question_list = []

        // 处理用餐人数
        if (main_info.main_per.length == 0 && main_info.per.length == 0) {
            question_list.push('nop')
        } else if (main_info.main_per.length == 1 && main_info.main_per[0] == '我' && main_info.per.length == 0) {
            require_list.nop = 0
        } else if (main_info.per.length != 0) {
            require_list.nop = 1
        } else {
            question_list.push('nop')
        }

        // 处理用餐日期
        if (main_info.date.length == 0) {
            question_list.push('date')
        } else if (main_info.date.length > 1) {
            question_list.push('date')
        } else if (['今天', '今日'].includes(main_info.date[0])) {
            require_list.date = 0
            require_list.reserve = false
        } else if (['明天', '明日'].includes(main_info.date[0])) {
            require_list.date = 1
            require_list.reserve = true
        } else if (['后天'].includes(main_info.date[0])) {
            require_list.date = 2
            require_list.reserve = true
        } else {
            question_list.push('date')
        }

        // 处理用餐时段
        if ((main_info.time.length == 0 && main_info.dinner.length == 0) || (main_info.time.length > 1 && main_info.dinner.length > 1)) {
            question_list.push('time')
        } else if (main_info.time.length == 1 && main_info.dinner.length == 0) {
            if (['清晨', '早上', '早晨', '早间', '上午'].includes(main_info.time[0])) {
                require_list.time = 0
            } else if (['中午', '午间'].includes(main_info.time[0])) {
                require_list.time = 1
            } else if (['下午', '傍晚', '晚上', '晚间', '凌晨'].includes(main_info.time[0])) {
                require_list.time = 2
            }
        } else if (main_info.time.length == 0 && main_info.dinner.length == 1) {
            if (['早饭', '早餐', '早点'].includes(main_info.dinner[0])) {
                require_list.time = 0
            } else if (['午餐', '午饭', '中午饭'].includes(main_info.dinner[0])) {
                require_list.time = 1
            } else if (['晚饭', '晚餐', '夜宵'].includes(main_info.dinner[0])) {
                require_list.time = 2
            }
        } else if (main_info.time.length == 1 && main_info.dinner.length == 1) {
            if (['清晨', '早上', '早晨', '早间', '上午'].includes(main_info.time[0])) {
                if (!['早饭', '早餐', '早点'].includes(main_info.dinner[0])) {
                    question_list.push('time')
                }
            } else if (['中午', '午间'].includes(main_info.time[0])) {
                if (!['午餐', '午饭', '中午饭'].includes(main_info.dinner[0])) {
                    question_list.push('time')
                }
            } else if (['下午', '傍晚', '晚上', '晚间', '凌晨'].includes(main_info.time[0])) {
                if (!['晚饭', '晚餐', '夜宵'].includes(main_info.dinner[0])) {
                    question_list.push('time')
                }
            }
        }

        const location = '芜湖'
        const scope_range = 10000

        // 处理用餐位置
        if (main_info.ns.length == 0 && main_info.scope.length != 0) {
            for (let i in main_info.scope) {
                if (['当地', '本地', '本市', '周边', '附近', '旁边', '周围',].includes(main_info.scope[i])) {
                    require_list.scope = scope_range
                    break
                }
            }
        } else if (main_info.ns.length != 0) {
            for (var i = 0; i < main_info.ns.length; i++) {
                if (main_info.ns[i].search(location) != -1) {
                    require_list.loc.push(location)
                    require_list.scope = 0
                    break
                }
            }
            if (i == main_info.ns.length) {
                require_list.loc = main_info.ns
                require_list.scope = -1
                question_list.push('scope')
            }
        } else {
            question_list.push('scope')
        }

        // 处理基本口味
        if (main_info.taste.length == 1 && main_info.food.length == 0) {
            const light = ['清汤', '清蒸', '清淡',]
            const non_light = ['麻辣', '红汤',]
            if (light.includes(main_info.taste[0])) {
                require_list.basic_taste = 0
            } else if (non_light.includes(main_info.taste[0])) {
                require_list.basic_taste = 1
            } else {
                require_list.basic_taste = 2
                question_list.push('basic_taste')
            }
        } else if (main_info.food.length == 1) {
            // 从数据库调取
            var light_food = ['清汤米线']
            var non_light_food = ['麻辣鱼']
            if (light_food.includes(main_info.food[0])) {
                require_list.basic_taste = 0
            } else if (non_light_food.includes(main_info.food[0])) {
                require_list.basic_taste = 1
            } else {
                require_list.basic_taste = 2
                question_list.push('basic_taste')
            }
        } else {
            question_list.push('basic_taste')
        }

        // 处理食物
        if (main_info.food.length != 1) {
            question_list.push('food')
        } else {
            require_list.food = main_info.food[0]
        }

        question_list.push('ave_price')

        console.log('\n======需求列表======')
        req.session.require_list = require_list
        console.log(require_list)

        const dialogue = [
            {
                name: 'nop',
                questions: [
                    ['请问一共有多少人用餐？'],
                    ['请问用餐的人数有多少？'],
                    ['请问用餐大概有多少呢？']
                ],
                answer: {
                    type: 'select',
                    contents: [
                        ['单人', '多人'],
                        ['一个人', '两人', '更多']
                    ]
                }
            },
            {
                name: 'date',
                questions: [
                    ['请问您想什么时候用餐？'],
                    ['请问您准备什么时候用餐？']
                ],
                answer: {
                    type: 'select',
                    contents: [
                        ['今天', '明天', '后天']
                    ]
                }
            },
            {
                name: 'time',
                questions: [
                    ['请问您准备什么时间段用餐？'],
                    ['请问您想在这天的什么时间段用餐？']
                ],
                answer: {
                    type: 'select',
                    contents: [
                        ['上午', '中午', '下午']
                    ]
                }
            },
            {
                name: 'scope',
                questions: [
                    ['请问您的用餐范围？'],
                    ['请问您的用餐地点在什么地方？']
                ],
                answer: {
                    type: 'select',
                    contents: [
                        ['本市', '我的位置附近']
                    ]
                }
            },
            {
                name: 'basic_taste',
                questions: [
                    ['请问您的基本口味是什么？']
                ],
                answer: {
                    type: 'select',
                    contents: [
                        ['清淡', '不清淡', '都行'],
                        ['不辣', '比较辣', '均可']
                    ]
                }
            },
            {
                name: 'ave_price',
                questions: [
                    ['请问您期望的人均用餐价位是多少？']
                ],
                answer: {
                    type: 'select',
                    contents: [
                        ['小于50', '小于100', '其他']
                    ]
                }
            }
        ]

        var final_qa_list = []

        for (let i in question_list) {
            for (let j in dialogue) {
                if (dialogue[j].name == question_list[i]) {
                    final_qa_list.push({
                        name: dialogue[j].name,
                        questions: dialogue[j].questions[Math.round(Math.random() * (dialogue[j].questions.length - 1))],
                        answers: {
                            type: dialogue[j].answer.type,
                            content: dialogue[j].answer.contents[Math.round(Math.random() * (dialogue[j].answer.contents.length - 1))]
                        },
                        reply: null
                    })
                }
            }
        }

        res.status(200).json({
            step: 2,
            final_qa_list: final_qa_list
        })
    } else {
        console.log('需求模型')

        var require_list = req.session.require_list
        var location = JSON.parse(body.location)
        req.session.location = location
        var reply_list = JSON.parse(body.reply_list)

        for (let i in reply_list) {
            if (reply_list[i].name == 'nop') {
                if (['单人', '一人'].includes(reply_list[i].reply)) {
                    require_list.nop = 0
                } else {
                    require_list.nop = 1
                }
            } else if (reply_list[i].name == 'date') {
                if (['今天'].includes(reply_list[i].reply)) {
                    require_list.date = 0
                } else if (['明天'].includes(reply_list[i].reply)) {
                    require_list.date = 1
                } else {
                    require_list.date = 2
                }
            } else if (reply_list[i].name == 'time') {
                if (['上午'].includes(reply_list[i].reply)) {
                    require_list.time = 0
                } else if (['中午'].includes(reply_list[i].reply)) {
                    require_list.time = 1
                } else {
                    require_list.time = 2
                }
            } else if (reply_list[i].name == 'scope') {
                if (['本市'].includes(reply_list[i].reply)) {
                    require_list.scope = 0
                } else {
                    require_list.scope = 10000
                }
            } else if (reply_list[i].name == 'basic_taste') {
                if (['清淡', '不辣'].includes(reply_list[i].reply)) {
                    require_list.basic_taste = 0
                } else if (['不清淡', '比较辣'].includes(reply_list[i].reply)) {
                    require_list.basic_taste = 1
                } else {
                    require_list.basic_taste = 2
                }
            } else if (reply_list[i].name == 'ave_price') {
                if (reply_list[i].reply == '小于50') {
                    require_list.ave_price = 50
                } else if (reply_list[i].reply == '小于100') {
                    require_list.ave_price = 100
                } else {
                    require_list.ave_price = -1
                }
            }
        }
        console.log('========最终========')
        console.log(require_list)
        req.session.require_list = require_list
        var query = {
            onop: require_list.nop,
            basic_taste: require_list.basic_taste,
            ave_price: require_list.ave_price == -1 ? 100000 : require_list.ave_price
        }
        var recommend_list = {
            key: mongoose.Types.ObjectId(),
            first_list: [],
            second_list: []
        }

        var set = new Set()

        if (require_list.food != null) {
            var result = await restaurantController.getRestaurantsByFoodInName(require_list.food)
            var searchByNameList = JSON.parse(JSON.stringify(result))
            console.log(searchByNameList.length)
            for (let i in searchByNameList) {
                set.add(searchByNameList[i].name)
            }
            var result = await restaurantController.getRestaurantsIdByTagKey(require_list.food)
            var searchByTagList = []
            for (let i in result) {
                var li = await restaurantController.getRestaurantsByTagId(result[i]._id)
                searchByTagList = searchByTagList.concat(JSON.parse(JSON.stringify(li)))
            }
            for (let i in searchByTagList) {
                set.add(searchByTagList[i].name)
            }
            var nameList = Array.from(set)
            var allList = searchByNameList.concat(searchByTagList)
            for (let i = 0; i < nameList.length; i++) {
                for (let j in allList) {
                    if (nameList[i] == allList[j].name) {
                        allList[j].distance = Math.round(tools.getDistance(location.lng, location.lat, allList[j].coordinate[0], allList[j].coordinate[1]))
                        recommend_list.first_list.push(allList[j])
                        break
                    }
                }
            }

            recommend_list.first_list.sort((a, b) => {
                return b.hot - a.hot
            })

            for (let i in recommend_list.first_list) {
                recommend_list.first_list[i].hot = Math.round(recommend_list.first_list[i].hot / 100 * 5)
            }

            for (let i in recommend_list.first_list) {
                for (let j in recommend_list.first_list[i].business_time) {
                    let time = String(recommend_list.first_list[i].business_time[j]).split('.')
                    if (time.length == 1) {
                        recommend_list.first_list[i].business_time[j] = time[0] + ":00"
                    } else {
                        let m = time[1]
                        if (Number(m) < 6) {
                            m = ":" + m + "0"
                        }
                        recommend_list.first_list[i].business_time[j] = time[0] + m
                    }
                }
            }
        }

        var result = await restaurantController.getRestaurantsByBasicInfo(query)
        result = JSON.parse(JSON.stringify(result))
        var nameList = Array.from(set)
        for (let i in result) {
            if (!nameList.includes(result[i].name)) {
                result[i].distance = Math.round(tools.getDistance(location.lng, location.lat, result[i].coordinate[0], result[i].coordinate[1]))
                recommend_list.second_list.push(result[i])
            }
        }

        for (let i in recommend_list.second_list) {
            recommend_list.second_list[i].hot = Math.round(recommend_list.second_list[i].hot / 100 * 5)
        }

        for (let i in recommend_list.second_list) {
            for (let j in recommend_list.second_list[i].business_time) {
                let time = String(recommend_list.second_list[i].business_time[j]).split('.')
                if (time.length == 1) {
                    recommend_list.second_list[i].business_time[j] = time[0] + ":00"
                } else {
                    let m = time[1]
                    if (Number(m) < 6) {
                        m = ":" + m + "0"
                    }
                    recommend_list.second_list[i].business_time[j] = time[0] + m
                }
            }
        }

        req.session.recommend_list = recommend_list
        res.status(200).json({
            code: 0,
            key: recommend_list.key
        })
    }
})

module.exports = router