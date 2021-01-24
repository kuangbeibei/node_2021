- express 及原理
express是一个http服务的框架，把node的http进行了封装
express的功能比较全面，koa的功能比较小巧
express完全是基于回调的方式去编写代码

webpack内部全部集成express



#中间件，中间件参数 路由可以不写，默认是/；然后就是handler。和Router很像，只不过内部没有route，只有handler
中间件一般写在路由的前面