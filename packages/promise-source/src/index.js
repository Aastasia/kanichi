/**
 * @format
 * @Author: Alvin
 * @Date 2020-04-15
 * @Last modified by: Alvin
 * @Last modified time: 2020-04-15
 */
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class Promise{
    constructor(executor){
        this.state = PENDING;
        this.value = undefined;
        this.reason = undefined;

        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];

        let resolve = value => {
            if (this.state === PENDING) {
                this.state = FULFILLED;
                this.value = value;
                this.onResolvedCallbacks.forEach(fn=>fn());
            }
        };

        let reject = reason => {
            if (this.state === PENDING) {
                this.state = REJECTED;
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn=>fn());
            }
        };

        try{
            executor(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }

    then(onFulfilled,onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
        let promise2 = new Promise((resolve, reject) => {
            if (this.state === FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            };
            if (this.state === REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            };
            if (this.state === PENDING) {
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0)
                });
            };
        });
        return promise2;
    }

    catch(fn){
        return this.then(null,fn);
    }
}

function resolvePromise(promise2, x, resolve, reject){
    if(x === promise2){
        return reject(new TypeError('Chaining cycle detected for promise'));
    }

    // 防止多次调用
    let called;
    if (x != null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, y => {
                    if(called)return;
                    called = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, err => {
                    if(called)return;
                    called = true;
                    reject(err);
                })
            } else {
                resolve(x);
            }
        } catch (e) {
            if(called)return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}
//resolve方法
Promise.resolve = function(val){
    return new Promise((resolve, _)=>{
        resolve(val)
    });
}
//reject方法
Promise.reject = function(val){
    return new Promise((_, reject)=>{
        reject(val)
    });
}
//race方法
Promise.race = function(promises){
    return new Promise((resolve,reject)=>{
        for(let i=0; i<promises.length; i++){
            // 哪个结果先返回就先执行resolve
            promises[i].then(resolve,reject)
        };
    })
}
//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
Promise.all = function(promises){
    let arr = [];
    let i = 0;
    function processData(index,data){
        arr[index] = data;
        i++;
        if(i == promises.length){
            resolve(arr);
        };
    };
    return new Promise((resolve,reject)=>{
        for(let i=0;i<promises.length;i++){
            promises[i].then(data=>{
                processData(i,data);
            },reject);
        };
    });
}

// 测试专用代码
Promise.deferred = function () {
    let defer = {}
    defer.promise = new Promise((resolve, reject) => {
        defer.resolve = resolve
        defer.reject = reject
    })
    return defer
}

try {
    module.exports = Promise
} catch (e) {

}
