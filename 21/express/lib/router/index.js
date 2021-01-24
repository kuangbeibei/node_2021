/**
 * 路由系统维护了一个栈结构
 */

const url = require('url');
const methods = require('methods');
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


methods.forEach(method => {
    Router.prototype[method] = function(path, handlers) {
        let route = this.route(path);   // 构建两个栈
        (route[method])(handlers)
    }
})

Router.prototype.handler = function (req, res, done) {
    
    let index = 0; 

    const next = () => {
        let layer = this.stack[index++];
        if (layer) {
            let {pathname} = url.parse(req.url)
            if (layer.match(pathname) && layer.route.methods[req.method.toLowerCase()]) {
                layer.handle_request(req, res, next); // 这里的handle_request内部调用的handler就是route.dispatch
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