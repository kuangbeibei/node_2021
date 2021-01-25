const Layer = require("./layer");
const methods = require('methods');

function Route() {
    this.stack = [];
    this.methods = {};
}

methods.forEach(method => {
    Route.prototype[method] = function(handlers) {
        handlers.forEach(handler => {
            let layer = new Layer('*', handler);
            layer.method = method;
            this.methods[method] = true;
            this.stack.push(layer)
        })
    }
})


Route.prototype.dispatch = function(req, res, out) {     // 让用户定义的handlers依次执行
    let index = 0;

    const next = (err) => {
        if (err) return out(err);
        let layer = this.stack[index++];
        if (layer) {
            if (layer.method === req.method.toLowerCase()) {
                layer.handle_request(req, res, next)
            } else {
                next()
            }
        } else {
            out()
        }
    }

    next()
}

Route.prototype.matchMethod = function(method) {
    return this.methods[method]
}

module.exports = Route;