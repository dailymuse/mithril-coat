var mithril = require("mithril");

var Module = function(controller, view) {
    this._controller = controller;
    this._view = view;
    this._view.bindController(controller);
};

Module.prototype.controller = function() {
    return this._controller;
};

Module.prototype.view = function() {
    return this._view;
};

Module.prototype.activate = function() {
    return mithril.module(this.view.el[0], this);
};

module.exports = {
    Module: Module
};
