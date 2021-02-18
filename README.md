基于express和express-http-proxy修改的适用于http模块的代理模块.

http middleware to proxy request to another host and pass response back to original caller.

## Install

```bash
$ npm install forilan-http-proxy --save
```

## Usage
```js
proxy(host, req, res, options);
```

### Example:

```js
var http = require('http')();
var proxy = require('forilan-http-proxy');

httpServer = http.createServer(function (req, res) {
    var host = "www.baidu.com";  
    proxy(host, req, res, {
        proxyErrorHandler: function (err, res, next) {
            console.log("proxyErrorHandler:" + err);
        },
        proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
            console.log("proxyReqOptDecorator");
            return proxyReqOpts;
        },

        proxyReqBodyDecorator: function (bodyContent, srcReq) {
            console.log("proxyReqBodyDecorator");
            return bodyContent;
        },
        proxyReqPathResolver: function (req) {
            console.log("proxyReqPathResolver");
            return req.url;
        },
        userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
            console.log("userResHeaderDecorator");
            return headers;
        },
        userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
            console.log("userResDecorator");
            return proxyResData;
        }
    });
}).listen(80);
```



## Licence

MIT
<!-- do not want to make nodeinit to complicated, you can edit this whenever you want. -->
