var events = require("./event"),
    mithril = require("mithril");

var Router = function(options) {
    events.Events.call(this);

    this._setOptions(options || {});
    this._route();
}

Router.prototype = Object.create(events.Events.prototype);

Router.prototype.constructor = Router;

Router.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }

    if(!this.routes) {
        throw new Error("No routes specified for " + this.constructor.name + "router.");
    }

    this.options = options;

    if (this.mode === "pathname") {
        this.root = "/";
    }

};

Router.prototype._route = function() {
    mithril.route(this.rootElt, this.root, this.routes)
};

module.exports = {
    Router: Router
}