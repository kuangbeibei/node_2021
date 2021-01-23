/**
 * 实现静态服务
 */

const http = require('http');
const url = require('url');     //  原理就是根据正则匹配

console.log(url.parse('http://username:password@www.zhufeng.com:80/index.html?a=1&b=2#hash', true))     // true就是让query变成对象

const server = http.createServer((req, res) => {        
    
    // http是基于tcp的，在tcp的基础上再次封装添加了内容。内容被分割后，被放到req和res上。req是可读流，res是可写流
    // 请求行、请求头、请求体
    
    // ————————————————————————————————————————————————请求行——————————————————————————————————————————————————
    console.log(req.method, req.url, req.httpVersion);

    let {pathname, query} = url.parse(req.url, true);
    console.log(pathname, query)

    // 根据不同的请求路径做对应的处理，但要记住！不要让主线程做很耗费CPU的工作，比如计算。因为node是单线程的，如果同事开两个或两个以上tab，访问不同路径，其中包含大量计算的路径，这样别的路径也会打不开，知道sum这个即算完成之后才会正常显示。或者sum这个计算无法完成挂掉之后，其他页面才会正常显示。
    // 说白了，node适合io密集型，不适合cpu密集型
    // 如果要做计算，也应该放到子进程里面去做，或者ipc实现
    // if (pathname === '/sum') {
    //     let sum = 0;
    //     for (let i = 0; i < 100000000000; i++) {
    //         sum += i
    //     }
    //     res.end(sum)
    // } else {
    //     res.end('hello')
    // }


    // ————————————————————————————————————————————————请求头——————————————————————————————————————————————————

    // 特点就是key value都是小写
    console.log('headers', req.headers)
    let arr = [];
    req.on('data', (chunk) => {             // curl -v -X POST -d "a=1&b=2" http://localhost:3000 用post方法测试请求体
        // 传输的数据永远是字节流
        arr.push(chunk)
    })
    req.on('end', () => {   // end方法无论请求体是否有都会执行。因为在可读流里面，如果没有内容了，会push null，表示传完了。
        console.log(Buffer.concat(arr).toString())
    })

    
    // 响应行、响应头、响应体
    // ————————————————————————————————————————————————响应行——————————————————————————————————————————————————
    res.statusCode = 200;
    res.statusMessage = "good";

    // ————————————————————————————————————————————————响应头——————————————————————————————————————————————————
    res.setHeader("Auth", "kkk");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    // ————————————————————————————————————————————————响应体——————————————————————————————————————————————————
    res.write('再见')
    res.end('bye~')

});

// server.on('request', (req, res) => {
//     console.log('request')
// })

// 上面两次都会走的，因为内部就是发布订阅.

let port = 3000;

server.listen(port, () => {
    console.log(`server start ${port}`)
})

server.on('error', (err) => {           // 以防port被占用
    if (err.errno === "EADDRINUSE") {
        server.listen(++port)
    }
})