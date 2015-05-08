var mithril = require("mithril"),
    util = require("util"),
    reqParams = {};

var getParams = function() {
    var location;

    if (!reqParams) {
        location = window.location.search;

        if (location) {
            reqParams = util.deparam(location);
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

var updateRoute = function(route, params) {
    var route = route || window.location.pathname,
        params = params || {};

    coat.route(route, params);
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
};

module.exports = {
    getParams: getParams,
    setRoutes: setRoutes,
    updateRoute: updateRoute,
    updateParams: updateParams
};