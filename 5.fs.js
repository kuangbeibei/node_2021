/**
 * fs模块
 * readFileSync
 * readFile
 * read
 * 
 * 文件读取，默认就是二进制，是buffer类型，读取不需要指定什么编码格式，默认是null，也就是读取二进制。如果文件不存在会报错。
 * 写入的操作也默认是二进制。如果文件不存在会创建文件，文件存在会覆盖文件。
 */
const fs = require('fs');
const path = require('path');


// 1. 同步读取，阻塞问题
/**
 *  let r = fs.readFileSync(path.resolve(__dirname, './text/1.txt'));
    console.log(r)
    fs.writeFileSync(path.resolve(__dirname, './text/1.write.txt'), r)  

    // 存入也写入都是二进制，不依赖于具体某个编码
    // 如果要指定文件的编码格式，要确保读取的和写入的编码是一致的。不然会乱码。比如读取的是gbk格式，但是写入的时候却设置encoding格式是utf8。
 */


// 2. 异步读取，读写小文件没问题，但文件过大则这么实现不实际。会淹没可用内存或内存溢出。node中认为64k以下都是小文件。
/**
 * fs.readFile(path.resolve(__dirname, './text/1.txt'), (err, data) => {
        if (err) {
            return console.log('读取错误,', err)
        }
        fs.writeFile(path.resolve(__dirname, './text/1.write.txt'), data, err  => {
            if (err) {
                return console.log('写入错误,', err)
            }
            console.log('write ok')
        })
    })

 */


// 3. fs.open, fs.read, fs.write 读取部分内存写入，可以自己定位读取哪个位置
// flag标识 r (read), w (write), a (append) r+ 以读为基础，增加写的功能，但是文件不存在会报错 w+ 以写为基础，增加读的功能。 打开文件要做什么事，权限操作
/**
 * let buffer = Buffer.alloc(3);
    fs.open(path.resolve(__dirname, './text/2.txt'), 'r', (err, rfd) => {
        if (err) {
            return console.log('打开错误,', err)
        }
        console.log('rfd,', rfd);
        fs.read(rfd, buffer, 0, 3, 0, (err, bytesread) => {
            if (err) {
                return console.log('读取错误,', err)
            }
            console.log('读取成功，读到的字节数是：', bytesread);
            fs.open(path.resolve(__dirname, './text/2.write.txt'), 'w', (err, wfd) => {
                fs.write(wfd, buffer, 0, 3, 0, (err, byteswrite) => {
                    console.log('ok，写入的是字节数是：', byteswrite);
                    fs.close(rfd, () => {});    // 释放文件描述符
                    fs.close(wfd, () => {});
                })
            })
        })
    })
 */


// 4. 读三个写三个，直到读取完毕
const BUFFER_SIZE = 3;
fs.open(path.resolve(__dirname, './text/2.txt'), 'r', (err, rfd) => {
    if (err) {
        return console.log('打开读的文件错误,', err)
    }
    fs.open(path.resolve(__dirname, './text/2.write.txt'), 'w', (err, wfd) => {
        if (err) {
            return console.log('打开写的文件错误,', err)
        }

        let buffer = Buffer.alloc(BUFFER_SIZE);
        let roffset = 0;
        let woffset = 0;

        function next() {
            fs.read(rfd, buffer, 0, BUFFER_SIZE, roffset, (err, bytesread) => {
                if (err) {
                    return console.log('读取错误')
                }
                if (bytesread === 0) {
                    fs.close(rfd, () => {});
                    fs.close(wfd, () => {})
                } else {
                    fs.write(wfd, buffer, 0, BUFFER_SIZE, woffset, (err, byteswrite) => {
                        roffset += bytesread;
                        woffset += byteswrite;
                        next();
                    })
                }
            })
        }
        next()
    })
})