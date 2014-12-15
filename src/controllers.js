var mithril = require("mithril");

var Controller = function(obj) {
    for(var key in obj) {
        if(key === "props") {
            this._createProps(obj[key]);
        } else {
            this[key] = obj[key];
        }
    }
};

Controller.prototype._setOptions = function(options) {
    for(var key in options) {
        this[key] = options[key];
    }
};

// auto redraw is a wrapper around mithrils start and end computation
// for redrawing a view
Controller.prototype.autoredraw = function(cb, opts) {
    mithril.startComputation();
    try {   
        cb(opts);
    }
    finally {
        mithril.endComputation();
    }
};

module.exports = {
    Controller: Controller
};
