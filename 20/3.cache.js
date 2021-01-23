/**
 * Etag对比缓存
 * 读取文件内容，产生一个md5戳，用戳来校验。Etag，给文件产生一个指纹。
 * 
 */


const crypto = require('crypto');   // node中所有的加密操作都用到这个包
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mime = require('mime');


const server = http.createServer((req, res) => {
    let {pathname} = url.parse(req.url, true);
    let filepath = path.join(__dirname, pathname);

    res.setHeader('Cache-Control', 'no-cache');

    fs.stat(filepath, (err, statObj) => {
        if (err || statObj.isDirectory()) {
            res.statusCode = 404;
            res.end('NOT FOUND')
        } else {
            res.setHeader('Content-Type', mime.getType(filepath) + "; charset=utf-8");
            let etag = crypto.createHash('md5').update(fs.readFileSync(filepath)).digest('base64');         // 但是读取整个文件耗费的时间长，一般情况下只会根据文件的部分内容去生成一个较容易计算的Etag。针对这个etag的生成有不同策略，例如nginx有自己的一套机制去生成。
            // Etag和Last-modified一起使用的时候，会都去比较，有一个不相同就会重新拉取资源。

            if (req.headers['if-none-match'] === etag) {
                res.statusCode = 304;
                res.end()
            } else {
                // Etag生成的方式有很多种，eg.文件的长度+文件的第几行
                res.setHeader('Etag', etag);
                fs.createReadStream(filepath).pipe(res)
            }
        }
    })
})

server.listen(3000)