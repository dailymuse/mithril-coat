var util = require("./util");
var views = require("./views");
var controllers = require("./controllers");
var modules = require("./modules");
var model = require("./model");
var mithril = require("mithril");

var VERSION = "0.1.0";

options = {}

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

    // Module
    Module: modules.Module,

    // Model
    Model: model.Model,

    // Mithril
    m: mithril,
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
