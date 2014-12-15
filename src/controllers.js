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

module.exports = {
    Controller: Controller
};
