/**
 * 目录就是个多叉树结构
 * 
 * 文件夹的递归删除
 *
 * api:
 * fs.readdir
 * fs.stat
 * fs.mkdir
 * fs.rmdir
 * fs.unlink
 * 串行和并行
 * 串行就是递归的方式，递归就是深度优先
 * 并行是循环的方式，循环就是广度优先
 *
 * 用async await写
 * 用promise写
 */
const path = require("path");
const fs = require("fs");
const fs_promise = require('fs').promises;

//  异步串行，递归删除（先删除儿子，再删除爹），深度优先，两层递归。
function traverseSerial(dir, cb) {
    fs.stat(dir, (err, statObj) => {
        if (statObj.isDirectory()) {
            fs.readdir(dir, (err, dirs) => {
                dirs = dirs.map(d => path.join(dir, d));
                let index = 0;

                function next() {
                    if (index === dirs.length) {
                        return fs.rmdir(dir, cb)
                    };
                    let current = dirs[index++];
                    traverse(current, next) // 神奇的一笔。好晕好晕啊
                }
                next()
            })
        } else {
            fs.unlink(dir, cb)
        }
    })
}

//  广度优先的思路，要维护一个队列，然后再根据后进先出，倒叙的删除。这样性能不太好。因为相当于操作了两次，第一次维护一个队列，第二次再从队列中依次取出删除
function traverseBroadFirst(dir, cb) {
    let queue = [dir];
    let idx = 0;  //  指针
    function remove() {
        console.log(idx, queue);
        if (idx <= 0) return cb();
        let item = queue[--idx];
        fs.stat(item, (err, statObj) => {
            if (statObj.isFile()) {
                fs.unlink(item, remove)
            } else {
                fs.rmdir(item, remove)
            }
        })
    }
    fs.stat(dir, (err, statObj) => {
        if (statObj.isFile()) {
            fs.unlink(dir, cb)
        } else {                                                    //  采用广度优先的方式
            function next() {
                let dir = queue[idx++];
                console.log('queue',queue)
                if (!dir) {
                    // 进行删除
                    idx--;
                    return remove()
                };
                fs.stat(dir, (err, statObj) => {
                    if (statObj.isFile()) {
                        // queue.push(dir);     // 会死循环，因为在目录的时候已经被push到queue里了
                        next();     // 让指针往下一个就好了
                    } else {
                        fs.readdir(dir, (err, dirs) => {
                            dirs = dirs.map(d => path.join(dir, d));
                            queue.push(...dirs);
                            next()
                        })
                    }
                })
            }
            next();
        }
    })
}

// 异步并行，并行就是循环，需要个计数器来知道是否完成，这也是深度哦。
function traverseParallel(dir, cb) {
    fs.stat(dir, (err, statObj) => {
        if (statObj.isFile()) {
            fs.unlink(dir, cb)
        } else {
            fs.readdir(dir, (err, dirs) => {
                dirs = dirs.map(d => path.join(dir, d));
                if (dirs.length === 0) return fs.rmdir(dir, cb);    // 就不用循环了
                let len = dirs.length;
                let index = 0;
                function next() {
                    if (++index === len) {
                        return fs.rmdir(dir, cb)
                    }
                }
                dirs.forEach(d => {                                 // 循环写在next外面，不然会打印多个done
                    traverseParallel(d, next)
                })
            })
        }
    })
}

// 用Promise.all来优化异步并行，并发删除。也是深度优先。只要是递归，就是深度优先，先子后父。递归-深度的遍历，如果从头两层很难想通，就从最后两层想。递归只需要考虑前后两层就好。
function traversePromiseParallel(dir) {
    return new Promise((resolve, reject) => {
        fs.stat(dir, (err, statObj) => {
            if (err) reject(err);
            if (statObj.isFile()) {
                fs.unlink(dir, resolve)
            } else {
                fs.readdir(dir, (err, dirs) => {
                    if (err) reject(err);
                    dirs = dirs.map(d => traversePromiseParallel(path.join(dir, d)));               // 高级啊
                    Promise.all(dirs).then(res => {
                        fs.rmdir(dir, resolve)
                    }).catch(e => {
                        reject(e)
                    })
                })
            }
        })
    })
}


// 终极，使用async和await来改造。太高级了..
async function traverseAsyncAwaitParallel(dir) {
    try {
        let statObj = await fs_promise.stat(dir);
        if (statObj.isDirectory()) {
            let dirs = await fs_promise.readdir(dir);
            dirs = dirs.map(d => traverseAsyncAwaitParallel(path.join(dir, d)));        // 将所有子文件删除，并用promise.all包裹起来
            await Promise.all(dirs);
            await fs_promise.rmdir(dir)
        } else {
            await fs_promise.unlink(dir)
        }
    } catch(e) {
        console.log('async e,', e)
    }
}

traverseAsyncAwaitParallel(path.resolve(__dirname, "18")).then(() => {
    console.log('done');
})

// traverseParallel(path.resolve(__dirname, "18"), () => {
//     console.log('done')
// });