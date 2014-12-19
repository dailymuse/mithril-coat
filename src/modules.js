var mithril = require("mithril");

var Module = function(controller, view) {
    this._controller = controller;
    this._controller.bindView(view);
    this._view = view;
    this._view.bindController(controller);
};

Module.prototype.controller = function() {
    return this._controller;
};

Module.prototype.view = function() {
    return this._view.render();
};

Module.prototype.activate = function() {
    return mithril.module(this._view.$el[0], this);
};

module.exports = {
    Module: Module
};
