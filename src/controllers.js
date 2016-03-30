var mithril = require("mithril"),
    PubSub = require("pubsub-js");;

function Controller(obj) {
    this._setOptions(obj);
    this._events = this.events();
    this._setEvents();
};

Controller.prototype._setOptions = function(options) {
    var key;
    
    for (key in options) {
        this[key] = options[key];
    }

    this.options = options;
};

// the events to be bound to pubsub-js
Controller.prototype.events = function() {
    return {};
};

// set events for pubsub-js
Controller.prototype._setEvents = function() {
    var key,
        func;

    for (key in this._events) {
        func = this._events[key];
        PubSub.subscribe(key, func.bind(this));
    }
};

/* 
wrapper around mithrils start and end computation for redrawing a view
@param [Function] cb a callback to take 'action' during the autoredraw
@param [Object] opts object of options that are passed to the callback
*/
Controller.prototype.autoredraw = function(cb, opts) {
    mithril.startComputation();

    try {
        cb.bind(this)(opts);
    } catch (e) {
        coat.publishSync("autoredraw-error", e);
    } finally {
        mithril.endComputation();
    }
};

module.exports = {
    Controller: Controller
};
