/**
 * jwt (json web token)
 * 权限校验。可以实现跨域身份校验。session怎么跨域？如果有多个服务器想共享多个登录状态，就需要把session对象共享给多个服务器。session是内存对象，只能把session存到数据库中。但是数据库持久层也可能挂掉。总之用session还是要有地方去存这个数据才行。
 * 而jwt不需要session这样去找地方存储。它只是在客户端和服务端之间传输时来来回回带着。
 *      1. 可以跨域；
 *      2. 不需要像session那样存储在持久层，只需要在服务端存一个秘钥即可
 * 
 * jwt包含三部分：
 *      算法（SHA256）、
 *      payload（载荷）——签发人|过期时间|主题|受众|生效时间|签发时间|编号、
 *      签名（对前两部分的签名，防止数据被篡改） (base64UrlEncode(header)、base64UrlEncode(payload)、secret)
 * 
 * jwt作为一个token（令牌），可能被放到url上进行传输，但它基于base64内部有+/这样的符号，在url上的含义不同可能会造成混乱，所以还需要对jwt这个token做转码
 * 另外一种情况，是放在header中的Authorization，传送到服务器
 * 
 * jwt也是明文的，也不适合传输敏感信息。因为它也是基于base64转码的
 * 
 * jwt = 头（固定）.内容（自定义）.秘钥（）， 这三部分组成。前两段都是base64而已，是明文的，最后一个才是根据盐值秘钥处理过的
 * 
 * 了解两个包，一个简单的jwt-simple，一个复杂的jsonwebtoken
 * 
 * jwt核心就是看是否过期来校验用户权限
 */

const http = require('http');
const queryString = require('querystring');
const crypto = require('crypto');
// const jwt = require('jwt-simple');

const secret = "laobai";

const jwt = {
    sign(content, secret) {
        return this.escape(crypto.createHmac('sha256', secret).update(content).digest('base64'));
    },
    escape(content) {
        return content.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');    // jwt的规则这么定的，处理 + = /
    },
    unescape(str) {
        str += new Array(5 - str.length % 4).join('=');
        return str.replace(/\-/g, '+').replace(/_/g, '/');
    },
    toBase64(content) {
        return this.escape(Buffer.from(JSON.stringify(content)).toString('base64'))  // 直接 toString('base64')之后的格式可能会有 + = /，这些字符需要转化，以免jwt在url中使用的时候会被转译
    },
    encode(info, secret) {
        let header = this.toBase64({type: "JWT", alg: "HS256"});
        let content = this.toBase64(info);

        let sign = this.sign(header + '.' + content, secret);
        
        return header + '.' + content + '.' + sign
    },
    decode(token, secret) {
        let [header, content, sign] = token.split('.');
        let _sign = this.sign([header,content].join('.'), secret);
        if (_sign === sign) {
            // 反转content为info
            return JSON.parse(Buffer.from(this.unescape(content), 'base64').toString())
        } else {
            throw new Error('token decode error')
        }
    }
};

const server = http.createServer((req, res) => {
    // 登陆成功后颁发一个token给客户端
    if (req.url === "/login") {
        let arr = [];
        req.on('data', chunk => {       // 这里只有一个参数就是chunk
            arr.push(chunk)
        })
        req.on('end', () => {
            let content = Buffer.concat(arr).toString();
            let result;
            const headers = req.headers;
            if (headers['content-type'] === 'application/json') {
                result = JSON.parse(content);
            } else if (headers['content-type'] === 'application/x-www-form-urlencoded') {
                result = queryString.parse(content);
            }
            if ('admin' === result.username && 'admin' === result.password) {   // 假设的一个逻辑
                res.end(JSON.stringify({
                    message: '登陆成功',
                    token: jwt.encode({
                        exp: new Date(Date.now() + 60*1000),
                        username: 'admin'
                    }, secret)
                }))
            } else {
                res.end('没权限')
            }
            // jwt长这样：eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOiIyMDIxLTAxLTIyVDA3OjE5OjUyLjkxOFoiLCJ1c2VybmFtZSI6ImFkbWluIn0.PCABe3GGjQK1tzw3TTvNzVjCjLfF0eEauYgcwrbFBps
            //          eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJleHAiOiIyMDIxLTAxLTIyVDA3OjM4OjE4LjkxMFoiLCJ1c2VybmFtZSI6ImFkbWluIn0.wMZfY53DhWaVJeBMWvD-t76lrSF26gdTnEfF6HNKWog

            //  eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFMyNTYifQ.eyJleHAiOiIyMDIxLTAxLTIzVDAyOjA2OjQ5LjcxOFoiLCJ1c2VybmFtZSI6ImFkbWluIn0.ZpWU8A4S0RUv9VhVNLasdKM8IcqJPNJYc66LH9mZPXo
        })
    } else if (req.url === "/validate") {
        let auth = req.headers['authorization'];
        if (auth) {
            let [, token] = auth.split(' ');
            try {
                let payload = jwt.decode(token, secret); // 用秘钥去解码
                let exp = new Date(payload.exp).getTime();
                if (exp < Date.now()) {
                    // 一般在这里有两种处理方式：1. 返回一个新的token； 2. 让用户去登陆，但具体业务逻辑
                    res.end('token过期了')
                } else {
                    res.end('token 还在有效期')
                }
            } catch(e) {
                console.log('err',e);
                res.end(e);
            }
        }
    } else  {
        res.end('未登录')
    }
})

server.listen(3000)

 



