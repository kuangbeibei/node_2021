/**
 * 
 * 1. 原生node处理请求接口用if else写很多，express内置路由功能
 * 2. 原生node对cookie这种没有封装要自己写，我们扩展req.getCookie, res.setCookie，express对req和res进行了扩展强化
 * 3. express还有一个特点就是它可以通过中间件进行扩展（中间件的目的是为了扩展功能）
 * 
 * 总结，express对node核心模块http进行了封装，并且对其内部req、res进行扩展，而且还帮我们提供了非常方便的扩展方法，扩展了路由系统、中间件
 * 
 * express开发的比较早，所以内部没有用到class类的写法，它更多是用构造函数去模拟类，写法也是es5，没有es6
 * 
 */

const express = require('./express');

const app = express(); // 创建一个应用

// 从上到下进行匹配的
app.get("/", (req, res) => {
    res.end('home')
})

app.get("/login", (req, res) => {
    res.end('login')
})

// all方法表示任意方法都可以走这里，“*“是匹配任意路径。express是从上到下进行匹配，如果上面的都没有匹配到走最后这里，它是兜底儿的。
// app.all('*', (req, res) => {
//     res.end(404);
// })

app.listen(3000, () => {
    console.log(`server start at 3000`)
})