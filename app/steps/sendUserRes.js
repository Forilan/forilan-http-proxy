'use strict';

function sendUserRes(Container) {
  if (!Container.user.res.headersSent) {
    if (Container.options.stream) {
      Container.proxy.res.pipe(Container.user.res);
    } else {
      let res = Container.user.res.send(Container.proxy.resData);
      var resolverFn = Container.options.userResSendAfter;
      if (resolverFn) {
        resolverFn(Container.user.req, res);
      }

    }
  }
  return Promise.resolve(Container);
}


module.exports = sendUserRes;
