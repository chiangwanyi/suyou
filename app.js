const express = require('express')
const session = require('express-session')
const path = require('path')
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongo')(session)
const config = require('config-lite')(__dirname)
const router = require('./routes')
const browser = require('./middlewares/browser')

const app = express()

app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/temp/', express.static(path.join(__dirname, './temp/')))

app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views'))

app.use(bodyParser.urlencoded({ extended: false }))

// 配置 session
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: config.session.maxAge,
    },
    store: new MongoStore({
        url: config.mongodb
    })
}))

// 配置路由
router(app)

// 处理非法路径
app.use(browser.handleNotFound)

// 监听 3000 端口
app.listen(config.PORT, () => {
    console.log('HTTP server is running on http://localhost:3000')
})
