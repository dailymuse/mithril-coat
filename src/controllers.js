var mithril = require("mithril");

var Controller = function(models) {
    for(var key in models) {
        this[key] = mithril.prop(models[key]);
    }
};

module.exports = {
    Controller: Controller
};
