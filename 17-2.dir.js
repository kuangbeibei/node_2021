/**
 * 2021.01.17 practice
 * 
 */
const path = require('path');
const fs = require('fs');
const fspromise = require('fs').promises;

function traverseSerial(dir, cb) {
    fs.stat(dir, (err, statObj) => {
        if (statObj.isFile()) {
            fs.unlink(dir, cb)
        } else {
            fs.readdir(dir, (err, dirs) => {
                dirs = dirs.map(d => path.join(dir, d));
                let index = 0;
                function next() {
                    let item = dirs[index];
                    if (index++ === dirs.length) {
                        return fs.rmdir(dir, cb)
                    }
                    traverseSerial(item, next)              // 递归调用/传递的函数，函数里面的变量永远“记忆”的是定义函数时的那个context
                }
                next()
            })
        }
    })
}

// 错误示范！while是同步代码！不会等异步执行完再执行的
function traverseBroad(dir, cb) {
    let queue = [];
    let index = 0;                                          // 指针
    queue.push(dir);

    function remove() {
        let item = queue.pop();
        if (item) {
            fs.stat(item, (err, statObj) => {
                if (statObj.isFile()) {
                    fs.unlink(item, remove)
                } else {
                    fs.rmdir(item, remove)
                }
            })
        } else {
            cb()
        }
    }
    function next() {
        let item = queue[index++];
        if (!item) {
            index--;
            return remove();
        }
        fs.stat(item, (err, statObj) => {
            if (statObj.isFile()) {
                next()
            } else {
                fs.readdir(item, (err, dirs) => {
                    dirs = dirs.map(d => path.join(item, d));
                    queue.push(...dirs);
                    next();
                })
            }
        })
    }
    next()
}

// 异步并发
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

// 异步并发 promise
function traversePromiseParallel(dir) {
    return new Promise((resolve, reject) => {
        fs.stat(dir, (err, statObj) => {
            if (err) reject(err);
            if (statObj.isFile()) {
                fs.unlink(dir, resolve)
            } else {
                fs.readdir(dir, (err, dirs) => {
                    if (err) reject(err);
                    dirs = dirs.map(d => traversePromiseParallel(path.join(dir, d)));
                    Promise.all(dirs).then(res => {
                        fs.rmdir(dir, resolve)
                    }).catch(e => reject(e))
                })
            }
        })
    })
}

// 异步并发 async await
async function traverseAsyncAwait(dir) {
    try {
        const statObj = await fspromise.stat(dir);
        if (statObj.isFile()) {
            await fspromise.unlink(dir)
        } else {
            let dirs = await fspromise.readdir(dir);
            dirs = dirs.map(d => traverseAsyncAwait(path.join(dir, d)))
            await Promise.all(dirs);
            await fspromise.rmdir(dir);                         // 直接删除目录就好了
        }
    } catch(e) {
        console.log('async e,', e)
    }
}

// traverseParallel(path.resolve(__dirname, "18"), () => {
//     console.log('done')
// })

traverseAsyncAwait(path.resolve(__dirname, "18")).then(res => {
    console.log('done')
})
