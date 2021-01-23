/**
 * 基于数据结构去生成二叉树数据结构，并且二叉树还能还原为原来的结构
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
    constructor(compare){
        this.root = null;
        this.compare = compare || this.compare; 
    }
    add(element) {
        if (this.root === null) {
            this.root = new Node(element, null);
            return;
        }
        let currentNode = this.root;
        let parent;

        while(currentNode) {                                // 一开始想用递归的方式去做，但是想来想去觉得很复杂。用while循环可以达到目的。思考：如果思路想的很复杂，或者实现起来很复杂，就要换个思路。
            parent = currentNode;
            let compare = this.compare(currentNode.element, element);
            if (compare) {
                currentNode = currentNode.left;
            } else {
                currentNode = currentNode.right;
            }
        }

        let node = new Node(element, parent);

        if (this.compare(parent.element, element)) {
            parent.left = node;
        } else {
            parent.right = node;
        }
        
    }

    compare(e1, e2) {
        return e1 > e2      // 不可以e1 - e2哦，因为负数转成bool也是true
    }

    // remove 删除挺复杂的
    
    // 前序遍历，用while循环是实现不了的！！！！自己看看这里面的坑。用while循环，是串不起来，一定会“断”。
    traversePreOrderWrong(callback){
        let currentnode = this.root;
        while(currentnode !== null) {
            callback(currentnode);
            if (currentnode.left !== null) {
                currentnode = currentnode.left;
            }
            if (currentnode.right !== null) {
                currentnode = currentnode.right;
            }
        }
    }

    // 遍历 - 前序遍历，递归的方式。要用递归的方式，是“串”的起来。看看这样做为啥又只能遍历出10，5，9
    traversePreOrderWrongTwo(callback) {
        let curnode = this.root;            // 这样实现不了
        function next() {
            callback(curnode);
            if (curnode.left !== null) {
                curnode = curnode.left;
                next(curnode)
            }
            if (curnode.right !== null) {
                curnode = curnode.right;
                next(curnode)
            }
        }
        next()
    }

    // 遍历 - 前序遍历，递归。
    traversePreOrder(callback) {            // 区别这个和上面的，递归是用自身去调用自身。如果变量都来自外部，很可能是无法完成“一串”的
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

    // 层序遍历 - 利用构建一个队列来实现，并且要用到队列的前进先出。
    traverseLevelOrderOne(callback) {                       //  这样虽然能够实现，但是没有用到队列的特性
        let queue = [];                 
        let index = 0;
        queue.push(this.root);
        while(queue[index]) {
            let node = queue[index++]
            callback(node)
            if (node.left !== null) {
                queue.push(node.left);
            }
            if (node.right !== null) {
                queue.push(node.right)
            }
        }
    }

    // 层序遍历。感觉要用while循环，前提是线性处理的。因为while循环本质也就是性能更好的for循环。
    traverseLevelOrder(callback) {
        let queue = [];
        queue.push(this.root);
        while(queue.length) {
            let node = queue.shift();
            callback(node)
            if (node.left !== null) {
                queue.push(node.left);
            }
            if (node.right !== null) {
                queue.push(node.right)
            }
        }
    }

    // 用循环来实现前序遍历，构建一个栈。
    traversePreOrderWithLoop(callback) {
        let stack = [];
        stack.push(this.root);
        while(stack.length) {
            let node = stack.pop();                 // 好高级
            callback(node);
            if (node.right) {
                stack.push(node.right)
            }
            if (node.left) {
                stack.push(node.left)
            }
        }
    }


    // 二叉搜索树镜像
    reverse() {                         // 要用while循环一定要构建一个线性结构
        let queue = [];
        queue.push(this.root);
        while(queue.length) {
            let node = queue.shift();
            let tempLeft = node.left;
            node.left = node.right;
            node.right = tempLeft;
            if (node.left !== null) {
                queue.push(node.left);
            }
            if (node.right !== null) {
                queue.push(node.right)
            }
        }
        return this.root
    }
}

let t = new Tree();
t.add(10);
t.add(5);
t.add(19);
t.add(9);
t.add(18);
console.dir(t, {
    depth: 100
})

// t.traverseLevelOrder(ele => {
//     console.log(ele.element)
// });

console.log(t.reverse())