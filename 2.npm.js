/**
 * 1)文件模块
    * 1. 默认会先找文件，没有后缀名会添加.js、.json 
    * 2. 文件找不到，再找文件夹，下面的index.js
    * 3. 但是如果目录中有package.json，并且指定main入口，那么会去找main指定的入口文件。 这是新版本规范好的，比较合理。
    * 4. 如果没有写相对路径或者绝对路径，那么会认为引用的模块是第三方模块，或者核心模块
 * 
 * 2)第三方模块（安装在本地的）
    * 1. 都会安装到同级目录的node_modules下面
    * 2. 如果同级目录下面的node_modules下面没有找到，则会沿着module.paths向上查找
 * 
 * 3)安装到全局上面的第三方
    * 1. 安装的时候带有 -g的
    * 2. 全局安装的第三方模块只能在命令行中使用
 * 
 * 4)写一个全局包
    * 1. package.json
    * 2. bin目录
    *       www文件，可执行文件
    *       #! /usr/bin/env node
    * 3. 在package.json中指定bin属性对应的www文件
    * 4. npm link把本地包link到全局下
    * 5. 发布包 npm addUser, npm publish， 再npm install
    * 
 *
 * 5) npm install --production 只安装生产要用到的包，不安装开发依赖
 * 
 * 6）包的依赖：
    * 1. 普通的 -S， -D，可以通过npm install --production来看看差别
    * 2. 同版本依赖, peerDependencies。只是做一个提示而已，要自己手动安装
    * 3. 捆绑依赖 bundledDependencies是个数组。npm pack，把当前项目打包成压缩包。它默认是只会打包自己的文件，不会打包node_modules的。加上捆绑依赖就可以node_modules中的第三方包了，但是是自己捆绑的。
    * 4. 可选依赖，一般用不到
 * 
 * 7) 版本：major, minor, patch
 *      ^2.0.0 二版本以上，三版本以下
 *      ~1.2.0 1.2～1.3之间
 *      >=, <=
 *      没有符号，固定版本
 * 
 * 8) package-lock.json，锁定版本的。现在自动生成的，不需要去管他。确保不同人在进行协作的时候，依赖的包的版本是相同的。锁定版本。比如^6.2.0，如果没有lock文件，可能在包的版本更新到6.3.0的时候，别人下载项目就会安装这个^6.3.0版本。
 * 
 * 9) scripts脚本 npm run，举例mime安装在全局和本地。 npm run env, npm run path
 * 10) npx 直接运行node_modules/.bin文件夹下的命令。所以这个命令是依赖你项目本地安装的包的。如果项目本地node_modules中没有这个包，npx会先去下载这个包，再执行脚本，然后再删除这个包。所以npx就是比npm run多了一个下载功能。npx多是自己开发时候方便，开发项目时候基本上不会用npx。比如自己开发项目时npx create-react-app，用完就删了
 * 
 * 11)yarn 和 npm不要混用，混用会丢包
 */

const r = require("./jquery")
console.log('r',r)

console.log(module.paths)

