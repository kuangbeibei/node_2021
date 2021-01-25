/**
 * 路由系统维护了一个栈结构
 */

const url = require('url');
const methods = require('methods');
const Layer = require('./layer');
const Route = require('./route');

function Router() {
    this.stack = []; // express原生就支持路由系统，就是这么来的。每次express()执行都有独立的路由系统
};

Router.prototype.route = function (path) {
    let route = new Route();
    let layer = new Layer(path, route.dispatch.bind(route));

    layer.route = route;

    this.stack.push(layer);

    return route
}

// 无论是路由还是中间件，前提是路由必须匹配。路由还必须匹配method方法。
Router.prototype.use = function (path, ...handlers) { // use就是layer对应一个由具体handler组成的handlers，而不是layer对应一个route。
    if (!handlers[0]) { // 如果只传了一个回调函数，没有写路径
        handlers.push(path); // 这里的path只是的传递的唯一的一个参数，即是函数
        path = "/";
    }

    handlers.forEach(handler => {
        let layer = new Layer(path, handler);
        layer.route = undefined; // 不设置也就是undefined，这里是显示设置出来
        this.stack.push(layer);
    })
}

methods.forEach(method => {
    Router.prototype[method] = function (path, handlers) {
        let route = this.route(path); // 构建两个栈
        (route[method])(handlers)
    }
})

Router.prototype.handler = function (req, res, done) {

    let index = 0;

    const next = (err) => {
        let layer = this.stack[index++];
        let {
            pathname
        } = url.parse(req.url);

        if (layer) {
            if (err) {
                if (!layer.route) {
                    if (layer.handler.length === 4) {
                        layer.handler(err, req, res, next);
                    } else {
                        next(err);
                    }
                } else {
                    next(err)
                }
            } else {
                if (layer.match(pathname)) {
                    if (!layer.route) {
                        if (layer.handler.length !== 4) {
                            layer.handle_request(req, res, next); // 中间件
                        }
                    } else {
                        if (layer.route.methods[req.method.toLowerCase()]) {
                            layer.handle_request(req, res, next); // 这里的handle_request内部调用的handler就是route.dispatch
                        } else {
                            next()
                        }
                    }
                } else {
                    next()
                }
            }
        } else {
            done()
        }
    }
    next()
}
module.exports = Router;