/**
 * 路由系统维护了一个栈结构
 */

const url = require('url');

function Router() {
    this.stack = [   // express原生就支持路由系统，就是这么来的。每次express()执行都有独立的路由系统
        // {
        //     path: '*',
        //     method: 'all',
        //     handler(req, res) {         // 默认的规则
        //         res.end(`Cannot ${req.method} ${req.url}`)
        //     }
        // }
    ];
};

Router.prototype.get = function(path, handler) {
     this.stack.push({
        path,
        method: 'get',
        handler
    })
}

Router.prototype.handler = function (req, res, done) {
    let {
        pathname
    } = url.parse(req.url);
    let requestMethod = req.method.toLowerCase();
    for (let i = 0; i < this.stack.length; i++) {
        let {
            path,
            method,
            handler
        } = this.stack[i];
        if (path === pathname && method === requestMethod) { // 路径和方法都匹配才是真的匹配
            return handler(req, res)
        }
    }

    done()
}
module.exports = Router;