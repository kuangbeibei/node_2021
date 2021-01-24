/**
 * 第一版
 * 简易实现是运用的对象的方式，但是对象不利于扩展，只能给对象添加属性。而不能去处理公有、私有特性
 */

const http = require('http');
const url = require('url');

let routes = [
    {
        path: '*',
        method: 'all',
        handler(req, res) {         // 默认的规则
            res.end(`Cannot ${req.method} ${req.url}`)
        }
    }
];
function createApplication() {
    return {
        get(path, handler) {
            routes.push({
                path,
                method: 'get',
                handler
            })
        },
        listen(...args) {   // 放在这里是因为只有当listen的时候才需要真正起服务
            const server = http.createServer((req, res) => {
                let {pathname} = url.parse(req.url);
                let requestMethod = req.method.toLowerCase();

                for (let i = 1; i < routes.length; i++) {
                    let {path, method, handler} = routes[i];
                    if (path === pathname && method === requestMethod) {    // 路径和方法都匹配才是真的匹配
                        return handler(req, res)
                    }
                }
                routes[0].handler(req, res)
            });
            server.listen(...args);
        }
    }
}

module.exports = createApplication