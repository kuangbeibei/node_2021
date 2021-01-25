const express = require("./express");

const app = express();

app.use((req, res, next) => {
    let arr = [];
    req.on('data', chunk => {
        arr.push(chunk)
    });
    req.on('end', () => {
        req.body = Buffer.concat(arr).toString();   // 这样每个请求上都可以获取到req.body这个属性
        next('错啦')
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
    res.send(req.body);
    next()
})

app.get("/", (req, res, next) => {
    res.send({
        a: 1,
        b: 2
    })
})

app.use(function(err, req, res, next) {
    res.setHeader('Content-Type', "text/plain; charset=utf8");
    res.end(err)
})

app.listen(3000, () => {
    console.log('start~~')
})