function Layer(path, handler) {
    this.path = path;
    this.handler = handler
}

// 可以扩展
Layer.prototype.match = function(pathname) {
    // ..todo可能是其他很多规则，都可以在这里扩展
    return this.path === pathname
}

Layer.prototype.handle_request = function(req, res, next) {
    this.handler(req, res, next);
}

module.exports = Layer;