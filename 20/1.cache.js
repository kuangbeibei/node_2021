const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const mime = require('mime');

const server = http.createServer((req, res) => {
    let {pathname} = url.parse(req.url, true);


    console.log('pathname', pathname);
    // 直接访问的资源即html不会被浏览器强制缓存（但看2.cache.js，如果设置了会走协商哦），这是浏览器控制的。引用的资源才会被缓存。

    // 强制缓存，就是不发请求直接走缓存
    res.setHeader('Cache-Control', 'max-age=10')            //  浏览器会默认开启缓存的，如果控制台勾选了disable-cache需要把这个勾选的去掉。如果要存上M的大文件，要用indexDB
    res.setHeader('Expires', new Date(Date.now + 10*1000).toUTCString())                    //  兼容http 1.0，这个时间是绝对时间 
    
    // 不缓存
    res.setHeader('Cache-Control', 'no-cache');             //  浏览器缓存资源，但还是会向服务器发送请求。只是个商量。服务器回话，告诉浏览器是使用缓存资源还是发送新资源
    res.setHeader('Cache-Control', 'no-store');             //  真正的不缓存，每次都会去服务器请求资源

    // memory cache, disk cache，如果文件很久不被访问了，可能会降级放到disk cache中，从memory cache中读取更快
    // 风险就是服务端更改文件了，客户端还是老文件
    // 服务器要根据引用的资源来区分进行缓存，比如logo

    // 协商缓存，对比缓存。就是商量一下，还是会发请求。服务器通过headers告诉浏览器。
    
    
    

    let filepath = path.join(__dirname, pathname);
    fs.stat(filepath, (err, statObj) => {
        if (err) {
            res.statusCode = 404;
            res.end('Not Found');
        } else {
            if (statObj.isDirectory()) {
                res.statusCode = 404;
                res.end('Not Found');
            } else {
                res.setHeader('Content-Type', mime.getType(filepath) + ';charset=utf-8')
                fs.createReadStream(filepath).pipe(res)
            }
        }
    })
})

server.listen(3000)

