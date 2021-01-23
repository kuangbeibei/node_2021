/**
 * 对比缓存
 */

const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const mime = require('mime');

const server = http.createServer((req, res) => {
    let {pathname} = url.parse(req.url);
    console.log('pathname', pathname);

    res.setHeader('Cache-Control', 'no-cache');

    let filepath = path.join(__dirname, pathname);
    fs.stat(filepath, (err, statObj) => {
        if (err) {
            res.statusCode = 404;
            res.end('NOT FOUND')
        } else {
            if (statObj.isFile()) {
                res.setHeader('Content-Type', mime.getType(filepath) + ";charset=utf-8");

                 // 在res这里设置了之后，浏览器再次请求就会在request headers上自动加上If-Modified-Since。但它有很多问题，1.可能文件并没有变化，但是修改时间变了。2.时间不精准。3.可能采用CDN，不同服务器上的时间和当前的时间不一样。CDN的访问是就近访问，你不知道从哪个地域的CDN去获取资源。
                 // 所以，对比缓存更可靠的是，读取文件内容，产生一个md5戳，用戳来校验。Etag，给文件产生一个指纹。
                if (req.headers['if-modified-since'] === statObj.ctime.toUTCString()) {                     // 首页可以被协商缓存
                    res.statusCode = 304;
                    res.end();              // 浏览器就会去找缓存
                } else {
                    res.setHeader('Last-Modified', statObj.ctime.toUTCString()); 
                    fs.createReadStream(filepath).pipe(res)
                }
            } else {
                res.statusCode = 404;
                res.end('NOT FOUND')
            }
        }
    })
})

server.listen(3000)