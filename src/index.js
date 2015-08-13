var util = require("./util"),
    views = require("./views"),
    controllers = require("./controllers"),
    modules = require("./modules"),
    model = require("./model"),
    router = require("./router"),
    mithril = require("mithril"),
    PubSub = require("pubsub-js");

var VERSION = "0.2.0-delta";

options = {}

// only to see pubsub events
PubSub.immediateExceptions = true;

module.exports = {
    // Versioning info
    version: VERSION,

    // Utils
    map: util.map,
    deparam: util.deparam,

    // Views
    View: views.View,
    TemplatedView: views.TemplatedView,

    // Controllers
    Controller: controllers.Controller,

    // Model
    Model: model.Model,

    // Module
    initModule: modules,

    // Router
    getParams: router.getParams,
    setRoutes: router.setRoutes,
    updateRoute: router.updateRoute,
    updateParams: router.updateParams,

    // PubSub
    unsubscribe: PubSub.unsubscribe,
    publish: PubSub.publish,
    publishSync: PubSub.publishSync,
    clearAllSubscriptions: PubSub.clearAllSubscriptions,

    // Mithril
    m: mithril,
    trust: mithril.trust,
    prop: mithril.prop,
    withAttr: mithril.withAttr,
    route: mithril.route,
    request: mithril.request,
    deferred: mithril.deferred,
    redrawStrategy: mithril.redraw.strategy,
    startComputation: mithril.startComputation,
    endComputation: mithril.endComputation,
    deps: mithril.deps
};
