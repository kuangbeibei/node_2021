/**
 * promise可以解决多个异步并行执行的问题
 * 可以解决异步嵌套的问题
 * 链式调用靠的是return
 * 
 * promise中只有两种情况会被reject，一种是自行reject，另一种是代码在执行过程中出错或者throw了Error
 * 如果reject中返回一个普通值，会成为下一个then的成功函数的参数
 */
const PENDING = 'PENDING';
const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';

function resolvePromise2X(promise2, x, resolve, reject) {
    if (typeof x !== 'object' || x === null) {
        resolve(x)      // promise2中的resolve
    } else {
        let called = false;
        try {
            let then = x.then;
            if (then && typeof then === 'function') {
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise2X(promise2, y, resolve, reject)
                }, r => {
                    if (called) return;
                    called = true;
                    reject(r)
                })
            } else {
                resolve(x)
            }
        } catch(e) {
            if (called) return;
            called = true;
            reject(e)
        }
    }
}

class Promise {
    constructor(executor) {
        this.value = undefined;
        this.reason = undefined;
        this.status = PENDING;
        this.fulfilledCbs = [];
        this.unfulfilledCbs = [];

        const resolve = value => {
            if (this.status === PENDING) {
                if (value && value.then && typeof value.then === 'function') {
                    return value.then(resolve, reject)  // 在这里，resovle和reject充当then函数中的两个参数,onFullfiled和onRejected。构造函数中的resolve
                }
                this.status = RESOLVED;
                this.value = value;
                this.fulfilledCbs.forEach(cb => cb(value))
            }
        }

        const reject = reason => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
                this.unfulfilledCbs.forEach(cb => cb(reason))
            }
        }
        
        try {
            executor(resolve, reject)
        } catch(e) {
            reject(e)
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'undefined' ? val => val : onFulfilled;
        onRejected = typeof onRejected === 'undefined' ? err => {throw new Error(err)} : onRejected;

        let promise2, x;
        promise2 = new Promise((resolve, reject) => {
            if (this.status === RESOLVED) {
                setTimeout(() => {
                    try {
                        x = onFulfilled(this.value);
                        resolvePromise2X(promise2, x, resolve, reject);
                    } catch(e) {
                        reject(e)
                    }
                }, 0)
            }
            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        x = onRejected(this.reason);
                        resolvePromise2X(promise2, x, resolve, reject);
                    } catch(e) {
                        reject(e)
                    }
                }, 0)
            }
            if (this.status === PENDING) {
                this.fulfilledCbs.push(v => {
                    try {
                        x = onFulfilled(v);
                        resolvePromise2X(promise2, x, resolve, reject);
                    } catch(e) {
                        reject(e)
                    }
                });
                this.unfulfilledCbs.push(r => {
                    try {
                        x = onFulfilled(r);
                        resolvePromise2X(promise2, x, resolve, reject);
                    } catch(e) {
                        reject(e)
                    }
                });
            }
        });
        return promise2;
    }

    static resolve(val) {
        return new Promise((resolve, reject) => {
            resolve(val)
        })
    }
}

// 测试
let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(new Promise((resolve, reject) => {
            resolve(500)
        }))
    }, 0)
}).then(v => {
    return new Promise((resolve, reject) => {
        resolve(new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(v+1)
            }, 0)
        }).then(() => {
            
        }))
    })
})
setTimeout(() => {
    console.log('promise---',promise)
}, 2000)
let promise2 = promise.then(v => {
    console.log('success', v)
})
setTimeout(() => {
    console.log('promise222',promise2)
}, 2000)


// // 测试
// new Promise((resolve, reject) => {
//     resolve(new Promise((res, rej) => {
//         res(100)
//     }))
// }).then(r => {                    // 第一个then是前面 new Promise这个实例的原型上的then方法
//     return new Promise((res, rej) => {
//         res(r + 1)
//     })
// }).then(x => {                    // 后面的then，是前面一个then函数返回的promise2 这个实例原型上的then方法，所以x是前面那个promise2中resolve的值
//     console.log('2', x)
// })


// // interview test
// Promise.resolve().then(() => {
//     console.log('then1')
//     Promise.resolve().then(() => {
//         console.log('then1-1');
//         return Promise.resolve()
//     }).then(() => {
//         console.log('then1-2')
//     })
// }).then(() => {
//     console.log(2)
// }).then(() => {
//     console.log(3)
// }).then(() => {
//     console.log(4)
// }).then(() => {
//     console.log(5)
// })

// // then1
// // then1-1
// // 2
// // 3
// // 4
// // then1-2
// // 5


// // 红绿灯
// (function light() {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             console.log('red');
//             resolve()
//         }, 2000)
//     }).then(() => {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 console.log('green');
//                 resolve(1)     // 因为resolve在定时器里面，所以status是PENDING的状态，后续的onFulfilled或者onRejected函数会放在callbacks里面，等到resolve执行了之后，再发布执行
//             }, 2000)
//         })

//         // 上下区别，promise的then的链式调用，(异步的时候)是靠return new Promise来实现的

//         // return Promise.resolve(1).then((r) => {
//         //     setTimeout(() => {
//         //         console.log('green');
//         //     }, 4000)
//         //     return r
//         // })

//     }).then((r) => {
//         console.log('r',r, '-------')
//         return light()
//     })
// })()