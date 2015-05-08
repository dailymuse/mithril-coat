var mithril = require("mithril"),
    PubSub = require("pubsub-js");;

function Controller(obj) {
    this._setOptions(obj);
    this._events = this.events();
    this._setEvents();
};

Controller.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }
};

Controller.prototype.events = function() {
    return {};
};

Controller.prototype._setEvents = function() {
    for(var key in this._events) {
        var func = this._events[key];
        PubSub.subscribe(key, func.bind(this));
    }
};

// auto redraw is a wrapper around mithrils start and end computation
// for redrawing a view
Controller.prototype.autoredraw = function(cb, opts) {
    mithril.startComputation();

    try {
        cb.bind(this)(opts);
    } finally {
        mithril.endComputation();
    }
};

module.exports = {
    Controller: Controller
};
