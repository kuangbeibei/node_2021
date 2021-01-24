function Layer(path, handler) {
    this.path = path;
    this.handler = handler
}

// 可以扩展
Layer.prototype.match = function(pathname) {
    // ..todo可能是其他很多规则，都可以在这里扩展
    // return this.path === pathname    // 这里要改造，因为要考虑到中间件的情况。中间件只要开头就可以

    if (this.path === pathname) return true;

    if (!this.route) {
        if (this.path = "/") {  // 可以匹配任何路径
            return true
        }

        return pathname.startsWith(this.path + '/')
    }
    return false
}

Layer.prototype.handle_request = function(req, res, next) {
    this.handler(req, res, next);
}

module.exports = Layer;