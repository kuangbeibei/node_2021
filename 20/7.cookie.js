const http = require('http');

const server = http.createServer((req, res) => {
    // 默认cookie就是一个header，默认会话结束后就销毁了，但可以配置失效时间

    // 设置cookie 参数
    // key/value/domain/path/maxAge/expires/httpOnly
    // 本地配置/etc/hosts，127.0.0.1对应的域名a.kk.cn和b.kk.cn，这样可以配置域下的cookie
    if (req.url === "/read") {
        res.end(req.headers['cookie']);
    } else if (req.url === "/write") {
        // res.setHeader('Set-Cookie', ["name=zf", "age=11"]);      // 最简单 没有高级配置

        // res.setHeader('Set-Cookie', ["name=zf; domain=kk.cn", "age=12"])              // domain=kk.cn这么设置，无论a.kk.cn还是b.kk.cn都能够访问到. domain限制域名，默认是当前的域名，就是完全比配一级域名二级域名，完全匹配当前域名才能够读到

        // res.setHeader('Set-Cookie', ["name=zf; domain=a.kk.cn", "age=12; path='/' "])   // path默认是，限制访问cookie的路径，一般用不到，因为很少这么限制具体的路径。

        // res.setHeader('Set-Cookie', ["name=kk; max-age=10"])        // max-age存活时间，以秒为单位。 expires 确切的某个时间点

        res.setHeader('Set-Cookie', ["name=kk; httpOnly=true"]) // 为了防止客户端篡改cookie，可以设置httpOnly，这样客户端直接通过document.cookie也读取不到，只是不能通过代码去做。不过呢？在application里面还是可以更改

        res.end('write ok');
    } else {
        res.end('NOT FOUND');
    }

    
});

server.listen(3000)

