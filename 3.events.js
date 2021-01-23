/**
 * 接下来要对常用的node核心/内置模块非常了解
 * 第一个便是events模块
 * 
 * 事件触发器，依据发布订阅模式
 * 发布订阅，解决的问题是现在和将来，并且将代码解藕
 * 
 * on, emit, off, once, newListener
 */

// const EventEmitter = require('events'); 
const EventEmitter = require('./4.events');

const util = require('util');   //  常用inherits，promisify

function Cat(){}
util.inherits(Cat, EventEmitter)// 实现原理，Object.setPrototypeof(Cat.prototype, EventEmitter.prototype)；

// Cat.prototype.__proto__ = EventEmitter.prototype; // 古老的原型继承，还可以用Object.create来进行原型继承。
// class Cat extends EventEmitter { }   // 当然也可以使用extends关键字来实现类的继承，这个继承相当于是组合式继承，父类上的私有属性也会继承

let cat = new Cat();

// 这是个内置事件，只要每次一绑定，即调用on事件，就会触发。
// 必须写在on的最前面，才会监听到
// 什么场景会用到？比如流，on('data')
let flag = false;   // 批处理
// cat.on('newListener', (type) => {   
//     console.log('type',type)
//     if (flag) return;
//     flag = true;
//     process.nextTick(() => {
//         cat.emit(type);
//         flag = false;
//     })
// })

let count = 1;
let miao = (...args) => {
    console.log(`喵喵喵${count++}`, ...args)
};
// cat.on('饿', miao)
cat.once('饿', miao);
// cat.on('洗澡', () => {
//     console.log('舔舔舔1')
// });
// cat.on('洗澡', () => {
//     console.log('舔舔舔2')
// });
// cat.on('困', () => {
//     console.log('眯眯眼1')
// })
// cat.on('困', () => {
//     console.log('眯眯眼2')
// })


// 一定是先订阅，再发布；
// 发布两次试试
// cat.emit('饿', 1,2,3,4)
// once是基于on和off的
// cat.off('饿', miao)
cat.emit('饿', 1,2,3,4)
cat.emit('饿', 1,2,3,4)

