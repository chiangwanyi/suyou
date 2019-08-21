# suyou.site

## 项目描述
一个移动端webapp

码云地址：[https://gitee.com/Chiangwanyi/suyou](https://gitee.com/Chiangwanyi/suyou)

## 开发环境
- IDE：VS Code + WebStorm
- 前端框架：WeUI 1.1.3 + jQuery WeUI 1.2.1 + jQuery 2.14.0 
- 后台框架：Node.js 10.15.3 + Express 4.16.4 + Nginx
- 数据库：MongoDB 3.6.11
- 服务器环境：CentOS 7.6


## 部署开发环境
- 安装 Node.js 10.14.2
- 将 Node.js 根目录添加到系统环境变量中的`path`中
- 安装 Git 并配置
- 在 [https://gitee.com/Chiangwanyi/suyou](https://gitee.com/Chiangwanyi/suyou) 上 clone 项目代码
- 在控制台执行`npm install -g cnpm --registry=https://registry.npm.taobao.org`，设置cnpm淘宝镜像
- 在项目根目录下执行`npm install`下载依赖库
- 数据库用户名与密码（目前连接数据库无需认证），以及连接配置在文件`/config/default.js`中
- 在控制台执行`npm install -g nodemon`，安装开发辅助工具
- 在项目根目录下执行`node app.js`，看到`HTTP server is running on http://localhost:3000`则说明web服务器启动成功

## 项目目录结构
| 目录名称          | 功能                    |
| ----------------- | ----------------------- |
| /config           | 相关参数文件目录        |
| /controllers      | 项目控制层`Controllers` |
| /https            | HTTPS协议证书文件目录   |
| /middlewares      | Express中间件           |
| /models           | 数据库实体`Models`      |
| /node_modules     | 依赖库                  |
| /public           | 项目公共资源            |
| /routes           | 路由器                  |
| /views            | 项目视图层`Views`       |
| .gitignore        | git 忽略配置文件        |
| app.js            | 项目入口                |
| package-lock.json | 项目依赖库来源和版本号  |
| package.json      | 项目信息                |
| README.md         | 项目文档                |

## `Models`设计

| 实体名称 | 功能 | 备注 |
| -------- | ---- | ---- |
|          |      |      |

## `Views`设计

| 页面名称 | 功能 | 备注          |
| -------- | ---- | ------------- |
| 404.html |      | 404 Not Found |
|          |      |               |

## `ControllerS`设计

| 名称 | 功能 | 备注 |
| ---- | ---- | ---- |
|      |      |      |

## `Router`设计

| 路径  | 请求方法 | 参数 | 权限控制 | 备注 |
| ----- | -------- | ---- | -------- | ---- |
| /home | get      |      |          | 主页 |

