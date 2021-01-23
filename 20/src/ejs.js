/**
 * 模版引擎的原理其实就是 with + new Function，还有拼接字符串的能力
 */
const fs = require('fs').promises;

let ejs = {
    async renderFile(templateUrl, data) {
        let content = await fs.readFile(templateUrl, 'utf8');

        content = content.replace(/<%=(.+?)%>/g, function(str, group, i) {                 // .+? 尽可能少取
            return '${' + group + '}'
        }) 


        // 数据是数组要循环的情况
        let head = 'let html = ``; \r\n with (data) {';                                           // 有些情况不能用反引号代替单引号，比如这里拼接字符串。因为拼接的是，字符串里面还有字符串，如果外层用反引号而内部用单引号的话，内部还需要用+串起来才行
        head += 'html += `';
        let body = content.replace(/<%(.+?)%>/g, (str, group, i) => {
            return '`\r\n  ' + group + '\r\n html+=`';
        });
        
        let tail = '`}; return html';

        let templateStr = head + body + tail;

        try {
            let fn = new Function('data', templateStr)                                                     // new Function的好处，可以隔离作用域，会创建一个和全局平行的作用域
            return fn(data)
        } catch(e) {
            console.log('error: ', e)
        }
       
        // 数据非数组不用循环的情况
        // return content.replace(/<%=(.+?)%>/g, function(str, group, i) {                 // .+? 尽可能少取
        //     console.log('str', str, 'group', group, 'i', i)
        //     return data[group]
        // })               
    }
}

// 对于数据是数组的渲染思路
//

module.exports = ejs;