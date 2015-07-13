var mithril = require("mithril"),
    util = require("./util"),
    reqParams = null, 
    prevRoute = "";

var getParams = function() {
    var location = window.location.search,
        route = mithril.route();

    // keep a ref to reqParams so that getParams can be called as many times as 
    // needed and is only updated if the current route has changed
    if (prevRoute !== route) {
        location = route.split("?")[1];
        prevRoute = route;
    } else {
        return reqParams;
    }

    // if passed an empty string util.deparam returns a dictionary of mapping of
    // an empty to string to undefined, ensure that an empty string isn't passed
    reqParams = location ? util.deparam(location) : {};
    return reqParams;
};

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

    reqParams = params;
    coat.route(route, params);

    // set the prevRoute so that getParams can return the params right away
    // without needed to call deparam
    prevRoute = coat.route();
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

    // set the prevRoute so that getParams can return the params right away
    // without needed to call deparam
    prevRoute = coat.route();
};

module.exports = {
    getParams: getParams,
    setRoutes: setRoutes,
    updateRoute: updateRoute,
    updateParams: updateParams
};