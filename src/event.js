var PubSub = require("pubsub-js");

// Event layer on top of pubsubjs
function Events () {
    this._events = this.events();
    this._setEvents();
};

Events.prototype.events = function() {
    return {};
};

Events.prototype._setEvents = function() {
    for(var key in this._events) {
        var func = this._events[key];
        PubSub.subscribe(key, func);
    }
};

module.exports = {
    Events: Events
};
