var events = require("./event"),
    mithril = require("mithril");

var Router = function(options) {
    this._setOptions(options || {});

    events.Events.call(this);

    this._route();
}

Router.prototype = Object.create(events.Events.prototype);

Router.prototype.constructor = Router;

Router.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }

    if(!this.routes) {
        throw new Error("No routes specified for ");
    }

    if(this.$rootEl.length === 0) {
        throw new Error("No $rootElt specified for ");
    }

    this.options = options;

    mithril.route.mode = "pathname";
    this.root = "/";
};

Router.prototype._route = function() {
    mithril.route(this.$rootEl[0], this.root, this.routes())
};

module.exports = {
    Router: Router
}