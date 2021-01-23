/**
 * 自己实现ReadStream
 */
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');


class ReadStream extends EventEmitter {
    constructor(path, options = {}) {
        super()

        this.path = path;
        this.flags = options.flags;
        this.encoding = options.encoding || null;
        this.autoClose = options.autoClose || true;
        this.start = options.start || 0;
        this.end = options.end || undefined;
        this.highWaterMark = options.highWaterMark || 64 * 1024;

        this.offset = 0;
        this.open();

        // 源码是写在父类readable身上，在这里模拟实现。本质上还是调用的自己类上的_read方法
        // 源码是直接放在open方法里面去执行了，去读取了，当用户调用on('data')时候可以拿到数据。这里我们做个判断。
        // 在EventEmitter源码里，当绑定/订阅的事件不是newListener时，会emit newListener对应的回调函数
        this.on('newListener', type => {    // 先挂号
            console.log('type', type);
            if (type === 'data') {
                this._read();
            }
        })

        this.flowing = true;
        
    }

    pause() {
        this.flowing = false;
    }

    resume() {
        if (!this.flowing) {
            this.flowing = true;
            this._read()
        }
    }

    _read() {
        console.log('here2')
        if (typeof this.fd !== 'number') {     // 骚气de延迟处理
            console.log('here3')
            return this.once('open', () => this._read())    // 这里相当于让open这个eventName上面挂载了_read这个listener，就会先后依次执行
        }

        if (!this.flowing) return;

        // 每次读都会创建buffer，不用担心，不用的话会被垃圾回收
        let buffer = Buffer.alloc(this.highWaterMark);
        let howmuchToread = this.end ? Math.min(this.highWaterMark, this.end - this.offset + 1) : this.highWaterMark;

        fs.read(this.fd, buffer, 0, howmuchToread, this.offset, (err, bytesread) => {
            if (bytesread > 0) {
                // this.emit('data', buffer.slice(0, bytesread))
                this.emit('data', buffer.slice(0, bytesread))
                this.offset += bytesread;
                this._read()
            } else {
                this.emit('end');
                this.destroy()
            }
        })

    }

    open() {
        console.log('here0')
        fs.open(this.path, this.flags, (err, fd) => {
            console.log('here')
            if (err)
                return this.destroy(err);
            this.fd = fd;
            this.emit('open', fd);
            
        })
    }

    destroy(error) {
        if (error) 
            this.emit(error)
        if (typeof this.fd === 'number' && this.autoClose) {
            fs.close(this.fd, () => {
                this.emit('close')
            })
        }
    }
    
}


module.exports = {
    ReadStream
}