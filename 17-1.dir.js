/**
 * 2021.01.15 practice
 * 
 */

const path = require('path');
const fs = require('fs');

// 深度优先 异步串行递归删除
// 因为文件夹删除，就是要先解决子的问题，再解决父的问题，所以最普遍会想到用递归去做。但是递归性能低。
function traverseSerial(dir, cb) {
    fs.stat(dir, (err, statObj) => {
        if (statObj.isFile()) {
            fs.unlink(dir, cb)
        } else {
            fs.readdir(dir, (err, dirs) => {
                dirs = dirs.map(d => path.join(dir, d));
                let index = 0;
                // 接下来就要去删除儿子了，可以联想到最后两层。或者把复杂问题只先缩小到只有两层的情况去考虑。
                function next() {   // 函数在哪里定义的，里面的变量就是从那个作用域里来的
                    if (index === dirs.length) {
                        return fs.rmdir(dir, cb)
                    }
                    let d = dirs[index++];
                    traverseSerial(d, next);    // next向下传递
                }
                next()
            })
        }
    })
}

// 广度优先，需要维护一个队列，后进的先出
function traverseBroad(dir, cb) {
    let queue = [dir];
    let index = 0;                  // 指针

    function removedir() {
        if (index <= 0) return cb();
        let dir = queue[--index];
        fs.stat(dir, (err, statObj) => {
            if (statObj.isFile()) {
                fs.unlink(dir, removedir)
            } else {
                fs.rmdir(dir, removedir)
            }
        })
    }

    // 先形成队列，再从队列中从后向前依次取出删除
    function next() {
        let dir = queue[index++];
        if (!dir) {
            index--;
            return removedir()
        }
        fs.stat(dir, (err, statObj) => {
            if (statObj.isFile()) {
                next()
            } else {
                fs.readdir(dir, (err, dirs) => {
                    dirs = dirs.map(_d => path.join(dir, _d));
                    queue.push(...dirs);
                    next();
                })
            }
        })
    }
    next();
}

// 异步并行，就是如果同级没有前后顺序
function traverseParallel(dir, cb) {
    fs.stat(dir, (err, statObj) => {
        if (statObj.isFile()) {
            fs.unlink(dir, cb)
        } else {
            fs.readdir(dir, (err, dirs) => {
                dirs = dirs.map(d => path.join(dir, d));
                if (dirs.length === 0) return fs.rmdir(dir, cb);
                let index = 0;
                function next() {
                    if (++index === dirs.length) {
                        return fs.rmdir(dir, cb)
                    }
                }
                dirs.forEach(d => traverseParallel(d, next))
            })
        }
    })
}

// 异步并行，用promise, promise.all去处理

// traverseParallel(path.resolve(__dirname, "18"), () => {
//     console.log('done');
// })

traversePromiseParallel(path.resolve(__dirname, "18")).then(() => {
    console.log('done')
})