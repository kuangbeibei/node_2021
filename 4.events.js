/**
 * 自己实现events.js，主要是里面的发布订阅模式
 * 主要是五个方法：on, emit, off, once, newListener
 */
function EventEmitter() {
    this._cbs = {};  // 实例属性
}
EventEmitter.prototype.on = function (name, cb) {
    // console.log('this.cbs',this.cbs) // Cannot read property '饿' of undefined，因为this是cat，而cat上面没有EventEmitter的私有属性或说实例属性
    if (!this._cbs) this._cbs = {};   // 源码就是这么low low滴解决的
    
    if (!this._cbs[name]) {
        this._cbs[name] = []
    }

    if (name !== 'newListener') {
        this.emit('newListener', name)
    }

    this._cbs[name].push(cb);
}

EventEmitter.prototype.emit = function (name, ...args) {
    if (this._cbs[name]) {
        this._cbs[name].forEach(cb => cb(...args))
    }
}

EventEmitter.prototype.off = function(name, cb) {
    if (!this._cbs) this._cbs = {};
    if (this._cbs[name]) {
        this._cbs[name] = this._cbs[name].filter(item => item != cb && item.l != cb)    // 注意这里是&&关系！
    }
}

EventEmitter.prototype.once = function(name, cb) {
    const once = (...args) => {     // AOP!!!!
        cb(...args);
        this.off(name, cb);
    }
    once.l = cb;
    this.on(name, once)
}

module.exports = EventEmitter;

