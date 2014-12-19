var mithril = require("mithril");

var Controller = function(obj) {
    this._setOptions(obj);
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
        cb.bind(this)(opts);
    } finally {
        mithril.endComputation();
    }
};

// bind view to controller - by default the class name will be used 
Controller.prototype.bindView = function(view) {
    this[view.constructor.name] = view;
}

module.exports = {
    Controller: Controller
};
