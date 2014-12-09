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

Controller.prototype._createProps = function(models) {
    for(var key in models) {
        this[key] = mithril.prop(models[key]);
    }
};

// assumes that the obj keys have been set with mithril prop previously
Controller.prototype.setProps = function(obj) {
    for(var key in obj) {
        this[key](obj[key])
    }
};

module.exports = {
    Controller: Controller
};
