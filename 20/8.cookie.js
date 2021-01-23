/**
 * 封装cookie
 * 从cookie到session
 *      cookie不存敏感信息，并给cookie加一些签名，保证cookie不被篡改(篡改后失效)
 * jwt实现原理
 */

const http = require('http');
const queryString = require('querystring');             // node核心包，内置的，qs需要安装
const crypto = require('crypto');

const salt = 'wje'; // 可以通过openssl生成一个1024字节的秘钥salt，只在服务端存着。这个盐值是没办法通过加盐后的值和算法去反推的。https的公钥、私钥也是通过openssl生成的

function signed(value) {
    return crypto.createHmac('sha256', salt).update(value.toString()).digest('base64')
}

const server = http.createServer((req, res) => {

    //  在没有用到express、koa的时候，自己封装的话，得把所有逻辑放到这个回调里面去写
    req.getCookie = function (key, options = {}) {
        let cookieObj = queryString.parse(req.headers['cookie'], "; ")
        if (options.signed) {
            let [val, sign] = (cookieObj[key]).split('.');  // 我们在设置的时候的自定义规则里有.
            if (sign === signed(val)) {
                return val;
            } else {
                return 'forbidden'
            }
        } else {
            return cookieObj[key] || '';
        }
    }

    let cookies = [];

    res.setCookie = function (key, val, config = {}) {
        let options = [];
        if (config.maxAge) {
            options.push(`max-age=${config[config.maxAge]}`)
        } 
        
        if (config.path) {
            options.push(`path=${config.path}`)
        }
        
        if (typeof config.httpOnly === 'boolean') {
            options.push(`httpOnly=${config.httpOnly}`)
        }

        if (config.signed) {
            val = val + '.' + signed(val);
        }

        cookies.push(`${key}=${val}; ${options.join("; ")}`);

        res.setHeader('Set-Cookie', cookies);
    }

    if (req.url === '/read') {

        res.end(req.getCookie('crypto', {
            signed: true                            // get时候的标识，加盐了
        }))

    } else if (req.url === '/write') {

        res.setCookie('name', 'kk', {
            'max-age': 10
        });

        res.setCookie('age', 10, {
            path: '/',
            httpOnly: true
        })

        res.setCookie('crypto', 'laobai', {
            signed: true                            // set时候的标识，加盐了
        })

        res.end('set cookie ok')

    } else {
        res.statusCode = 404;
        res.end('NOT FOUND');
    }
});

server.listen(3000)