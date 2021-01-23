// 第一步，整个html变成字符串
// 第二步，去掉尖角号、百分号
// 第三步，把要渲染的整个字符串放到函数中，这样里面的js语句才可以执行
// 第四步，用with提升变量

function render(data) {
    let html;
    with (data) {                                           // with语法指定了该作用域里面arr的上下文this是data
        html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>`;

        arr.forEach(item => {
            html += `<li> 123 </li>`
        });

        html += `</body>
            </html>`;
    }
    return html;
}

console.log(render({
    arr: [1,2,3]
}))
