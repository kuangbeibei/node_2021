const express = require('./express');

let app = express();


// 路由中间件，在返回路由对应的响应之前做很多事情，比如鉴权、查询数据等。
// 洋葱模型
// 异步串联！

app.get("/", (req, res, next) => {
    console.log(1);
    next()
    console.log(4)
}, (req, res, next) => {
    console.log(2);
    next();
    console.log(5)
}, (req, res, next) => {
    console.log(3);
    next();
    console.log(6)
})

app.get("/", (req, res) => {
    res.end('home ok')
})

// app.post("/", (req, res) => {
//     res.end('home post ok')
// })

app.listen(3000, () => {
    console.log('start')
})