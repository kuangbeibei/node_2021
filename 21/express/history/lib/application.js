/**
 * 简易实现是运用的对象的方式，但是对象不利于扩展，只能给对象添加属性。而不能去处理公有、私有特性
 * 所以运用构造函数/类。
 * 但这里我们模拟express原理用构造函数来实现。不然无法体会到express的“精髓”。例如express中的二级路由，既能当作方法来调用，又能当作类来new。因为es6中的类无法被当作方法用。
 * 
 * 创建路由的
 */

const http = require('http');
const Router = require("./router");

function Application() {
    this._router = new Router();   // express原生就支持路由系统，就是这么来的。每次express()执行都有独立的路由系统
}

Application.prototype.get = function (path, handler) {
    // this.routes.push({
    //     path,
    //     method: 'get',
    //     handler
    // })

    this._router.get(path, handler)
}

Application.prototype.listen = function (...args) {
    const server = http.createServer((req, res) => {

        function done(r) {
            // 如果路由系统处理不了，交给应用来处理
            res.end(`Cannot Found ${req.method} ${req.url}`)
        }

        this._router.handler(req, res, done)
        
        // let {
        //     pathname
        // } = url.parse(req.url);
        // let requestMethod = req.method.toLowerCase();
        // for (let i = 1; i < this.routes.length; i++) {
        //     let {
        //         path,
        //         method,
        //         handler
        //     } = this.routes[i];
        //     if (path === pathname && method === requestMethod) { // 路径和方法都匹配才是真的匹配
        //         return handler(req, res)
        //     }
        // }
        // this.routes[0].handler(req, res)

    });
    server.listen(...args);
};

module.exports = Application