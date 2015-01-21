var mithril = require("mithril"),
    events = require("./event.js");

var Module = function(options) {
    this._view = options.view;

    this._setOptions(options);

    events.Events.call(this);
};

Module.prototype = Object.create(events.Events.prototype);

Module.prototype.constructor = Module;

Module.prototype._setOptions = function(options) {
    for(var key in options) {
        if(key !== "view") {
            this[key] = options[key];
        }
    }

    this.options = options;
};

Module.prototype.activate = function() {
    var view = this._view;

    return mithril.module(this._view.$el[0], {
        controller: function() {
            return;
        }, 
        view: function() {
            return view.render();
        }
    });
};

module.exports = {
    Module: Module
};
