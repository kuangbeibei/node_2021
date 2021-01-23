/**
 * 做头尾操作性能高，是链表的优势
 * 
 * 这个链表结构还可以用二分查找去优化
 * 
 * 增删改查
 * add(element)
 * remove(index)
 * set(index, element)
 * get(index)
 * 
 */

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;           // 链表的长度
    }
    add(index, element) {        // 在某个为止增加，在最后的索引处添加是追加
        if (arguments.length === 1) {
            element = index;        // 在内部给形参赋值
            index = this.size;
        }
        if (index === 0) {
            let head = this.head;
            this.head = new Node(element, head);
        } else {                // 找到当前节点的为止，把当前节点替换成新的节点，并且让新的节点的next指向原来的即可
            let prevNode = this._node(index - 1);
            prevNode.next = new Node(element, prevNode.next);
        }
        this.size++;
    }
    remove(index) {             // 删除
        let removeNode;
        if (index === 0) {
            removeNode = this.head;
            this.head = this.head.next;     // 自动垃圾回收
        } else {
            let prevnode = this.get(index-1);       // 删除时看似性能很高，但也需要循环查找，也是O(N)
            // let node = this.get(index);
            // prevnode.next = node.next;

            if (!prevnode) return;
            removeNode = prevnode.next;
            prevnode.next = prevnode.next.next;
        }
        // 还要判断不存在的情况，就是越界情况
        this.size--;
        return removeNode.element;
    }

    set(index, element) {       // 修改，也需要循环
        let node = this.get(index);
        node.element = element;
        return node;
    }

    _node(index) {
        if (index < 0 || index > this.size) {           // 越界判断，抛出异常
            throw new Error(`${index} doesn't exist in linked list`);
        };             
        let current = this.head;
        for (let i = 0; i < index; i++) {
            current = current.next;
        }
        return current;
    }

    get(index) {                // 获取
        return this._node(index)
    }
}

class Node {
    constructor(element, next) {
        this.element = element;
        this.next = next;
    }
}

let ll = new LinkedList();
ll.add(0, 1);
ll.add(0, 2);
ll.add(0, 3);
ll.add(0, 10);
ll.add(3, 100);
ll.set(3,101);
console.log(ll.remove(0));
console.dir(ll, {depth: 10})


module.exports = LinkedList;