const fs = require('fs');
const path = require('path');
const vm = require('vm');

function Module(filename) {
    this.filename = filename;
    this.exports = {};
}

Module._extensions = {
    '.js'(module) {
        const script = fs.readFileSync(module.filename, 'utf8');
        let code = `(function(exports, require, module, __filename, __dirname){
            ${script}
        })`;
        const func = vm.runInThisContext(code);
        let exports = module.exports;
        const thisValue = exports;
        const dirname = path.dirname(module.filename);
        func.call(thisValue, exports, req, module, module.filename, dirname)
    },
    '.json'(module) {
        const content = fs.readFileSync(module.filename, 'utf8');
        module.exports = JSON.parse(content);
    }
}

Module._resolveFilePath = function (id) {
    let filename = path.resolve(__dirname, id);
    let isExist = fs.existsSync(filename);
    if (isExist) return filename;
    const keys = Object.keys(Module._extensions);
    for (let key of keys) {
        let newfilename = `${filename}${key}`;  // 这里不能复用filename
        isExist = fs.existsSync(newfilename);
        if (isExist) return newfilename;
    }
    throw new Error(`${id} not existed`);
}

Module._load = function(id) {
    let filename = Module._resolveFilePath(id);
    const module = new Module(filename);
    module.load();
    if (Module._cache[filename]) return (Module._cache)[filename].exports;
    (Module._cache)[filename] = module;
    return module.exports;
}

Module._cache = {};

Module.prototype.load = function() {
    const ext = path.extname(this.filename);
    Module._extensions[ext](this);
}

function req(id) {
    return Module._load(id);
}

let r = req("./b");
console.log('r', r)