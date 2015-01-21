var PubSub = require("pubsub-js");

// Event layer on top of pubsubjs
var Events = function() {
    // used to cancel specific pubsub tokens
    this._tokenEvents = {};

    this._events = this.events();
    this._setEvents();
};

Events.prototype.events = function() {
    return {};
};

Events.prototype._setEvents = function() {
    for(var key in this._events) {
        var func = this._events[key];
        var token = PubSub.subscribe(key, func);

        this._tokenEvents[key] = {
            func: this._events[key],
            token: token
        }
    }
};

Events.prototype.unsubscribeTopic = function(topicName, func) {
    var events = this._tokenEvents[topicName];

    for(var i=0; i<events.length; i++) {
        if(func === events[i].func) {
            PubSub.unsubscribe(events[i].token);
        }
    }
};

module.exports = {
    Events: Events
};
