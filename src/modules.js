var mithril = require("mithril"),
    PubSub = require("pubsub-js");

var Module = function(options) {
    this._view = options.view;

    this._setOptions(options);
    this._events = this.events();
    this._setEvents();
};

Module.prototype._setOptions = function(options) {
    for(var key in options) {
        if(key !== "view") {
            this[key] = options[key];
        }
    }

    this.options = options;

    // used to cancel specific pubsub tokens
    this._tokenEvents = {};
};

Module.prototype.events = function() {
    return {};
};

Module.prototype._setEvents = function() {
    for(var key in this._events) {
        var func = this._events[key];
        var token = PubSub.subscribe(key, func);

        this._tokenEvents[key] = {
            func: this._events[key],
            token: token
        }
    }
};

Module.prototype.unsubscribeTopic = function(topicName, func) {
    var events = this._tokenEvents[topicName];

    for(var i=0; i<events.length; i++) {
        if(func === events[i].func) {
            PubSub.unsubscribe(events[i].token);
        }
    }
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
