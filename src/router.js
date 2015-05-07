var mithril = require("mithril");

function Router(options) {
    this._setOptions(options || {});

    this._route();
}

Router.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }

    if(!this.routes) {
        throw new Error("No routes specified");
    }

    if(this.$rootEl.length === 0) {
        throw new Error("No $rootElt specified");
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