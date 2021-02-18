"use strict";

// * Breaks proxying into a series of discrete steps, many of which can be swapped out by authors.
// * Uses Promises to support async.
// * Uses a quasi-Global called Container to tidy up the argument passing between the major work-flow steps.

var assert = require("assert");
var debug = require("debug")("forilan-http-proxy");
var finalhandler = require('finalhandler');
var setPrototypeOf = require('setprototypeof');
var request = require('./lib/request');
var response = require('./lib/response');
var ScopeContainer = require("./lib/scopeContainer");
var buildProxyReq = require("./app/steps/buildProxyReq");
var copyProxyResHeadersToUserRes = require("./app/steps/copyProxyResHeadersToUserRes");
var decorateProxyReqBody = require("./app/steps/decorateProxyReqBody");
var decorateProxyReqOpts = require("./app/steps/decorateProxyReqOpts");
var decorateUserRes = require("./app/steps/decorateUserRes");
var decorateUserResHeaders = require("./app/steps/decorateUserResHeaders");
var handleProxyErrors = require("./app/steps/handleProxyErrors");
var maybeSkipToNextHandler = require("./app/steps/maybeSkipToNextHandler");
var prepareProxyReq = require("./app/steps/prepareProxyReq");
var resolveProxyHost = require("./app/steps/resolveProxyHost");
var resolveProxyReqPath = require("./app/steps/resolveProxyReqPath");
var sendProxyRequest = require("./app/steps/sendProxyRequest");
var sendUserRes = require("./app/steps/sendUserRes");

module.exports = function proxy(host, req, res, userOptions) {
    assert(host, "Host should not be empty");
    assert(req, "req should not be empty");
    assert(res, "res should not be empty");
    debug("[start proxy] " + req.path);

    req.res = res;
    res.req = req;
    setPrototypeOf(req, request);
    setPrototypeOf(res, response);
    var container = new ScopeContainer(req, res, host, userOptions);

    buildProxyReq(container)
        .then(resolveProxyHost)
        .then(decorateProxyReqOpts)
        .then(resolveProxyReqPath)
        .then(decorateProxyReqBody)
        .then(prepareProxyReq)
        .then(sendProxyRequest)
        .then(maybeSkipToNextHandler)
        .then(copyProxyResHeadersToUserRes)
        .then(decorateUserResHeaders)
        .then(decorateUserRes)
        .then(sendUserRes)
        .catch(function (err) {
            var resolver = container.options.proxyErrorHandler ? container.options.proxyErrorHandler : handleProxyErrors;
            resolver(err, res, null);
        });
};
