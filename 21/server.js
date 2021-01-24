const express = require("./express");

const app = express();

app.use((req, rex, next) => {
    let arr = [];
    req.on('data', chunk => {
        arr.push(chunk)
    });
    req.on('end', () => {
        req.body = Buffer.concat(arr).toString();   // 这样每个请求上都可以获取到req.body这个属性
        next()
    })
})

app.use((req, res, next) => {
    res.send = function(data) {
        if (typeof data === 'object') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data))
        }
    }
    next()  // 必须调用next才会向下执行
})

app.post("/", (req, res, next) => {
    console.log('req.body',req.body)
    res.send(req.body)
})

app.get("/", (req, res, next) => {
    res.send({
        a: 1,
        b: 2
    })
})

app.listen(3000, () => {
    console.log('start~~')
})