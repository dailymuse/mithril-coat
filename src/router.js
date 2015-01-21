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
        throw new Error("No routes specified for " + this.constructor.name + " router.");
    }

    if(this.$rootElt.length === 0) {
        throw new Error("No $rootElt specified for " + this.constructor.name + " router.");
    }

    this.options = options;

    if(this.mode) {
        mithril.route.mode = this.mode;
    }
    

    if(this.mode === "pathname") {
        this.root = "/";
    }
};

Router.prototype._route = function() {
    mithril.route(this.$rootElt[0], this.root, this.routes())
};

module.exports = {
    Router: Router
}