const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const {
    readFileSync
} = require('fs');
const {
    createReadStream,
    createWriteStream
} = require('fs');
const url = require('url');
const chalk = require('chalk');
const mime = require('mime');
const ejs = require('./ejs'); // 模版引擎没有什么明显好坏，nuljunks，handlebar，art-template都可以，看习惯

const crypto = require('crypto');

// (async function() {
//     let r = await ejs.renderFile(path.resolve(__dirname, './template.html'), {arr: [1,2,3]});
//     console.log('r',r)
// })()

class Server {
    constructor(options) {
        this.port = options.port;
        this.directory = options.directory;
        this.cache = options.cache;
    }
    async handleRequest(req, res) {
        let {
            pathname
        } = url.parse(req.url, true);
        pathname = decodeURIComponent(pathname);

        let requestUrl = path.join(this.directory, pathname); // 路径带 / 的不要用resolve，会回到根路径

        try {
            const statObj = await fs.stat(requestUrl);
            if (statObj.isDirectory()) {
                // 像http-server是直接用进程的 ls -al 把目录下展示的东西发送到网页的

                // http是基于tcp的，它传输的大小和node中的读写大小是不一样的。node中之前说到过是16k，64k。但是http完全是根据tcp来的，看浏览器的接收容量。tcp肯定是分段的，看带宽的，看网速。如果是分段传输的在Response-Header上会有Transfer-Encoding: chunked告诉你

                let dirs = await fs.readdir(requestUrl);

                let content = await ejs.renderFile(path.resolve(__dirname, './template.html'), {
                    arr: dirs.map(dir => ({
                        name: dir,
                        pathname: path.join(pathname, dir)
                    }))
                });

                this.sendDir(res, content);

            } else {
                this.sendFile(requestUrl, req, res, statObj)
            }

        } catch (e) {
            // 有时候可能有个favicon.ico，这个是浏览器默认发的
            console.log(e);
            this.sendError(e, req, res)
        }

    }
    sendDir(res, content) {
        res.setHeader('Content-Type', `text/html; charset=utf-8`);
        res.end(content)
    }
    sendFile(filepath, req, res, statObj) {
        if (this.cachefile(filepath, req, res, statObj)) {
            res.statusCode = 304;
            return res.end();
        } else {
            res.setHeader('Cache-Control', 'max-age=10'); // 10s之内走强制缓存
            res.setHeader('Content-Type', `${mime.getType(filepath)}; charset=utf-8`); // 这里不能写死Content-Type，不然无法解析多种文件类型。mime模块
            createReadStream(filepath).pipe(res); // res.end /res.write，从可读流pipe到可写流
        }
    }
    cachefile(filepath, req, res, statObj) {
        const headers = req.headers;
        res.setHeader('Last-Modified', statObj.ctime.toUTCString());
        let etag = crypto.createHash('md5').update(readFileSync(filepath)).digest('base64');
        res.setHeader('Etag', etag);
        if (headers['if-modified-since'] !== statObj.ctime.toUTCString()) {
            return false;
        }

        if (headers['if-none-match'] !== etag) {
            return false
        }
        return true;
    }
    sendError(err, req, res) {
        res.statusCode = 404;
        res.end('Not Found')
    }
    start() {
        const server = http.createServer((req, res) => this.handleRequest(req, res))
        // this.handleRequest.bind(this)

        server.listen(this.port, () => {
            console.log(`${chalk.yellow("starting up kk-http-server, serving")}`)
            console.log(`   http://127.0.0.1:${chalk.green(this.port)}`)
        })
    }
}

module.exports = Server;