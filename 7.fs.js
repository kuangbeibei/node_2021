/**
 * 实现createReadStream
 * 
 * 1. fs.createReadStream内部实际上是new ReadStream()
 * 2. ReadStream这个构造函数内部
        实际上用到stream原生的Readable，调用Readable.call(this, options)
        并且ObjectSetPrototypeOf(ReadStream.prototype, Readable.prototype); ObjectSetPrototypeOf(ReadStream, Readable);
            可以看到ReadStream这个类继承了stream中的原生Readable接口
        在ReadStream构造函数中直接调用this.open方法，这是ReadStream原型上的方法，内部执行的就是fs.open，在这个open方法的回调函数中会做三件事：
            this.emit('open', fd);
            this.emit('ready');
            // Start the flow of data.
            this.read(); 这个read方法是父类Readable接口提供的
 * 3. 调用父类Readable.prototype.read方法，其实内部仍然是调用子类自己的this._read方法。即在父类中调用子类的方法(call internal read method)
 * 4. ReadStream.prototype._read，内部调用的是fs.read方法，the actual read
 * 5. 在actual read方法内部，会把读到的数据，push到数组里面
 * 
 * 可读流ReadStream本身并不是完全自己实现，而是基于Stream这个原生模块，Stream内部又基于事件流EventEmitter
 */
const {Readable} = require('stream');
const fs = require('fs');
const path = require('path');

// 第一版 extends Readable 的写法
class MyReadStream extends Readable {
    _read() {   
        // 下面这些方法，在ReadStream里面是构造函数中调用的，只有read方法是在_read中调用的。我们这里是模拟，举个例子，所以都放在这里写。
        let buffer = Buffer.alloc(3);
        fs.open(path.resolve(__dirname, './text/3.txt'), 'r', (err, fd) => {
            fs.read(fd, buffer, 0, 3, 0, (err, bytesread) => {
                this.push(buffer)           // 这个push是stream类上的。内部会这样emit出来 stream.emit('data', buffer)，所以下面订阅on('data')便能够拿到chunk这个参数的值了
                this.push(null)             // push一个空值，会触发end事件
            })
        })
    }
}

const myReadStream = new MyReadStream();    // myReadStream这个实例，相当于6.js中的rs
myReadStream.on('data', chunk => {          // 当用户监听了data事件后，内部stream会不停触发它对应的回调函数，不停把chunk吐出来。所以上面需要push一个null来标识结束
    console.log('chunk', chunk)
})

myReadStream.on('end', () => {              // 在push了一个空值之后会触发这个end事件
    console.log('结束')
})

