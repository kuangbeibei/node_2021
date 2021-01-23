/**
 * 比可读流稍稍复杂一些，它有个排队的概念
 * 继承Stream，以及stream中的Writable
 *
 * 写文件内部也需要用open方法，只有当调用这个open方法，才会将之前写入的文件内容清空
 *
 * 第一次写是真的写入文件，调用的fs.write方法，之后都是往内存中写入。其实是个链表，链表里面存的是一个个buffer
 * 
 * 掌握重要方法：write(),end(), on('drain'), on('close')    ，再重申，只有文件流有open和close方法
 */

const fs = require("fs");
const path = require("path");
const WriteStream = require('./11.WriteStream');

// 1. 
// const ws = fs.createWriteStream(path.resolve(__dirname, './text/4.txt'), {
//     flags: 'w',
//     highWaterMark: 4 // 16 * 1024 // 默认16k，表示“期望”，超出期望不会影响写入，但会影响r
// })

// let r = ws.write('ok', (err, data) => {
//     console.log(1)
// })
// console.log(r)
// r = ws.write('ook', (err, data) => {
//     console.log(2)
// })
// console.log(r)


// 2.
// 如果我只想用2个字节的内存来完成写入，要用drain事件来配合
const ws2 = new WriteStream(path.resolve(__dirname, "./text/4.txt"), {
// const ws2 = fs.createWriteStream(path.resolve(__dirname, "./text/4.txt"), {
    flags: "w",
    highWaterMark: 2, // 16 * 1024 // 默认16k，表示“期望”，超出期望不会影响写入，但会影响r。达到或者超过预期，就是false
    // 表示，我期望使用多少个字节完成写入操作。返回false是告诉用户不要再写入了，再写入就是会占用内存
});

let index = 0;

function write() {
    // 循环操作是同步的，会批量写入10次，第一次调用fs.write，其他都会存到内存中
    let writing = true;
    while(index < 10 && writing) {
        writing = ws2.write(`${index++}`); // 只能写入Buffer或者string
    }
    if (index === 10) {
        ws2.end('end done');        // 已经关闭掉了就不能再写入 write after end。 end = write + close。调用end才会调用close方法。这一点和文件的可读流一样
        // 触发了end事件就不会再触发drain事件了
    }
}
write();


ws2.on('drain', () => {
    console.log('drain');
    write()
})

ws2.on('close', () => {
    console.log('close')
})


// 3.最终要实现的是边读边写的功能。读取文件 =》 写入，发现超过写入的期望，暂停读取 =》 等待本次写入完毕，触发drain事件，继续读取 =》 循环往复