/**
 * commonjs规范的实现
 * 1. module.exports和exports之间的关系
 *      可以把module.exports = "hello" 写成 exports = "hello"吗？
 *      答：不可以。因为代码里面是三部曲: module.exports = {}; exports = module.exports; return module.exports; 而exports = 一个新的值，就改变了引用地址了
 *      可以写exports.xx = "hello"吗？
 *      答：可以。
 * 2. 不同模块中的global是不是同一个？
 *      答：是。因为你在这个文件里面，拿到a文件内容，a文件内容对global这个node中的全局变量进行了修改。所以，你可以在引用a文件的这个文件中，看到修改后的global。
 *      所有有引用关系的模块都共用一个global，所以尽量不要使用global，可能会污染全局变量。但比如连接数据库，可以用。
 * 3. 同时写module.exports和exports，会是怎样的效果？
 *      答：会返回module.exports的值。所以使用exports.x的时候，不要使用module.exports。在es6中的esm，可以export default和export一起使用。
 * 4. 模块里的this是哪个？
 *      答：是module.exports或者说是exports。在不写任何代码的时候，都是true。但是如果有module.exports=值，this就只是exports。
 * 5. 多次引入，会执行几次？
 *      答：有缓存，只会执行一次
 * 6. 循环引用的问题？
 *      答：会出现这个问题代码逻辑肯定有问题。可以把公共的部分抽离出来当第三个模块。在node中，循环引用也不会卡死.
 */

const path = require("path");
const fs = require("fs");
const vm = require('vm');   // 虚拟机模块，创建沙箱用的

function Module(filename) {
    this.filename = filename;
    this.exports = {};
}

// 核心的加载解析文件内容(根据不同的文件后缀去进行加载)
Module.prototype.load = function() {
    let ext = path.extname(this.filename);
    Module._extensions[ext](this)
}

// 策略规则：根据不同策略去执行对应函数，进行文件加载
Module._extensions = {
    '.js'(module){
        let script = fs.readFileSync(module.filename, 'utf8');
        let code = `(function(exports, require, module, __filename, __dirname){
            ${script}
        })`;
        let func = vm.runInThisContext(code);
        let exports = module.exports;
        let thisValue = exports;
        let dirname = path.dirname(module.filename);
        func.call(thisValue, exports, req, module, module.filename, dirname)
    },
    '.json'(module){
        let script = fs.readFileSync(module.filename, 'utf8');
        module.exports = JSON.parse(script); 
    }
}

// 缓存模块
Module._cache = {};

// 解析文件名称
Module._resolveFilename = function (id) {
    let filePath = path.resolve(__dirname, id);
    let isExist = fs.existsSync(filePath);
    if (isExist) return filePath;

    const extensionKeys = Object.keys(Module._extensions);
    for (let key of extensionKeys) {
        filePath = `${filePath}${key}`;
        isExist = fs.existsSync(filePath);
        if (isExist) return filePath;
    }
    throw new Error('不存在该文件')
}

// 入口方法
Module._load = function(id) {
    // 第一步：解析文件名称
    let filename = Module._resolveFilename(id);
    if ((Module._cache)[filename]) return (Module._cache)[filename].exports;
    // 生成模块
    let module = new Module(filename);
    // 加载解析模块
    module.load();
    // 进行缓存
    (Module._cache)[filename] = module;
    // 把解析的模块内容返回
    return module.exports
}

// 获取文件
function req(id) {
    return Module._load(id)
}

let r = req("./a.js");
r = req("./a.js");
let r2 = req("./b.json");

console.log(r, r2);