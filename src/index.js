var util = require("./util"),
    views = require("./views"),
    controllers = require("./controllers"),
    modules = require("./modules"),
    model = require("./model"),
    router = require("./router"),
    mithril = require("mithril"),
    PubSub = require("pubsub-js");

var VERSION = "0.1.0";

options = {}

module.exports = {
    // Versioning info
    version: VERSION,

    // Utils
    map: util.map,
    deparam: util.deparam,
    captureEvents: util.captureEvents,

    // Views
    View: views.View,
    TemplatedView: views.TemplatedView,

    // Controllers
    Controller: controllers.Controller,

    // Module
    Module: modules.Module,

    // Model
    Model: model.Model,

    // Router
    Router: router.Router,

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
    autoredraw: mithril.autoredraw,
    startComputation: mithril.startComputation,
    endComputation: mithril.endComputation,
    deps: mithril.deps
};
