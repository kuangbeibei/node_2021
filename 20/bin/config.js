// 自定义需要显示在命令行中的命令

const config = {
    "port": {
        option: "-p, --port <n>",
        descriptor: "set your server port",
        default: 8080,
        usage: "kk-hs --port <n>"
    },
    "directory": {
        option: "-d, --directory <n>",
        descriptor: "set your server start directory",
        default: process.cwd(),
        usage: "kk-hs --dir <n>"
    },
    "cache": {
        option: "-c, --cache <n>",
        descriptor: "set your server cache",
        default: "no-cache",
        usage: "kk-hs --cache <n>"
    }
}

module.exports = config;