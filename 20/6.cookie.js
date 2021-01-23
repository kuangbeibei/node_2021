/**
 * cookie, session, localStorage, sessionStorage, indexDB, web sql
 * 
 * 1. cookie 因为是http无状态的，cookie解决身份认证用的，识别身份。可以客户端设置，也可以服务端设置。服务器相当于是饭店，不知道谁来了。cookie相当于去办了会员卡。cookie的高级设置有，优化，http-only，secure，domain等。cookie不可跨域读取。一级域名、二级域名的考虑。设置cookie之后，request headers上请求接口时会自动携带cookie。大小限制是4k。所以携带的cookie不能够过大，cookie太大可能会造成页面白屏、浪费带宽、流量。还要定期删除cookie。cookie不太安全，因为cookie是存放在客户端，不能存饭敏感信息。比如购物车信息可以放在cookie中。客户端可以篡改cookie
 * 2. session 存在服务端，解决cookie不安全的问题。session是基于cookie实现的。
 * 3. localStorage 本地存储，存放资源。关闭网页后，下次访问依旧可以获取。解决接口请求耗性能问题，可以把一些资源放在localStorage中。可以在客户端永久保存，除非手动清除。一般是5M
 * 4. sessionStorage 解决页面之间的通信，用于页面之间传递值，生命周期只是会话时间，关闭网页就没了。
 * 5. indexDB 可以存放上兆的数据
 * 
 * 一般业务逻辑设置cookie，这个和缓存不一样。缓存etag什么的可以用nginx去设置。nginx有配置缓存的一些策略。
 * service worker主要是做离线缓存
 * 
 */

