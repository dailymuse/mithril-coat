var mithril = require("mithril"),
    util = require("./util"),
    reqParams = null;

var getParams = function() {
    var location = window.location.search;

    if (reqParams === null) {
        if (location) {
            reqParams = util.deparam(location);
        } else {
            reqParams = {};
        }
    }

    return reqParams;
}

var setRoutes = function($rootEl, routes) {
    if (!routes) {
        throw new Error("No routes specified");
    }

    if ($rootEl.length === 0) {
        throw new Error("No $rootElt specified");
    }

    mithril.route.mode = "pathname";
    mithril.route($rootEl[0], "/", routes);
};

var _publishUpdate = function(route, params) {
    coat.publish("coat.route", {
        route: route,
        params: params
    });
};

var updateRoute = function(route, params) {
    var route = route || window.location.pathname,
        params = params || {};

    reqParams = params;
    coat.route(route, params);
    _publishUpdate(route, params);
};

var updateParams = function(params) {
    var val;

    for (key in params) {
        val = params[key];

        if (val.length == 0 && key in params) {
            delete reqParams[key];
        } else {
            reqParams[key] = val;
        }
    }

    coat.route(window.location.pathname, reqParams);
    _publishUpdate(window.location.pathname, reqParams);
};

module.exports = {
    getParams: getParams,
    setRoutes: setRoutes,
    updateRoute: updateRoute,
    updateParams: updateParams
};