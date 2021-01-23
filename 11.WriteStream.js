/**
 * 实现WriteStream
 */
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class WriteStream extends EventEmitter {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.flags = options.flags || 'w';
        this.encoding = options.encoding || 'utf8';     //其实是二进制
        this.highWaterMark = options.highWaterMark || 16 * 1024;
        this.options = options;

        this.len = 0;           // 记录写入的个数
        this.offset = 0;
        this.writing = false;   // 记录只有第一次写入是写到文件里，其他都是放内存
        this.cache = [];        // 用数组来表示内存
        this.needDrain = false; 

        this.open();

        this.buffer = Buffer.alloc(this.highWaterMark);

        
    }
    
    open() {
        fs.open(this.path, this.flags, (err, fd) => {
            if (err) 
                return this.destroy(err)
            this.fd = fd;
            this.emit('open', fd)
        })
    }

    write(chunk, encoding, callback = () => {}) {       // 有返回值
        chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

        this.len += chunk.length;
        let r = this.len < this.highWaterMark;
        this.needDrain = !r;
   
        if (this.writing) {
            this.cache.push({
                chunk,
                encoding,
                callback
            })
        } else {
            // 真正写入
            this.writing = true;
            this._write(chunk, encoding, callback)
        }

        
        return r;
    }

    // 真正调用fs的write方法进行写入
    _write(chunk, encoding, callback) {
        console.log('111', typeof this.fd);
        console.log(this.len);
        if (typeof this.fd !== 'number') {
            return this.once('open', () => this._write(chunk, encoding, callback))   // 注意once这里不能直接调用this.write()方法执行，不然就死循环啦
        }
        fs.write(this.fd, this.buffer, 0, this.highWaterMark, this.offset, (err, byteswrite) => {
            this.offset += byteswrite;
            console.log(this.cache)
        })
    }

    end(msg) {

    }

    destroy (err) {
        if (err) {
            this.emit('error', err)
        }
    }

}

module.exports = WriteStream;