/**
 * fs基于流来实现大文件操作　
 * 
 * stream
 * createReadStream 底层用的fs.open, fs.read, fs.close
 * 
 * 文件流是基于流来实现的。文件流 属于流，是流的一种。只有文件流才有open和close，其他流没有。
 * 
 * on('data'), on('end')都是流中的方法。可读流的标识就是拥有这两个方法。而只有文件流有open和close方法，他们不是流中的方法。
 * 
 * 文件流、可读流、可写流、双工流、转化流
 * 
 */

 const fs = require('fs');
 const path = require('path');

let rs = fs.createReadStream(path.resolve(__dirname, './text/3.txt'), {
    flags: 'r',
    encoding: null,
    // mode: 0o666,                 // 权限，8进制表示，十进制是438  chmod -R 777 d rwx (r-x) (r-x) [r:4, w:2, x:1] "二爷一执四读书"
    autoClose: true,
    start: 0,
    end: 100,                       // 闭区间，包前包后
    highWaterMark: 3                // 每次最多读取多少个字节
});

rs.on('open', (fd) => {             // 这里只是打印，不需要调用这个，在createReadStream这个阶段就已经open并且read了
    console.log('文件open, fd:', fd)
})

let arr = []; 
rs.on('data', chunk => {            // 绑定data事件后，会不停将需要读取的文件数据发射出来。内部用到newListener
    console.log('chunk', chunk.toString())
    arr.push(chunk)
    // 在这里可以做一遍读一边写的事情
})                     

rs.on('end', () => {
    console.log('end: ', Buffer.concat(arr).toString());
})

rs.on('close', () => {              // close要等到读取完毕后才会触发
    console.log('文件close')
})