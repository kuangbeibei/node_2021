/**
 * 简易实现是运用的对象的方式，但是对象不利于扩展，只能给对象添加属性。而不能去处理公有、私有特性
 * 所以运用构造函数/类。
 * 但这里我们模拟express原理用构造函数来实现。不然无法体会到express的“精髓”。例如express中的二级路由，既能当作方法来调用，又能当作类来new。因为es6中的类无法被当作方法用。
 * 
 * 创建路由的
 */

const http = require('http');
const Router = require("./router");
const methods = require("methods");   // 安装express模块自动安装了这个第三方库

function Application() {
    // this._router = new Router();   // 懒加载路由，并不是一创建app就配置一个路由，调用请求方法或者listen的时候再创建
}

Application.prototype.layze_route = function() {
    if (!this._router) {
        this._router = new Router()
    }
}

methods.forEach(method => {
    Application.prototype[method] = function (path, ...handlers) {
        this.layze_route();
        (this._router[method])(path, handlers)
    }
})


Application.prototype.use = function(path, ...handlers) {
    this.layze_route();
    this._router.use(...arguments)
}


Application.prototype.listen = function (...args) {
    const server = http.createServer((req, res) => {
        this.layze_route();

        function done(r) {
            // 如果路由系统处理不了，交给应用来处理
            res.end(`Cannot Found ${req.method} ${req.url}`)
        }

        this._router.handler(req, res, done)

    });
    server.listen(...args);
};

module.exports = Application