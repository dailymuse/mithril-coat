var mithril = require("mithril"),
    events = require("./event");

var Module = function(controller, view) {
    this._controller = controller;
    this._view = view;

    this.setEvents();
};

// TO DO FIGURE OUT HOW TO PASS STATE HERE
Module.prototype.controller = function() {
    return this._controller;
};

Module.prototype.view = function(ctrl) {
    console.log(this._controller)
    return this._view.render(this._controller.state);
};

Module.prototype.activate = function() {
    return mithril.module(this._view.$el[0], this);
};

module.exports = {
    Module: Module
};
