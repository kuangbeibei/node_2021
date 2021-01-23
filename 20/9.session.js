/**
 * 在对cookie进行了加盐之后，更进一步就是session了
 * session是让客户端篡改的cookie失效。cookie不存敏感信息，并给cookie加一些签名，保证cookie不被篡改(篡改后失效)
 * 在session中可以存放一些敏感信息
 * 
 * session就是放在服务端内存中，就是个对象。如果要做持久化就要放在数据库中
 */

 const http = require('http');
 const crypto = require('crypto');
 const queryString = require('querystring');
 const uuid = require('uuid');

 let salt = 'kk';

 function signed(val) {
     return crypto.createHmac('sha256', salt).update(val.toString()).digest('base64')
 }

 let session = {}; // 这个空间，这个内存，这个对象就是session。生命周期也是默认会话周期。服务器重启就是新的。session只是存在服务端的对象而已
 // session获取用户唯一标识，再去数据库查询用户的相关数据

 const server = http.createServer((req, res) => {
    //  在没有用到express、koa的时候，自己封装的话，得把所有逻辑放到这个回调里面去写
    req.getCookie = function (key, options = {}) {
        let cookieObj = queryString.parse(req.headers['cookie'], "; ")
        if (cookieObj[key] && options.signed) {
            let [val, sign] = cookieObj[key].split('.');  // 我们在设置的时候的自定义规则里有.
            console.log('get --', val, sign, sign === signed(val))
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


    let cardName = "connect.id";    // 会员卡

    if (req.url === '/money') {
        let cardId = req.getCookie(cardName);
        console.log('拿到cardId',cardId, '该cardId对应的session值',session[cardId]);
        if (cardId && session[cardId]) {
            session[cardId] = session[cardId] - 20
            res.end(session[cardId].toString())
        } else {
            let cardId = uuid.v4();
            res.setCookie(cardName, cardId, {
                httpOnly: true
            });
            session[cardId] = 100;
            console.log('cardId 111', cardId, session[cardId]);
            res.end('get money 100')
        }
    } else {
        res.statusCode = 404;
        res.end('NOT FOUND');
    }

 })

 server.listen(3000)