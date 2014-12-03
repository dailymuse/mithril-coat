var util = require("./util");
var views = require("./views");
var controllers = require("./controllers");
var templates = require("./templates");
var mithril = require("mithril");

var VERSION = "0.1.0";

module.exports = {
    // Versioning info
    version: VERSION,

    // Utils
    map: util.map,
    deparam: util.deparam,
    app: util.app,
    module: util.module,

    // Templates
    _templates: templates.templates,
    render: templates.render,
    template: templates.register,

    // Views
    View: views.View,
    TemplatedView: views.TemplatedView,

    // Controllers
    Controller: controllers.Controller,

    // Mithril
    m: mithril,
    prop: mithril.prop,
    withAttr: mithril.withAttr,
    route: mithril.route,
    request: mithril.request,
    deferred: mithril.deferred,
    startComputation: mithril.startComputation,
    endComputation: mithril.endComputation,
    deps: mithril.deps
};
