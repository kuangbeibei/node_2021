/**
 * * crypto
 * 
 * md5（摘要算法） sha1 sha256 （加盐算法，也是摘要的一种） （这些都不是加密算法，不是加密。加密算法表示能解密。）
 * 有些人或网站说md5可以反解，是指“碰撞”，撞库，很暴力。1. md5不能反解，但可能会被暴力破解，比如做个字典去碰撞，撞库，这是由于第4点特性；2.摘要只是摘文件的某个部分，不能根据摘要的结果反推摘要前的确切样子；3.雪崩效应，如果内容有一点变化，摘要的结果完全不同；4.相同的值摘要出的结果相同。
 * 加盐算法，比单纯md5更可靠。因为md5的上述第四个特点，相同的值摘要出的结果相同。比如服务器在对用户密码进行md5算法后，相同密码的md5摘要是一定相同的。这时候就需要加盐。加的盐值不同，结果不同。当然如果加的盐值相同，结果还是一样。加盐的盐值存在服务器里，不知道盐值就无法破解。
 * 还可以采用3轮以上的md5进行反复摘要，基本上就无法破解了。
 */
const crypto = require('crypto');

//update后面支持string和buffer，不支持数字。digest可以是hex、base64等，在进行传输时我们更多选择base64
let r1 = crypto.createHash('md5').update('123').update('456').digest('base64');         // 这么写是可以边读边摘要
let r2 = crypto.createHash('md5').update('123456').digest('base64');
console.log(r1 === r2);    

// 加盐，zfpx就是盐值。如果要摘要的内容一样，但是盐值不一样，结果也就不一样。
let r3 = crypto.createHmac('sha1', 'zfpx').update('456').digest('base64');
let r4 = crypto.createHmac('sha1', 'zfpx1').update('456').digest('base64');
console.log(r3);
console.log(r4);
