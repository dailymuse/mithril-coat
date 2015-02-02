// Used to generate a unique view ID
var uniqueViewId = 0;

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// Coat.View. Basically a stripped-down version of Backbone.View.
var View = function(options) {
    this._setOptions(options || {});
    this._events = this.domEvents();

    if(this.$el) {
        this._delegateEvents();
    }
};

View.prototype.domEvents = function() {
    return {}
};

View.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }

    this.options = options;
    this.cid = 'view' + (uniqueViewId++);
};

// used by templated view when el isn't set an initialization
View.prototype.setEl = function(el) {
    this.$el = el;
    this._delegateEvents();
}

View.prototype.$ = function(selector) {
    return this.$el.find(selector);
};

View.prototype.addEvent = function(eventName, selector, method) {
    if(arguments.length == 2) {
        method = selector;
        selector = null;
    }

    if('string' == typeof(method)) {
        method = this[method];

        if (!method) {
            throw new Error("Method `" + method + "` bound to event `" + eventName + "` does not exist in this view");
        }

        method = $.proxy(method, this);
    }

    eventName += '.delegateEvents' + this.cid;

    if(selector) {
        this.$el.on(eventName, selector, method);
    } else {
        this.$el.on(eventName, method);
    }

    return this;
};

View.prototype.removeEvent = function(eventName, selector, method) {
    if(arguments.length == 2) {
        method = selector;
        selector = null;
    }

    if('string' == typeof(method)) {
        method = $.proxy(method, this);
    }

    if(selector) {
        this.$el.off(eventName, selector, method);
    } else {
        this.$el.off(eventName, method);
    }

    return this;
};

View.prototype._delegateEvents = function() {
    if(!this.$el) {
        throw new Error("No $el bound to " + this.constructor.name + " - view can't bind events");
    }

    this._undelegateEvents();

    for(var key in this._events) {
        var match = key.match(delegateEventSplitter),
            eventName = match[1], 
            selector = match[2],
            method = this[this._events[key]].bind(this);

        this.addEvent(eventName, selector, method);
    }

    return this;
};

View.prototype._undelegateEvents = function() {
    this.$el.off('.delegateEvents' + this.cid);
    return this;
};

var TemplatedView = function(options) {
    View.call(this, options);
};

TemplatedView.prototype = Object.create(View.prototype);

TemplatedView.prototype.constructor = TemplatedView;

TemplatedView.prototype.render = function() {
    return this.template(this, this.state);
};

module.exports = {
    View: View,
    TemplatedView: TemplatedView
};
