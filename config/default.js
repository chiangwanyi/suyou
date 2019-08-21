module.exports = {

    // HTTP 端口
    PORT: 3000,

    // HTTPS 端口
    SSLPORT: 443,

    // MD5 Salt
    MD5KEY: 'undefined',

    session: {
        secret: 'Link Start',
        key: 'suyou',

        // session 过期时间：7天
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    
    // 远程本地数据库测试
    // mongodb: 'mongodb://suyou:cqwu2019@localhost:27017/suyou',

    // 本地数据库测试
    mongodb: 'mongodb://localhost:27017/suyou',
}