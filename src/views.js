var templates = require("./templates");

// Used to generate a unique view ID
var uniqueViewId = 0;

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// Shadow.View. Basically a stripped-down version of Backbone.View.
var View = function(options) {
    this._setOptions(options || {});
    this._delegateEvents();
};

View.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }

    if(!this.$el) {
        throw new Error("No $el bound to " + this.constructor.name + " - view can't bind events");
    }

    this.options = options;
    this.cid = 'view' + (uniqueViewId++);
};

View.prototype.$ = function(selector) {
    return this.$el.find(selector);
};

View.prototype.on = function(eventName, selector, method) {
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

View.prototype.off = function(eventName, selector, method) {
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
    this._undelegateEvents();

    for(var key in this.events) {
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        var method = this[this.events[key]].bind(this);

        eventName += '.delegateEvents' + this.cid;

        this.$el.on(eventName, selector, method);
    }

    return this;
};

View.prototype._undelegateEvents = function() {
    this.$el.off('.delegateEvents' + this.cid);
    return this;
};

var TemplatedView = function(options) {
    View.call(this, options)
};

TemplatedView.prototype = Object.create(View.prototype);

TemplatedView.prototype.constructor = TemplatedView;

TemplatedView.prototype.render = function() {
    return templates.render(this.template, this, this.controller);
};

TemplatedView.prototype.bindController = function(controller) {
    this.controller = controller;
};

module.exports = {
    View: View,
    TemplatedView: TemplatedView
};
