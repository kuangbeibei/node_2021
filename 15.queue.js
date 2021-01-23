/**
 * 用链表来实现队列（不用传统的数组方式，这样在头尾操作的时候，不会有数组塌陷）
 */

const LinkedList = require('./14.linkedlist');

class Queue {
    constructor() {
        this.ll = new LinkedList();
    }
    add(element) {     //  从尾部添加
        this.ll.add(element);
    }
    offer() {   // 从头部取出
        return this.ll.remove(0);
    }
}

const queue = new Queue();
queue.add(1);
queue.add(2);
console.log(queue)
console.log(queue.offer())
console.log(queue.offer())
