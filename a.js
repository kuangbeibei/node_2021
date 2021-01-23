// module.exports = {}
exports.other = "hello other"
console.log(111, module.exports, 222,exports)
console.log(module.exports === exports)

// console.log('this',this, module);
// console.log(__dirname)

// global.aaa = 123;

// console.log(module.exports === this)    // true
// // 测试 1.req.js用的
// console.log(exports === this)   // true