/**
 * 测试自己写的ReadStream
 * 
 * 掌握
 * on('data')
 * on('end')
 * on('error')
 * on('open')
 * on('close')
 * rs.pause()
 * rs.resume()
 */

const { ReadStream } = require('./8.ReadStream');
const path = require('path');
const fs = require('fs');

let rs = new ReadStream(path.resolve(__dirname, './text/3.txt'), {
    flags: 'r',
    encoding: null,
    autoClose: true,
    start: 0,
    end: 6,                       // 闭区间，包前包后
    highWaterMark: 3                // 每次最多读取多少个字节
});

rs.on('open', (fd) => {           
    console.log('文件open, fd:', fd)
})

let arr = []; 
rs.on('data', chunk => {      
    console.log('chunk', chunk)
    rs.pause();
    arr.push(chunk);
    // 在这里可以做一遍读一边写的事情
})                     

rs.on('end', () => {
    console.log('end: ', Buffer.concat(arr).toString());
})

rs.on('close', () => {            
    console.log('文件close')
})

setInterval(() => {
    rs.resume()
}, 1000)