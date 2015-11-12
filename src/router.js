var mithril = require("mithril"),
    util = require("./util"),
    reqParams = null, 
    prevRoute = "";

/*
get the current query parameters of the current mithril page. Can only be called 
after setRoutes has been called because it relies on mithril.route(), which 
can't be called till after the routes have been initialized. Returns a mapping
of query parameter keys to their values.
*/
var getParams = function() {
    var location = window.location.search,
        route = mithril.route();

    // keep a ref to reqParams so that getParams can be called as many times as 
    // needed and is only updated if the current route has changed
    if (route && prevRoute !== route) {
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

/* 
sets the routes for the current page.
@param [jQuery] $rootEl the jQuery element to insert the mithril coat component
@param [Object] routes routes is an object mapping the path to the mithril 
component for that route just like in mithril. 
*/
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

var publishUpdate = function(route, params) {
    // set the prevRoute so that getParams can return the params right away
    // without needed to call deparam
    prevRoute = coat.route();

    coat.publish("coat.route", {
        route: route,
        params: params
    });
};

/* 
update the current route - used when you want to update the path or when you 
want to remove the current params that are being routed on.
@param [String] route the new path
@param [Object] params a key value mapping of query parameters to their values
@param [Boolean] shouldReplaceHistory boolean for whether the window history
should be replaced
*/
var updateRoute = function(route, params, shouldReplaceHistory) {
    var route = route || window.location.pathname,
        params = params || {};

    reqParams = params;
    coat.route(route, params, shouldReplaceHistory);
    publishUpdate(route, params);
};

/* 
update the params of the current page. this provides a convenience when there
are a lot of existing parameters and you only need to update a few. it 
auto deletes parameters that aren't needed anymore and routes to the current
location.
@param [Object] params a key value mapping of query parameters to their values
@param [Boolean] shouldReplaceHistory boolean for whether the window history
should be replaced
*/
var updateParams = function(params, shouldReplaceHistory) {
    var val,
        key;

    for (key in params) {
        val = params[key];

        if (val.length === 0 && key in params) {
            delete reqParams[key];
        } else {
            reqParams[key] = val;
        }
    }

    coat.route(window.location.pathname, reqParams, shouldReplaceHistory);
    publishUpdate(window.location.pathname, reqParams);
};

module.exports = {
    getParams: getParams,
    setRoutes: setRoutes,
    updateRoute: updateRoute,
    updateParams: updateParams
};