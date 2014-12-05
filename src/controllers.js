var mithril = require("mithril");

var Controller = function(models) {
    for(var key in models) {
        this[key] = mithril.prop(models[key]);
    }
};

Controller.prototype.setProps = function(obj) {
    for(var key in obj) {
        this[key](obj[key])
    }
};

module.exports = {
    Controller: Controller
};
