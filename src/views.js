// Used to generate a unique view ID
var uniqueViewId = 0;

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// Coat.View. Basically a stripped-down version of Backbone.View.
function View(options) {
    this._setOptions(options || {});
    this._events = this.domEvents();

    // if there is an $el then set the events - this allows TemplatedView's to
    // not have events bound till after it is rendered on the page
    if (this.$el) {
        this._delegateEvents();
    }
};

/*
set the dom events that the view should listen to. Dom events takes a similar 
approach to backbone dom events and serves as a way to have event delegation on 
the view's $el. domEvents returns a mapping of `"[events] [selector]"` to a 
function on the view that will be called when that event occurs. 
*/
View.prototype.domEvents = function() {
    return {};
};

View.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }

    this.options = options;
    this.cid = 'view' + (uniqueViewId++);
};

/*
returns the DOM nodes that match the selector inside the $el
@param [String] selector the selector to search for in the lements
*/
View.prototype.$ = function(selector) {
    return this.$el.find(selector);
};

View.prototype.addEvent = function(eventName, selector, method) {
    if (arguments.length == 2) {
        method = selector;
        selector = null;
    }

    if (typeof(method) === "string") {
        method = this[method];

        if (!method) {
            throw new Error("Method `" + method + "` bound to event `" + eventName + "` does not exist in this view");
        }

        method.bind(this);
    }

    eventName += ".delegateEvents" + this.cid;

    if (selector) {
        this.$el.on(eventName, selector, method);
    } else {
        this.$el.on(eventName, method);
    }

    return this;
};

View.prototype.removeEvent = function(eventName, selector, method) {
    if (arguments.length === 2) {
        method = selector;
        selector = null;
    }

    if (typeof(method) === "string") {
        method = $.proxy(method, this);
    }

    if (selector) {
        this.$el.off(eventName, selector, method);
    } else {
        this.$el.off(eventName, method);
    }

    return this;
};

View.prototype._delegateEvents = function() {
    if (!this.$el) {
        throw new Error("No $el bound to " + this.constructor.name + " - view can't bind events");
    }

    this._undelegateEvents();

    for (var key in this._events) {
        var match = key.match(delegateEventSplitter),
            eventName = match[1], 
            selector = match[2],
            method = this[this._events[key]].bind(this);

        this.addEvent(eventName, selector, method);
    }

    return this;
};

View.prototype._undelegateEvents = function() {
    if (this.$el) {
        this.$el.off('.delegateEvents' + this.cid);
    }
    return this;
};

var TemplatedView = function(options) {
    View.call(this, options);

    this._tempSubviews = {};
    this._subviews = {};

    return this;
};

TemplatedView.prototype = Object.create(View.prototype);

TemplatedView.prototype.constructor = TemplatedView;

// renders the mithril coat template
TemplatedView.prototype.render = function() {
    return this.template(this, this.state);
};

/**
configurate the dom events for the view - called using the mithril key config
in the mithril template, by the div that is wrapped around all templated views.
The elements that are passed in are passed by mithril coat
@param [Dom Node] element the dom node that was generated
@param [Boolean] isInit was the initialized
@param [Object] context the context of the view
*/
TemplatedView.prototype._configDomEvents = function(element, isInit, context) {
    // only bind events if the $el on the view doesn't already exist or the elt
    // changes. This way we aren't constantly reconfiguring dom elts on every 
    // redraw.
    if (!this.$el || this.$el[0] !== element) {
        this._undelegateEvents();

        this.$el = $(element);
        this._delegateEvents();
    }

    // calling the config func for this view after events have been bound
    this.config(element, isInit, context);

    // clean up references to subviews and unload the subviews
    for (var cid in this._subviews) {
        if (!(cid in this._tempSubviews)) {
            this._subviews[cid]._onunload();
            delete this._subviews[cid];
        }        
    }

    this._subviews = this._tempSubviews;
    this._tempSubviews = {};

    return this;
};

/**
Called each time the view is rendered to the page. By Default returns null
@param [Dom Node] element the dom node that was generated
@param [Boolean] isInit was the initialized
@param [Object] context the context of the view
*/
TemplatedView.prototype.config = function(element, isInit, context) {
    return null;
};

/*
unloads the given view -> undelegate events, clear the views subviews
*/
TemplatedView.prototype._onunload = function() {
    this._undelegateEvents();
    this._clearSubviews();
    this.onunload();
    return this;
};

/*
called every time the function is unloaded
*/
TemplatedView.prototype.onunload = function() {
    return null;
};

/*
called by mithril coat template compiler to add a subview to the current view
*/
View.prototype._addSubview = function(view) {
    this._tempSubviews[view.cid] = view;
    return this;
};


/*
clear all of a views subviews. called when a view is unloaded
*/
View.prototype._clearSubviews = function() {
    for (var viewName in this._subviews) {
        this._subviews[viewName]._onunload();
        delete this._subviews[viewName];
    }

    this._subviews = {};
    return this;
};

module.exports = {
    View: View,
    TemplatedView: TemplatedView
};
