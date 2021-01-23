/**
 * 二叉树这种数据结构，在某些方面是性能高，但操作起来相对复杂。就是mannully expensive, but efficient for machine的感觉
 * 
 * 二叉搜索树
 * 二叉搜索树一定是可以进行比较的数据
 * 左子树的值比中间节点小，右子树的值比中间节点大
 * 
 * 遍历：
 *  - 前序、中序（按照某种顺序）、后序；层序； 
 *  - 深度遍历；广度遍历
 *  - 遍历主要就是两种方式：循环和递归。针对有儿子的，既可以用递归也可以用循环来实现遍历，对于层序遍历只能用循环，没法用递归，因为它不涉及儿子。
 *  - 递归的一个问题是，递归不能中断？记得好像是这样。可以退出，但是不能中断？循环是可以跳跃、中断的
 *  
 * 一个思考：
 *         在用递归的方式进行遍历的时候，递归的思路是，想清楚第一二层就可以，它的思路是在脑海中串起所有。但是循环遍历，可能借助队列或者栈的方式去循环，则这个思路可能是放进去几个就出来几个，并不是要吧所有的数据都放在队列或者栈中再去循环操作。比如用循环的方式，借助队列或者栈去实现层序遍历、前序遍历。
 * 
 * 实现树的反转
 * 
 */
class Node {
    constructor(element, parent) {
        this.element = element;
        this.parent = parent;
        this.left = null;
        this.right = null;
    }
}

class Tree {
    constructor(compare) {
        this.root = null
        this.compare = compare || this.compare;
    }
    compare(e1, e2) {
        return e1 > e2
    }
    add (element) {
        if (!this.root) {
            this.root = new Node(element, null);
            return;
        }
        let currentNode = this.root;
        let parent;
        while(currentNode) {                                               // 用while循环来代替递归调用。如果这里不写while循环，就写方法递归调用；
            let compare = this.compare(currentNode.element, element);
            parent = currentNode;
            if (compare) {
                currentNode = currentNode.left
            } else {
                currentNode = currentNode.right
            }
        }
        let node = new Node(element, parent);
        if (this.compare(parent.element, element)) {
            parent.left = node
        } else {
            parent.right = node
        }
    }
    
    // 遍历：普通的递归前序遍历。递归的方式最通用，最好理解，但是很可能会造成内存溢出，比如当数据量很大，层级很深的时候。因为递归的调用栈在代码执行的时候是始终存在的。
    recursedPreOrderTraverse(callback) {
        function next(node) {
            callback(node);
            if (node.left !== null) {
                next(node.left);
            }
            if (node.right !== null) {
                next(node.right)
            }
        }
        next(this.root)
    }

    // 遍历：用循环来实现层序遍历。依靠/借助一个队列（先进先出）的方式来实现
    levelOrderTraverse(callback) {
        let queue = [];    // 表示队列的方式有很多，这里用数组来表示
        queue.push(this.root);
        while (queue.length) {
            let currentnode = queue.shift();
            callback(currentnode);
            if (currentnode.left) {
                queue.push(currentnode.left)
            }
            if (currentnode.right) {
                queue.push(currentnode.right)
            }
        }
    }

    // 遍历：用循环来实现前序遍历。依靠/借助一个栈（先进后出）的方式来实现
    loopPreOrderTraverse(callback) {
        let stack = [];
        stack.push(this.root);
        while (stack.length) {
            let currentnode = stack.pop();
            callback(currentnode);
            if (currentnode.right) {
                stack.push(currentnode.right)
            }
            if (currentnode.left) {
                stack.push(currentnode.left)
            }
        }
    }


    // 树的反转，就是照镜子的感觉，镜像
    reverse(){
        let queue = [];
        queue.push(this.root);
        while (queue.length) {
            let currentnode = queue.shift();
            let temp = currentnode.left;
            currentnode.left = currentnode.right;
            currentnode.right = temp;
            if (currentnode.left !== null) {
                queue.push(currentnode.left)
            }
            if (currentnode.right !== null) {
                queue.push(currentnode.right)
            }
        }
        return this.root;
    }
}

let tree = new Tree((e1, e2) => {
    return e1.id > e2.id
    // return e1.id - e2.id   // 不能这么写，因为负数也是true
});
tree.add({
    id: 10
});
tree.add({
    id: 8
});
tree.add({
    id: 6
});
tree.add({
    id: 19
});
tree.add({
    id: 16
});
tree.add({
    id: 22
});
tree.add({
    id: 20
});
console.dir(tree, {depth: 100});

const callback = node => {
    console.log(node.element.id)
}
// tree.loopPreOrderTraverse(callback);

console.dir(tree.reverse(), {
    depth: 1000
});