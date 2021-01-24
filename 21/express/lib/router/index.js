/**
 * 路由系统维护了一个栈结构
 */

const url = require('url');
const Layer = require('./layer');
const Route = require('./route');

function Router() {
    this.stack = [];  // express原生就支持路由系统，就是这么来的。每次express()执行都有独立的路由系统
};

Router.prototype.route = function(path) {
    let route = new Route();
    let layer = new Layer(path, route.dispatch.bind(route));

    layer.route = route;

    this.stack.push(layer);

    return route
}

// 就是app.get
Router.prototype.get = function(path, handlers) {
    let route = this.route(path);   // 构建两个栈
    route.get(handlers)
}

Router.prototype.post = function() {
    
}

Router.prototype.handler = function (req, res, done) {
    
    let index = 0; 

    const next = () => {
        let layer = this.stack[index++];
        if (layer) {
            let {pathname} = url.parse(req.url)
            if (layer.path === pathname) {
                layer.route.dispatch(req, res, next)
            } else {
                next()
            }
        } else {
            done()
        }
    }

    next()
}
module.exports = Router;