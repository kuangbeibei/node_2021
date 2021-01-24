const Layer = require("./layer");

function Route() {
    this.stack = []
}

Route.prototype.get = function(handlers) {
    handlers.forEach(handler => {
        this.stack.push(new Layer('*', handler))
    })
}

Route.prototype.dispatch = function(req, res, out) {     // 让用户定义的handlers依次执行
    let index = 0;

    const next = () => {
        let layer = this.stack[index++];
        if (layer) {
            layer.handler(req, res, next)
        } else {
            out()
        }
    }

    next()
}

module.exports = Route;